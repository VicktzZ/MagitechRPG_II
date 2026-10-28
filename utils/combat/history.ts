import type { Combat } from '@models';

/**
 * Histórico reversível do combate ("Desfazer" do mestre). Cada ação importante grava o que mudou no combate (campo a campo) e na vida e
 * mana das fichas; desfazer devolve **só esses campos** ao valor de antes, então o que aconteceu depois e não tem a ver com o evento
 * (um jogador gastando MP, outro combatente tomando dano) fica como está. Se um campo do evento já mudou de novo desde então, há
 * conflito: o servidor recusa e lista os conflitos, e o mestre pode desfazer mesmo assim (sobrescreve). Tudo aqui é puro.
 *
 * Valor ausente vira `null` (o Firestore não guarda `undefined`). Os logs não entram: o log e o chat são a história, e desfazer
 * acrescenta uma linha "o mestre desfez..." em vez de apagar o que aconteceu.
 */

type Json = unknown;

/** O que o combate guarda, em forma de dados puros (cópia por JSON): campos soltos, a ordem e cada combatente */
export interface CombatSnapshot {
    fields: Record<string, Json>;
    order: string[];
    combatants: Record<string, Record<string, Json>>;
}

export type CombatChange =
    | { scope: 'combat'; field: string; before: Json; after: Json }
    | { scope: 'order'; before: string[]; after: string[] }
    | { scope: 'combatant'; id: string; before: Record<string, Json> | null; after: Record<string, Json> | null }
    | { scope: 'field'; id: string; field: string; before: Json; after: Json };

/** Vida e mana de uma ficha */
export interface SheetChange {
    sheetId: string;
    stat: 'lp' | 'mp';
    before: number;
    after: number;
}

export type SheetVitals = Record<string, { lp: number; mp: number }>;

/** Um evento do histórico como o mestre o vê (sem as mudanças, que só o servidor lê ao desfazer) */
export interface CombatEventItem {
    id: string;
    action: string;
    /** O que o mestre lê: "Dano aplicado", "Turno passado"... */
    label: string;
    byName: string;
    at: string;
    summary: string[];
    undone: boolean;
    undoneAt?: string;
    undoneByName?: string;
}

/** Campos do combate que ficam de fora do histórico (a lista de logs vai à parte) */
/**
 * Campos do combate que ficam de fora do histórico: a lista de combatentes (vai à parte), os logs e os **ataques pendentes** (desfazer a
 * resolução de um ataque devolve a vida e a Reação, mas não põe o ataque de volta na fila: isso apagaria os ataques declarados depois) e as
 * **oportunidades de ataque** (duram só o turno de quem se move; desfazer a passagem do turno não as traz de volta) e a **matriz de percepção**
 * (`unseen`: é decisão do mestre, não consequência de uma ação da luta, e desfazer um dano não deve esconder nem revelar ninguém)
 */
const EXCLUDED_FIELDS = new Set([ 'combatants', 'logs', 'pendingAttacks', 'opportunities', 'unseen' ]);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;

const orNull = (value: Json): Json => (value === undefined ? null : value);

export function deepEqual(a: Json, b: Json): boolean {
    const left = orNull(a);
    const right = orNull(b);
    if (left === right) return true;
    if (typeof left !== typeof right || left === null || right === null || typeof left !== 'object') return false;
    if (Array.isArray(left) !== Array.isArray(right)) return false;

    if (Array.isArray(left) && Array.isArray(right)) {
        return left.length === right.length && left.every((entry, index) => deepEqual(entry, right[index]));
    }

    const leftRecord = left as Record<string, Json>;
    const rightRecord = right as Record<string, Json>;
    const keys = new Set([ ...Object.keys(leftRecord), ...Object.keys(rightRecord) ]);
    for (const key of keys) {
        if (!deepEqual(leftRecord[key], rightRecord[key])) return false;
    }
    return true;
}

/** Foto do combate agora: dados puros, sem os logs */
export function snapshotCombat(combat: Combat): CombatSnapshot {
    const fields: Record<string, Json> = {};
    for (const [ key, value ] of Object.entries(combat)) {
        if (EXCLUDED_FIELDS.has(key) || typeof value === 'function') continue;
        fields[key] = orNull(clone(value));
    }

    const combatants: CombatSnapshot['combatants'] = {};
    const order: string[] = [];
    for (const combatant of combat.combatants ?? []) {
        order.push(combatant.id);
        combatants[combatant.id] = clone(combatant) as unknown as Record<string, Json>;
    }
    return { fields, order, combatants };
}

/** O que mudou entre as duas fotos (vazio se nada) */
export function diffSnapshots(before: CombatSnapshot, after: CombatSnapshot): CombatChange[] {
    const changes: CombatChange[] = [];

    for (const field of new Set([ ...Object.keys(before.fields), ...Object.keys(after.fields) ])) {
        if (!deepEqual(before.fields[field], after.fields[field])) {
            changes.push({ scope: 'combat', field, before: orNull(before.fields[field]), after: orNull(after.fields[field]) });
        }
    }

    if (!deepEqual(before.order, after.order)) {
        changes.push({ scope: 'order', before: before.order, after: after.order });
    }

    for (const id of new Set([ ...Object.keys(before.combatants), ...Object.keys(after.combatants) ])) {
        const was = before.combatants[id];
        const now = after.combatants[id];
        if (!was || !now) {
            changes.push({ scope: 'combatant', id, before: was ?? null, after: now ?? null });
            continue;
        }
        for (const field of new Set([ ...Object.keys(was), ...Object.keys(now) ])) {
            if (!deepEqual(was[field], now[field])) {
                changes.push({ scope: 'field', id, field, before: orNull(was[field]), after: orNull(now[field]) });
            }
        }
    }

    return changes;
}

/** O que mudou na vida e na mana das fichas (só as que existem nas duas fotos) */
export function diffSheetVitals(before: SheetVitals, after: SheetVitals): SheetChange[] {
    const changes: SheetChange[] = [];
    for (const [ sheetId, was ] of Object.entries(before)) {
        const now = after[sheetId];
        if (!now) continue;
        for (const stat of [ 'lp', 'mp' ] as const) {
            if (was[stat] !== now[stat]) changes.push({ sheetId, stat, before: was[stat], after: now[stat] });
        }
    }
    return changes;
}

// ─────────────────────────────────────────────
// Desfazer
// ─────────────────────────────────────────────

/** Valor que o combate tem agora no lugar que a mudança tocou */
function currentValue(current: CombatSnapshot, change: CombatChange): Json {
    switch (change.scope) {
    case 'combat': return orNull(current.fields[change.field]);
    case 'order': return current.order;
    case 'combatant': return current.combatants[change.id] ?? null;
    case 'field': return current.combatants[change.id] ? orNull(current.combatants[change.id]![change.field]) : null;
    }
}

/** As mudanças do evento cujo campo já não está como o evento deixou (algo mexeu nele depois) */
export function findConflicts(current: CombatSnapshot, changes: readonly CombatChange[]): CombatChange[] {
    return changes.filter(change => !deepEqual(currentValue(current, change), change.after));
}

/** Devolve ao combate os valores de antes do evento; mexe no `combat` recebido */
export function revertChanges(combat: Combat, changes: readonly CombatChange[]): void {
    const list = combat.combatants ?? (combat.combatants = []);
    const indexOf = (id: string): number => list.findIndex(entry => entry.id === id);

    // 1. quem entrou sai e quem saiu volta
    for (const change of changes) {
        if (change.scope !== 'combatant') continue;
        const index = indexOf(change.id);
        if (change.before === null) {
            if (index >= 0) list.splice(index, 1);
        } else if (index >= 0) {
            list[index] = clone(change.before) as unknown as typeof list[number];
        } else {
            list.push(clone(change.before) as unknown as typeof list[number]);
        }
    }

    // 2. campos soltos do combate e de cada combatente
    const target = combat as unknown as Record<string, Json>;
    for (const change of changes) {
        if (change.scope === 'combat') {
            if (change.before === null) Reflect.deleteProperty(target, change.field);
            else target[change.field] = clone(change.before);
        } else if (change.scope === 'field') {
            const found = list[indexOf(change.id)] as unknown as Record<string, Json> | undefined;
            if (!found) continue;
            if (change.before === null) Reflect.deleteProperty(found, change.field);
            else found[change.field] = clone(change.before);
        }
    }

    // 3. a ordem de antes, só com quem ainda está no combate; quem chegou depois fica no fim, na ordem em que estava
    const orderChange = changes.find((change): change is Extract<CombatChange, { scope: 'order' }> => change.scope === 'order');
    if (orderChange) {
        const rank = new Map(orderChange.before.map((id, position) => [ id, position ]));
        const known = list.filter(entry => rank.has(entry.id)).sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
        const extras = list.filter(entry => !rank.has(entry.id));
        list.splice(0, list.length, ...known, ...extras);
    }

    if (combat.currentTurnIndex >= list.length || combat.currentTurnIndex < 0) combat.currentTurnIndex = 0;
}

// ─────────────────────────────────────────────
// Texto para o mestre
// ─────────────────────────────────────────────

const FIELD_LABEL: Record<string, string> = {
    currentLp: 'Vida',
    maxLp: 'Vida máxima',
    currentMp: 'Mana',
    maxMp: 'Mana máxima',
    mpSpentThisTurn: 'MP gasto na rodada',
    mpLimitOverride: 'Limite de MP liberado',
    hasActed: 'Já agiu',
    initiativeRoll: 'Dado de iniciativa',
    initiativeBonus: 'Bônus de iniciativa',
    initiativeTotal: 'Iniciativa',
    actions: 'Ações',
    effects: 'Efeitos'
};

/** Campos que mudam em todos os combatentes de uma vez (virada de rodada): uma linha só para o grupo */
const GROUPED_FIELDS = new Set([ 'hasActed', 'initiativeRoll', 'initiativeBonus', 'initiativeTotal', 'actions', 'mpSpentThisTurn', 'mpLimitOverride' ]);

const PHASE_LABEL: Record<string, string> = { INITIATIVE: 'Iniciativa', ACTION: 'Ação', ENDED: 'Encerrado' };

const COMBAT_FIELD_LABEL: Record<string, string> = { round: 'Round', phase: 'Fase', isActive: 'Estado do combate', currentTurnIndex: 'A vez' };

const MAX_SUMMARY_LINES = 12;

const formatValue = (value: Json): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'sim' : 'não';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const phaseLabel = (value: Json): string => PHASE_LABEL[String(value)] ?? formatValue(value);

interface NamedEffect { id?: string; snapshot?: { name?: string } }

const effectNames = (value: Json): Map<string, string> => {
    const names = new Map<string, string>();
    for (const effect of Array.isArray(value) ? value as NamedEffect[] : []) {
        if (effect?.id) names.set(effect.id, effect.snapshot?.name ?? 'efeito');
    }
    return names;
};

function describeEffects(before: Json, after: Json): string {
    const was = effectNames(before);
    const now = effectNames(after);
    const gained = [ ...now ].filter(([ id ]) => !was.has(id)).map(([ , name ]) => name);
    const lost = [ ...was ].filter(([ id ]) => !now.has(id)).map(([ , name ]) => name);
    const parts = [ ...gained.map(name => `ganhou ${name}`), ...lost.map(name => `perdeu ${name}`) ];
    return parts.length > 0 ? parts.join(', ') : 'atualizados';
}

/**
 * Linhas legíveis do que o evento mudou (para o histórico): vida, mana e efeitos de cada combatente, round, fase e vez; o que muda em
 * todos de uma vez (virada de rodada) vira uma linha por campo. `names` dá o nome de cada combatente (id → nome).
 */
export function summarizeChanges(changes: readonly CombatChange[], names: Readonly<Record<string, string>>, sheets: readonly SheetChange[] = []): string[] {
    const nameOf = (id: string): string => names[id] ?? 'Combatente';
    const lines: string[] = [];
    const grouped = new Map<string, number>();
    const hasMembership = changes.some(change => change.scope === 'combatant');

    for (const change of changes) {
        if (change.scope === 'combat') {
            if (change.field === 'round') lines.push(`Round ${formatValue(change.before)} → ${formatValue(change.after)}`);
            else if (change.field === 'phase') lines.push(`Fase: ${phaseLabel(change.before)} → ${phaseLabel(change.after)}`);
            else if (change.field === 'isActive') lines.push(change.after === true ? 'Combate reaberto' : 'Combate encerrado');
            else if (change.field === 'currentTurnIndex') {
                const order = changes.find((entry): entry is Extract<CombatChange, { scope: 'order' }> => entry.scope === 'order');
                const ids = order ? order.after : Object.keys(names);
                const beforeIds = order ? order.before : ids;
                const was = beforeIds[Number(change.before)];
                const now = ids[Number(change.after)];
                if (was && now && was !== now) lines.push(`Vez: ${nameOf(was)} → ${nameOf(now)}`);
            }
        } else if (change.scope === 'order') {
            if (!hasMembership) lines.push('Ordem de iniciativa alterada');
        } else if (change.scope === 'combatant') {
            lines.push(change.after === null ? `${nameOf(change.id)} saiu do combate` : `${nameOf(change.id)} entrou no combate`);
        } else if (GROUPED_FIELDS.has(change.field)) {
            grouped.set(change.field, (grouped.get(change.field) ?? 0) + 1);
        } else if (change.field === 'effects') {
            lines.push(`${nameOf(change.id)}: ${describeEffects(change.before, change.after)}`);
        } else {
            lines.push(`${nameOf(change.id)}: ${FIELD_LABEL[change.field] ?? change.field} ${formatValue(change.before)} → ${formatValue(change.after)}`);
        }
    }

    for (const [ field, count ] of grouped) {
        const plural = count === 1 ? 'combatente' : 'combatentes';
        lines.push(`${FIELD_LABEL[field] ?? field}: ${count} ${plural}`);
    }

    for (const sheet of sheets) {
        lines.push(`Ficha de ${nameOf(sheet.sheetId)}: ${sheet.stat === 'lp' ? 'LP' : 'MP'} ${sheet.before} → ${sheet.after}`);
    }

    return lines.length > MAX_SUMMARY_LINES
        ? [ ...lines.slice(0, MAX_SUMMARY_LINES - 1), `…e mais ${lines.length - (MAX_SUMMARY_LINES - 1)} alterações` ]
        : lines;
}

/** O que o conflito diz ao mestre: onde o evento deixou um valor e hoje há outro */
export function describeConflicts(
    changes: readonly CombatChange[],
    names: Readonly<Record<string, string>>,
    sheets: readonly SheetChange[] = []
): string[] {
    const nameOf = (id: string): string => names[id] ?? 'Combatente';
    const describe = (change: CombatChange): string => {
        if (change.scope === 'combat') return `${COMBAT_FIELD_LABEL[change.field] ?? change.field} mudou de novo`;
        if (change.scope === 'order') return 'A ordem de iniciativa mudou de novo';
        if (change.scope === 'combatant') return `${nameOf(change.id)} foi alterado depois`;
        return `${nameOf(change.id)}: ${FIELD_LABEL[change.field] ?? change.field} mudou de novo`;
    };
    const lines = changes.map(describe);
    for (const sheet of sheets) {
        lines.push(`Ficha de ${nameOf(sheet.sheetId)}: ${sheet.stat === 'lp' ? 'LP' : 'MP'} mudou de novo`);
    }
    return [ ...new Set(lines) ];
}
