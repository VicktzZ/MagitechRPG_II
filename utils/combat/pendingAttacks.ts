import type { DamageKind, ExplainLine } from './engine/types';

/**
 * Ataque declarado e ainda não resolvido (ataque assistido). O jogador rola o acerto, escolhe o alvo e declara; rola o dano e ele se junta ao ataque;
 * o mestre vê a proposta do motor, escolhe a defesa do alvo, pode trocar qualquer valor e confirma (`resolve_attack`). Fica em `Combat.pendingAttacks`.
 *
 * **Só traz o que o jogador já mostrou no chat** (nome, tipo, total, d20 e dano): AP, fraquezas e resistências do alvo não entram aqui. O mestre
 * calcula a proposta no navegador dele com os dados da campanha (`attackProposal.ts`).
 */

export type AttackSource = 'weapon' | 'spell' | 'manual';

/** O que o cliente declara de um ataque (já limpo por `sanitizeAttackDeclaration`) */
export interface AttackDeclaration {
    source: AttackSource;
    /** Nome da arma ou da magia */
    name: string;
    /** Natureza do ataque: define a resistência do alvo. O mestre pode trocar ao resolver */
    kind: DamageKind;
    /** Elemento ou tipo físico do dano ("Cortante", "Fogo") */
    attackType?: string;
    /** Total do teste de acerto */
    attackTotal: number;
    /** Os d20 do teste e o bônus somado: o mestre precisa deles para somar um d20 extra de vantagem (fraqueza do alvo) */
    rolls: number[];
    bonus: number;
    critical?: boolean;
    /** Tamanho da área do ataque em metros; vazio = alvo único */
    areaMeters?: number;
}

export interface PendingAttackData extends AttackDeclaration {
    id: string;
    attackerId: string;
    attackerName: string;
    targetId: string;
    targetName: string;
    /** Dano rolado (com o crítico e o furtivo); falta até o jogador rolar o dano */
    damageRolled?: number;
    createdAt: string;
}

export const MAX_PENDING_ATTACKS = 20;
const MAX_NAME_LENGTH = 80;
const MAX_ROLLS = 10;

const KINDS: readonly DamageKind[] = [ 'fisico', 'magico', 'mental' ];
const SOURCES: readonly AttackSource[] = [ 'weapon', 'spell', 'manual' ];

const asInt = (value: unknown, min: number, max: number): number | null => {
    const number = typeof value === 'number' ? value : NaN;
    return Number.isInteger(number) && number >= min && number <= max ? number : null;
};

const asText = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** Valida o que o cliente mandou ao declarar um ataque; `null` se não serve */
export function sanitizeAttackDeclaration(raw: unknown): AttackDeclaration | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const entry = raw as Record<string, unknown>;

    const name = asText(entry['name'], MAX_NAME_LENGTH);
    const attackTotal = asInt(entry['attackTotal'], -100, 1000);
    const bonus = asInt(entry['bonus'] ?? 0, -1000, 1000);
    if (!name || attackTotal === null || bonus === null) return null;

    const source = SOURCES.find(candidate => candidate === entry['source']) ?? 'weapon';
    const kind = KINDS.find(candidate => candidate === entry['kind']) ?? (source === 'spell' ? 'magico' : 'fisico');

    const rawRolls = Array.isArray(entry['rolls']) ? entry['rolls'].slice(0, MAX_ROLLS) : [];
    const rolls = rawRolls.map(roll => asInt(roll, 1, 20));
    if (rolls.some(roll => roll === null)) return null;

    const attackType = asText(entry['attackType'], 40);
    const areaMeters = asInt(entry['areaMeters'], 0, 1000);

    return {
        source,
        name,
        kind,
        attackTotal,
        // sem os d20 (ataque manual do mestre), o total já vale e não há dado a somar
        rolls: rolls as number[],
        bonus,
        ...(attackType ? { attackType } : {}),
        ...(entry['critical'] === true ? { critical: true } : {}),
        ...(areaMeters ? { areaMeters } : {})
    };
}

/** Põe o ataque na lista. Quem declara de novo antes de rolar o dano troca o ataque anterior (refez o acerto); são no máximo 20, o mais velho sai */
export function addPendingAttack(list: readonly PendingAttackData[] | undefined, attack: PendingAttackData): PendingAttackData[] {
    const kept = (list ?? []).filter(entry => !(entry.attackerId === attack.attackerId && entry.source === attack.source && entry.name === attack.name && entry.damageRolled === undefined));
    return [ ...kept, attack ].slice(-MAX_PENDING_ATTACKS);
}

/** O ataque mais novo desse atacante com essa arma ou magia que ainda espera o dano */
export function findAwaitingDamage(list: readonly PendingAttackData[] | undefined, attackerId: string, name: string): PendingAttackData | undefined {
    return [ ...(list ?? []) ].reverse().find(entry => entry.attackerId === attackerId && entry.name === name && entry.damageRolled === undefined);
}

/** Registra o dano rolado no ataque; `null` se o ataque não existe */
export function setPendingDamage(list: readonly PendingAttackData[] | undefined, attackId: string, damage: number, critical?: boolean): PendingAttackData[] | null {
    const entries = list ?? [];
    if (!entries.some(entry => entry.id === attackId)) return null;
    return entries.map(entry => (entry.id === attackId ? { ...entry, damageRolled: damage, ...(critical ? { critical: true } : {}) } : entry));
}

export const removePendingAttack = (list: readonly PendingAttackData[] | undefined, attackId: string): PendingAttackData[] =>
    (list ?? []).filter(entry => entry.id !== attackId);

/** Tira os ataques de quem saiu do combate (atacante ou alvo) */
export const dropPendingFor = (list: readonly PendingAttackData[] | undefined, combatantId: string): PendingAttackData[] =>
    (list ?? []).filter(entry => entry.attackerId !== combatantId && entry.targetId !== combatantId);

/** O d20 que vale no teste (o maior) somado ao bônus, depois de somar os d20 extras (vantagem, como a fraqueza do alvo) */
export function totalWithExtraDice(attack: Pick<PendingAttackData, 'attackTotal' | 'rolls' | 'bonus'>, extraRolls: readonly number[] = []): number {
    // ataque manual do mestre, sem os d20: o total declarado vale e não há dado a somar
    if (attack.rolls.length === 0) return attack.attackTotal;
    return Math.max(...attack.rolls, ...extraRolls) + attack.bonus;
}

const MAX_LINES = 12;

/** Linhas do cálculo que podem ir ao chat de todos: só as de visibilidade `all`, com o tamanho limitado (as `gm` nunca saem do navegador do mestre) */
export function sanitizeExplainLines(raw: unknown): ExplainLine[] {
    if (!Array.isArray(raw)) return [];

    const lines: ExplainLine[] = [];
    for (const entry of raw) {
        if (typeof entry !== 'object' || entry === null) continue;
        const { label, detail, visibility } = entry as Record<string, unknown>;
        if (visibility !== 'all') continue;
        const text = asText(label, 80);
        if (!text) continue;
        const extra = asText(detail, 200);
        lines.push(extra ? { label: text, detail: extra, visibility: 'all' } : { label: text, visibility: 'all' });
        if (lines.length >= MAX_LINES) break;
    }
    return lines;
}

/** A mensagem do combate quando o mestre resolve o ataque: quem atacou quem, com o quê, e as linhas públicas do cálculo (sem LP restante do alvo) */
export function buildAttackLogMessage(attack: Pick<PendingAttackData, 'attackerName' | 'targetName' | 'name'>, hit: boolean, damage: number, lines: readonly ExplainLine[]): string {
    const head = `⚔️ **${attack.attackerName}** atacou **${attack.targetName}** com **${attack.name}**: ${hit ? (damage > 0 ? `${damage} de dano` : 'sem dano') : 'errou'}.`;
    if (lines.length === 0) return head;
    return `${head}\n${lines.map(line => `• ${line.label}${line.detail ? `: ${line.detail}` : ''}`).join('\n')}`;
}
