import { HIDDEN_CAUSES, MAX_UNSEEN, type HiddenCause, type UnseenData } from './awareness';

/**
 * A matriz de percepção (`awareness.ts`) é **segredo do mestre**: quem se esconde de quem (uma criatura emboscada, um aliado invisível) entrega a cena a quem lê o documento da campanha,
 * e qualquer usuário logado o lê pelo ID. Por isso a matriz vive à parte, em `campaigns/{id}/gmData/awareness` (regra do Firestore só para o mestre, `utils/firestore/gmData.ts`), e o
 * `session.combat` da campanha **não carrega** `unseen`. Este módulo é puro: valida o que vem do banco, junta de volta no navegador do mestre e separa o que cada jogador pode saber.
 *
 * **Compatibilidade**: o combate que já estava rolando quando isto entrou ainda carrega a matriz antiga em `session.combat.unseen`. Enquanto o documento privado não existe, ela vale; a primeira
 * ação de combate depois da mudança a leva para o documento e a tira da campanha (ver `resolveUnseen`).
 */

/** O id do documento privado da matriz */
export const AWARENESS_DOC_ID = 'awareness';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 120): string | null => (typeof value === 'string' && value.trim() !== '' && value.length <= max ? value : null);

/** Um par vindo do banco, limpo; `null` se não serve (faltam campos ou a causa é desconhecida) */
function sanitizeEntry(raw: unknown): UnseenData | null {
    if (!isRecord(raw)) return null;

    const id = text(raw['id']);
    const hiderId = text(raw['hiderId']);
    const observerId = text(raw['observerId']);
    const cause = HIDDEN_CAUSES.find(candidate => candidate === raw['cause']);
    if (!id || !hiderId || !observerId || !cause) return null;

    return {
        id,
        hiderId,
        hiderName: text(raw['hiderName']) ?? '',
        observerId,
        observerName: text(raw['observerName']) ?? '',
        cause,
        createdAt: text(raw['createdAt'], 40) ?? ''
    };
}

/** Os pares limpos (o que vem do documento ou de uma versão antiga do combate): até 60, os mais novos */
export function sanitizeAwarenessEntries(raw: unknown): UnseenData[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(sanitizeEntry).filter((entry): entry is UnseenData => entry !== null).slice(-MAX_UNSEEN);
}

/** Um documento de `campaigns/{id}/gmData` como o Firestore o entrega ao navegador do mestre */
interface DocLike {
    id: string;
    data: Record<string, unknown>;
}

/** A matriz do documento privado dentre os documentos de `gmData`; `null` se o documento não existe (matriz vazia não tem documento) */
export function awarenessFromDocs(docs: readonly DocLike[]): UnseenData[] | null {
    const doc = docs.find(candidate => candidate.id === AWARENESS_DOC_ID && candidate.data['kind'] === 'awareness');
    return doc ? sanitizeAwarenessEntries(doc.data['entries']) : null;
}

/**
 * A matriz que vale: a do documento privado, se ele existe; senão a que o combate antigo ainda carrega; senão vazia. É a mesma conta no servidor (que grava o documento) e no navegador do mestre.
 * Sem documento a matriz do combate vale mesmo vazia, então o fim do combate (que apaga o documento) não ressuscita nada.
 */
export function resolveUnseen(privateEntries: readonly UnseenData[] | null | undefined, legacy: readonly UnseenData[] | undefined): UnseenData[] {
    return privateEntries ? [ ...privateEntries ] : sanitizeAwarenessEntries(legacy);
}

/**
 * O combate do navegador do mestre com a matriz do documento privado juntada (as telas do mestre leem `combat.unseen` como sempre). Sem documento fica como está (matriz antiga do
 * combate, se houver). Devolve o mesmo objeto quando não há o que juntar.
 */
export function attachAwareness<C extends object>(combat: C, privateEntries: readonly UnseenData[] | null): C {
    return privateEntries ? { ...combat, unseen: [ ...privateEntries ] } : combat;
}

/** O combate como um **não-mestre** pode vê-lo: sem a matriz de percepção (ela é do mestre). Devolve o mesmo objeto quando não carrega nenhuma */
export function combatWithoutUnseen<C extends object>(combat: C): C {
    if (!('unseen' in combat)) return combat;
    return Object.fromEntries(Object.entries(combat).filter(([ key ]) => key !== 'unseen')) as C;
}

/** A campanha como um não-mestre pode vê-la: o combate sem a matriz de percepção. Devolve a mesma campanha quando não há o que tirar */
export function campaignWithoutUnseen<C extends object>(campaign: C): C {
    const session = (campaign as { session?: { combat?: object | null } | null }).session;
    const combat = session?.combat;
    if (!session || !combat || !('unseen' in combat)) return campaign;
    return { ...campaign, session: { ...session, combat: combatWithoutUnseen(combat) } };
}

/** O que o jogador escondido pode saber: de quem ele está fora da vista, e por quê */
export interface HiddenNotice {
    /** O combatente do jogador que está escondido */
    hiderId: string;
    observerName: string;
    cause: HiddenCause;
}

interface NoticeCombatant {
    id: string;
    type: 'player' | 'creature';
    odacId?: string;
}

/**
 * Os avisos por jogador (a chave é o id do **usuário**): cada jogador escondido sabe de quem está fora da vista, e só ele. Quem **não vê** o escondido não recebe nada, e a criatura escondida
 * não tem jogador a avisar. Jogador sem `odacId` (combatente criado sem dono) não tem para quem avisar.
 */
export function hiddenNoticesByUser(combatants: readonly NoticeCombatant[] | undefined, entries: readonly UnseenData[] | undefined): Map<string, HiddenNotice[]> {
    const byUser = new Map<string, HiddenNotice[]>();
    for (const entry of entries ?? []) {
        const hider = (combatants ?? []).find(candidate => candidate.id === entry.hiderId);
        if (!hider || hider.type !== 'player' || !hider.odacId) continue;

        const list = byUser.get(hider.odacId) ?? [];
        list.push({ hiderId: hider.id, observerName: entry.observerName, cause: entry.cause });
        byUser.set(hider.odacId, list);
    }
    return byUser;
}

/** Os avisos do documento do jogador (`campaigns/{id}/playerData/{userId}`), limpos */
export function sanitizeHiddenNotices(raw: unknown): HiddenNotice[] {
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item): HiddenNotice[] => {
        if (!isRecord(item)) return [];
        const hiderId = text(item['hiderId']);
        const cause = HIDDEN_CAUSES.find(candidate => candidate === item['cause']);
        return hiderId && cause ? [ { hiderId, observerName: text(item['observerName']) ?? '', cause } ] : [];
    });
}

/** As duas matrizes dizem o mesmo? (para o servidor só gravar quando mudou) */
export const sameUnseen = (a: readonly UnseenData[] | undefined, b: readonly UnseenData[] | undefined): boolean => JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
