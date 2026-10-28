import { randomUUID } from 'crypto';
import admin from 'firebase-admin';
import type { Combat } from '@models';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { adminGetDoc, adminUpdateDocInTransaction } from './adminDocs';
import type { CombatChange, CombatEventItem, SheetChange, SheetVitals } from '@utils/combat/history';

/**
 * Histórico do combate (ver `utils/combat/history.ts`): um documento por evento em `campaigns/{id}/combatEvents/{eventId}`. Só o servidor
 * acessa (as regras do Firestore negam o que não está listado) e só o mestre lê, pela rota `combat/events`. Guarda os últimos
 * `MAX_COMBAT_EVENTS`. As mudanças vão como texto JSON: o Firestore não aceita lista dentro de lista nem `undefined`, e o formato é nosso.
 */

export const MAX_COMBAT_EVENTS = 40;

/** Id do evento: o horário (para ordenar) e um sufixo; confira com `isCombatEventId` antes de usar um id que veio de fora */
const EVENT_ID = /^\d{15}-[0-9a-f]{8}$/;
export const isCombatEventId = (value: unknown): value is string => typeof value === 'string' && EVENT_ID.test(value);

export interface CombatEventInput {
    action: string;
    /** O que o mestre lê: "Dano aplicado", "Turno passado"... */
    label: string;
    byUserId: string;
    byName: string;
    changes: CombatChange[];
    sheets: SheetChange[];
    summary: string[];
}

export interface CombatEvent extends CombatEventItem {
    byUserId: string;
    changes: CombatChange[];
    sheets: SheetChange[];
}

const eventsOf = (campaignId: string) => {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId).collection('combatEvents');
};

const parseList = <T>(raw: unknown): T[] => {
    if (typeof raw !== 'string') return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
        return [];
    }
};

function toItem(id: string, data: FirebaseFirestore.DocumentData): CombatEventItem {
    return {
        id,
        action: String(data['action'] ?? ''),
        label: String(data['label'] ?? ''),
        byName: String(data['byName'] ?? ''),
        at: String(data['at'] ?? ''),
        summary: Array.isArray(data['summary']) ? data['summary'].map(String) : [],
        undone: data['undone'] === true,
        ...(data['undoneAt'] ? { undoneAt: String(data['undoneAt']) } : {}),
        ...(data['undoneByName'] ? { undoneByName: String(data['undoneByName']) } : {})
    };
}

/** Grava o evento e apaga os mais antigos que passam do limite; devolve o id */
export async function recordCombatEvent(campaignId: string, input: CombatEventInput, now: Date = new Date()): Promise<string> {
    const collection = eventsOf(campaignId);
    const id = `${String(now.getTime()).padStart(15, '0')}-${randomUUID().slice(0, 8)}`;

    await collection.doc(id).set({
        action: input.action,
        label: input.label,
        byUserId: input.byUserId,
        byName: input.byName,
        at: now.toISOString(),
        summary: input.summary,
        changesJson: JSON.stringify(input.changes),
        sheetsJson: JSON.stringify(input.sheets),
        undone: false
    });

    // Passou do limite: apaga os mais antigos. Conta pelo agregado (1 leitura) em vez de `offset`, que cobra cada documento pulado.
    const total = (await collection.count().get()).data().count;
    if (total > MAX_COMBAT_EVENTS) {
        const stale = await collection.orderBy('at', 'asc').limit(total - MAX_COMBAT_EVENTS).get();
        const batch = admin.firestore().batch();
        stale.docs.forEach(doc => { batch.delete(doc.ref); });
        await batch.commit();
    }

    return id;
}

/** Os eventos mais novos primeiro, sem as mudanças (que só o desfazer lê) */
export async function listCombatEvents(campaignId: string, limit = 30): Promise<CombatEventItem[]> {
    const { docs } = await eventsOf(campaignId).orderBy('at', 'desc').limit(Math.min(Math.max(1, limit), MAX_COMBAT_EVENTS)).get();
    return docs.map(doc => toItem(doc.id, doc.data()));
}

export async function getCombatEvent(campaignId: string, eventId: string): Promise<CombatEvent | null> {
    if (!isCombatEventId(eventId)) return null;

    const snapshot = await eventsOf(campaignId).doc(eventId).get();
    if (!snapshot.exists) return null;

    const data = snapshot.data()!;
    return {
        ...toItem(snapshot.id, data),
        byUserId: String(data['byUserId'] ?? ''),
        changes: parseList<CombatChange>(data['changesJson']),
        sheets: parseList<SheetChange>(data['sheetsJson'])
    };
}

export async function markCombatEventUndone(campaignId: string, eventId: string, byName: string, now: Date = new Date()): Promise<void> {
    await eventsOf(campaignId).doc(eventId).update({ undone: true, undoneAt: now.toISOString(), undoneByName: byName });
}

/** Apaga todo o histórico (combate novo, ou campanha excluída: o Firestore não apaga subcoleções junto com o documento) */
export async function deleteCombatEvents(campaignId: string): Promise<void> {
    await admin.firestore().recursiveDelete(eventsOf(campaignId));
}

// ─────────────────────────────────────────────
// Vida e mana das fichas
// ─────────────────────────────────────────────

/** Vida e mana de cada ficha de jogador no combate agora */
export async function readPlayerVitals(combat: Pick<Combat, 'combatants'>): Promise<SheetVitals> {
    const vitals: SheetVitals = {};
    const players = (combat.combatants ?? []).filter(combatant => combatant.type === 'player');

    await Promise.all(players.map(async (player) => {
        const sheet = await adminGetDoc<{ stats?: { lp?: unknown; mp?: unknown } }>('charsheets', player.id);
        if (!sheet) return;
        vitals[player.id] = { lp: Number(sheet.stats?.lp ?? 0) || 0, mp: Number(sheet.stats?.mp ?? 0) || 0 };
    }));
    return vitals;
}

/** As mudanças de ficha cujo valor já não é o que o evento deixou (a ficha mudou de novo depois) */
export async function findSheetConflicts(sheets: readonly SheetChange[]): Promise<SheetChange[]> {
    const conflicts: SheetChange[] = [];
    for (const change of sheets) {
        const sheet = await adminGetDoc<{ stats?: Record<string, unknown> }>('charsheets', change.sheetId);
        if (sheet && Number(sheet.stats?.[change.stat] ?? 0) !== change.after) conflicts.push(change);
    }
    return conflicts;
}

/** Devolve à ficha a vida e a mana de antes do evento (ficha que não existe mais é pulada) */
export async function restoreSheetStats(sheets: readonly SheetChange[]): Promise<void> {
    const bySheet = new Map<string, SheetChange[]>();
    for (const change of sheets) bySheet.set(change.sheetId, [ ...(bySheet.get(change.sheetId) ?? []), change ]);

    for (const [ sheetId, changes ] of bySheet) {
        if (!await adminGetDoc('charsheets', sheetId)) continue;

        await adminUpdateDocInTransaction<null>('charsheets', sheetId, () => ({
            fields: Object.fromEntries(changes.map(change => [ `stats.${change.stat}`, change.before ])),
            result: null
        }));
    }
}
