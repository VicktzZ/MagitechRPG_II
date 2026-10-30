import type { ActiveTest, TestResponse } from '@models/types/session';
import type { RPGSystem } from '@models/entities';
import { d20Pool, MAX_D20_DICE, type D20Keep } from './d20Rule';
import { sheetExpertisePenalty } from './combat/sheetOverweight';
import { computeAttributeInfluence, findSystemAttribute } from './systemLookups';

/**
 * Testes pedidos pelo mestre (DT contra um d20, com ou sem perícia).
 * Este módulo é usado pelo navegador e pelas rotas: a conta do resultado é uma só.
 */

/** Um pedido de teste sem resposta deixa de aparecer para quem entra depois disso */
export const TEST_REQUEST_TTL_MS = 10 * 60 * 1000;
export const MIN_TEST_DT = 1;
export const MAX_TEST_DT = 99;
/** Teto de d20 por teste (a regra dá de 1 a 5; sistemas customizados podem dar mais) */
export const MAX_TEST_DICE = MAX_D20_DICE;
export const MAX_TEST_BONUS = 100;

// ─────────────────────────────────────────────
// Quem deve responder / o que o mestre já recebeu
// ─────────────────────────────────────────────

export function isTestRequestFresh(request: Pick<ActiveTest, 'createdAt'>, now: number): boolean {
    const created = Date.parse(request.createdAt);
    return Number.isFinite(created) && now - created <= TEST_REQUEST_TTL_MS;
}

export function canRespondToTest(request: Pick<ActiveTest, 'isGroupTest' | 'selectedPlayers'>, userId: string): boolean {
    return request.isGroupTest || (request.selectedPlayers ?? []).includes(userId);
}

interface PendingTestOptions {
    userId: string | undefined;
    isGM: boolean;
    now: number;
    /** Testes que o jogador fechou sem rolar nesta sessão: não reabrem sozinhos */
    dismissedIds?: ReadonlySet<string>;
}

/** O teste que este jogador ainda deve responder, ou null */
export function getPendingTest(request: ActiveTest | null | undefined, { userId, isGM, now, dismissedIds }: PendingTestOptions): ActiveTest | null {
    if (!request?.id || !userId || isGM) return null;
    if (dismissedIds?.has(request.id)) return null;
    if (!isTestRequestFresh(request, now)) return null;
    if (request.responses?.[userId]) return null;
    return canRespondToTest(request, userId) ? request : null;
}

export const responseKey = (requestId: string, userId: string): string => `${requestId}:${userId}`;

/** Respostas ainda não vistas (`seen` guarda as chaves de `responseKey`), da mais antiga à mais nova */
export function collectNewResponses(
    request: ActiveTest | null | undefined,
    seen: ReadonlySet<string>
): Array<{ key: string; userId: string; response: TestResponse }> {
    if (!request?.id || !request.responses) return [];

    return Object.entries(request.responses)
        .map(([ userId, response ]) => ({ key: responseKey(request.id, userId), userId, response }))
        .filter(entry => !seen.has(entry.key))
        .sort((a, b) => a.response.respondedAt.localeCompare(b.response.respondedAt));
}

// ─────────────────────────────────────────────
// Rolagem
// ─────────────────────────────────────────────

/** Número de d20 a partir de um número já contado (sistema customizado: 1 + dados extras da influência; mínimo 1). O Magitech padrão usa `d20Pool` */
export function resolveDiceCount(mod: unknown): number {
    const n = Math.floor(Number(mod));
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, MAX_TEST_DICE);
}

export interface TestModifiers {
    dice: number;
    /** Qual d20 vale: o maior, ou o menor quando o modificador do atributo é negativo (regra única, `d20Rule.ts`) */
    keep: D20Keep;
    bonus: number;
}

/** Parte da ficha que o teste consulta */
export interface TestCharsheet {
    level?: number;
    systemId?: string;
    attributes?: unknown;
    mods?: { attributes?: unknown } | null;
    expertises?: unknown;
    /** Inventário e capacidade: o Sobrepeso tira das perícias de DES e VIG (ver `utils/combat/sheetOverweight.ts`) */
    inventory?: unknown;
    capacity?: unknown;
}

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? value as Record<string, unknown> : {};

/**
 * Dados e bônus do teste de uma perícia. É a **regra única de d20** (`d20Rule.ts`), a mesma do botão da perícia na
 * ficha e da iniciativa: o modificador do atributo padrão (`mods.attributes`) + 1 é o
 * número de d20 e vale o maior (modificador negativo rola 2 e vale o menor), e soma-se o valor da perícia. Em sistema customizado,
 * a influência do atributo (dados extras ou bônus fixo) vem da configuração dele.
 * Sem perícia, ou perícia que a ficha não tem, é um d20 puro.
 */
export function resolveTestModifiers(
    charsheet: TestCharsheet | null | undefined,
    expertise: string | undefined,
    rpgSystem?: Pick<RPGSystem, 'attributes'> | null
): TestModifiers {
    if (!charsheet || !expertise) return { dice: 1, keep: 'highest', bonus: 0 };

    const entry = asRecord(asRecord(charsheet.expertises)[expertise]);
    if (!('value' in entry) && !('defaultAttribute' in entry)) return { dice: 1, keep: 'highest', bonus: 0 };

    const base = Number(entry['value']) || 0;
    const attrRef = typeof entry['defaultAttribute'] === 'string' ? entry['defaultAttribute'] : '';

    if (rpgSystem && charsheet.systemId) {
        const attrDef = findSystemAttribute(rpgSystem, attrRef);
        const attrValue = attrDef ? Number(asRecord(charsheet.attributes)[attrDef.key]) || 0 : 0;
        const influence = computeAttributeInfluence(attrDef, attrValue, charsheet.level || 1);
        return { dice: resolveDiceCount(1 + influence.extraDice), keep: 'highest', bonus: base + influence.bonus };
    }

    const mods = asRecord(asRecord(charsheet.mods)['attributes']);
    return { ...d20Pool(mods[attrRef] ?? mods[attrRef.toLowerCase()]), bonus: base + sheetExpertisePenalty(charsheet, attrRef) };
}

export const rollD20 = (random: () => number = Math.random): number => Math.floor(random() * 20) + 1;

export function rollDice(dice: number, random: () => number = Math.random): number[] {
    return Array.from({ length: resolveDiceCount(dice) }, () => rollD20(random));
}

/** O resultado de um teste: o d20 que vale (o maior, ou o menor com `keep: 'lowest'`) mais o bônus, contra a DT. Única fonte da conta. */
export function evaluateTest({ rolls, bonus, dt, keep = 'highest' }: { rolls: readonly number[]; bonus: number; dt: number; keep?: D20Keep }): Pick<TestResponse, 'usedRoll' | 'total' | 'success'> {
    const usedRoll = keep === 'lowest' ? Math.min(...rolls) : Math.max(...rolls);
    const total = usedRoll + bonus;
    return { usedRoll, total, success: total >= dt };
}

// ─────────────────────────────────────────────
// Texto
// ─────────────────────────────────────────────

/**
 * Texto da rolagem no formato que o chat já reconhece. Com `label` (a perícia) é
 * `PERÍCIA - 2d20+3: [12, 7: 12] = 15`; sem ele, `1d20: [14] = 14`.
 */
export function formatTestRollText(
    response: Pick<TestResponse, 'rolls' | 'dice' | 'usedRoll' | 'bonus' | 'total'> & { keep?: 'lowest' },
    label?: string
): string {
    const rollPart = response.rolls.length > 1
        ? `${response.rolls.join(', ')}: ${response.usedRoll}`
        : `${response.usedRoll}`;

    if (!label) return `${response.dice}d20${response.bonus ? `${response.bonus > 0 ? '+' : ''}${response.bonus}` : ''}: [${rollPart}] = ${response.total}`;

    // Modificador negativo: vale o menor d20, e o nome diz isso para o resultado não parecer erro
    const name = `${label.toUpperCase()}${response.keep === 'lowest' ? ' (desvantagem)' : ''}`;
    return `${name} - ${response.dice}d20${response.bonus >= 0 ? '+' : ''}${response.bonus}: [${rollPart}] = ${response.total}`;
}

export function formatTestVerdict(userName: string, success: boolean): string {
    return `${userName} ${success ? 'passou' : 'não passou'} no teste!`;
}

/** Aviso para o mestre quando um jogador responde a um teste fechado */
export function formatResponseNotice(request: Pick<ActiveTest, 'expertise' | 'showResult'>, response: TestResponse): { message: string; severity: 'success' | 'error' | 'info' } {
    const roll = `${response.userName} rolou ${formatTestRollText(response, request.expertise)}`;
    if (!request.showResult) return { message: roll, severity: 'info' };

    return {
        message: `${roll}\n${formatTestVerdict(response.userName, response.success)}`,
        severity: response.success ? 'success' : 'error'
    };
}
