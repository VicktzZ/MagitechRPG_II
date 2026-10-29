import { DODGE_EXPERTISE, effectiveDamageKind, resistanceExpertise, type DefenseChoice } from './engine/defense';
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
    /** Vale o **menor** d20 (a desvantagem dos efeitos passou das vantagens); sem isso vale o maior. O mestre precisa saber para refazer o total com d20 extras */
    keep?: 'lowest';
    critical?: boolean;
    /** Tamanho da área do ataque em metros; vazio = alvo único */
    areaMeters?: number;
}

/** A defesa do jogador atacado (esquiva, resistência ou nenhuma) e o teste que ele rolou */
export interface PendingDefense {
    choice: DefenseChoice;
    /** Perícia rolada: Reflexos na esquiva, a RES da natureza do ataque na resistência; vazio sem defesa */
    skill: string;
    /** Total do teste; 0 sem defesa */
    total: number;
    /** Os d20, o que valeu e o bônus somado: o mestre vê como saiu */
    rolls: number[];
    used: number;
    bonus: number;
}

export interface PendingAttackData extends AttackDeclaration {
    id: string;
    attackerId: string;
    attackerName: string;
    targetId: string;
    targetName: string;
    /** Dano rolado (com o crítico e o furtivo); falta até o jogador rolar o dano */
    damageRolled?: number;
    /** A defesa que o jogador alvo rolou; o mestre parte dela ao resolver, mas pode trocar tudo */
    defense?: PendingDefense;
    /** Ataque de oportunidade: declarado em cima de uma saída de alcance, com a Reação (ver utils/combat/opportunities.ts) */
    opportunity?: boolean;
    /** Ataque com vários alvos: um ataque pendente por alvo, todos com o mesmo `groupId` e o mesmo acerto; o dano rolado vale para o grupo todo */
    groupId?: string;
    /** Quantos alvos o ataque do grupo tem (para o mestre ver que há outros cartões do mesmo ataque) */
    groupSize?: number;
    createdAt: string;
}

export const MAX_PENDING_ATTACKS = 20;
/** Alvos de um mesmo ataque (o principal e os outros) */
export const MAX_ATTACK_TARGETS = 8;
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
        ...(entry['keep'] === 'lowest' ? { keep: 'lowest' as const } : {}),
        ...(attackType ? { attackType } : {}),
        ...(entry['critical'] === true ? { critical: true } : {}),
        ...(areaMeters ? { areaMeters } : {})
    };
}

/**
 * Põe o(s) ataque(s) da mesma declaração na lista (um por alvo). Quem declara de novo antes de rolar o dano troca os ataques anteriores da mesma arma ou magia
 * (refez o acerto, inclusive todos os alvos do grupo anterior); são no máximo 20, o mais velho sai
 */
export function addPendingAttacks(list: readonly PendingAttackData[] | undefined, attacks: readonly PendingAttackData[]): PendingAttackData[] {
    const first = attacks[0];
    if (!first) return [ ...(list ?? []) ];

    const kept = (list ?? []).filter(entry => !(entry.attackerId === first.attackerId && entry.source === first.source && entry.name === first.name && entry.damageRolled === undefined));
    return [ ...kept, ...attacks ].slice(-MAX_PENDING_ATTACKS);
}

export const addPendingAttack = (list: readonly PendingAttackData[] | undefined, attack: PendingAttackData): PendingAttackData[] => addPendingAttacks(list, [ attack ]);

/** Ids dos alvos extras de um ataque: texto, sem repetir, até o limite de alvos (o que vem do cliente) */
export function sanitizeTargetIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ].slice(0, MAX_ATTACK_TARGETS);
}

/** O ataque mais novo desse atacante com essa arma ou magia (de `source`, se informado: uma arma e uma magia podem ter o mesmo nome) que ainda espera o dano */
export function findAwaitingDamage(list: readonly PendingAttackData[] | undefined, attackerId: string, name: string, source?: AttackSource): PendingAttackData | undefined {
    return [ ...(list ?? []) ].reverse().find(entry => entry.attackerId === attackerId && entry.name === name && entry.damageRolled === undefined && (!source || entry.source === source));
}

/** Registra o dano rolado no ataque (e nos outros alvos do mesmo ataque que ainda esperam o dano: um dano só para o grupo); `null` se o ataque não existe */
export function setPendingDamage(list: readonly PendingAttackData[] | undefined, attackId: string, damage: number, critical?: boolean): PendingAttackData[] | null {
    const entries = list ?? [];
    const target = entries.find(entry => entry.id === attackId);
    if (!target) return null;

    const inGroup = (entry: PendingAttackData): boolean => entry.id === attackId
        || (target.groupId !== undefined && entry.groupId === target.groupId && entry.attackerId === target.attackerId && entry.damageRolled === undefined);
    return entries.map(entry => (inGroup(entry) ? { ...entry, damageRolled: damage, ...(critical ? { critical: true } : {}) } : entry));
}

const DEFENSE_CHOICES: readonly DefenseChoice[] = [ 'dodge', 'resist', 'none' ];

/** Perícias que valem como defesa: Reflexos na esquiva; uma das RES na resistência */
const DODGE_SKILLS: readonly string[] = [ 'Reflexos' ];
const RESIST_SKILLS: readonly string[] = [ 'RES Física', 'RES Mágica', 'RES Mental' ];

/** Valida a defesa que o jogador mandou; `null` se não serve. O total tem de ser o d20 que valeu mais o bônus, e o d20 que valeu, um dos rolados */
export function sanitizeDefenseDeclaration(raw: unknown): PendingDefense | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const entry = raw as Record<string, unknown>;

    const choice = DEFENSE_CHOICES.find(candidate => candidate === entry['choice']);
    if (!choice) return null;
    if (choice === 'none') return { choice, skill: '', total: 0, rolls: [], used: 0, bonus: 0 };

    const skill = asText(entry['skill'], 40);
    if (!(choice === 'dodge' ? DODGE_SKILLS : RESIST_SKILLS).includes(skill)) return null;

    const rawRolls = Array.isArray(entry['rolls']) ? entry['rolls'].slice(0, MAX_ROLLS) : [];
    const rolls = rawRolls.map(roll => asInt(roll, 1, 20));
    const used = asInt(entry['used'], 1, 20);
    const bonus = asInt(entry['bonus'] ?? 0, -1000, 1000);
    const total = asInt(entry['total'], -1000, 2000);
    if (rolls.length === 0 || rolls.some(roll => roll === null) || used === null || bonus === null || total === null) return null;
    if (!(rolls as number[]).includes(used) || total !== used + bonus) return null;

    return { choice, skill, total, rolls: rolls as number[], used, bonus };
}

/** Guarda a defesa do jogador no ataque; `null` se o ataque não existe */
export function setPendingDefense(list: readonly PendingAttackData[] | undefined, attackId: string, defense: PendingDefense): PendingAttackData[] | null {
    const entries = list ?? [];
    if (!entries.some(entry => entry.id === attackId)) return null;
    return entries.map(entry => (entry.id === attackId ? { ...entry, defense } : entry));
}

/** Os ataques pendentes contra esse alvo: os que esperam a defesa dele e os que ele já respondeu (esperam o mestre) */
export function incomingAttacks(list: readonly PendingAttackData[] | undefined, targetId: string | undefined): { awaiting: PendingAttackData[]; answered: PendingAttackData[] } {
    const mine = (list ?? []).filter(entry => Boolean(targetId) && entry.targetId === targetId);
    return { awaiting: mine.filter(entry => !entry.defense), answered: mine.filter(entry => Boolean(entry.defense)) };
}

/** A perícia que cada defesa rola: Reflexos na esquiva; na resistência, a RES da natureza do ataque (magia Psíquica conta como mental) */
export const defenseSkillFor = (attack: Pick<PendingAttackData, 'kind' | 'attackType'>, choice: DefenseChoice): string =>
    (choice === 'dodge' ? DODGE_EXPERTISE : resistanceExpertise(effectiveDamageKind(attack.kind, attack.attackType)));

/** "Reflexos: [12, 7: 12] + 3 = 15" (ou "sem defesa") */
export function describeDefense(defense: PendingDefense): string {
    if (defense.choice === 'none') return 'sem defesa';
    const dice = `${defense.rolls.join(', ')}${defense.rolls.length > 1 ? `: ${defense.used}` : ''}`;
    return `${defense.skill}: [${dice}] ${defense.bonus >= 0 ? '+' : '−'} ${Math.abs(defense.bonus)} = ${defense.total}`;
}

export const removePendingAttack = (list: readonly PendingAttackData[] | undefined, attackId: string): PendingAttackData[] =>
    (list ?? []).filter(entry => entry.id !== attackId);

/** Tira os ataques de quem saiu do combate (atacante ou alvo) */
export const dropPendingFor = (list: readonly PendingAttackData[] | undefined, combatantId: string): PendingAttackData[] =>
    (list ?? []).filter(entry => entry.attackerId !== combatantId && entry.targetId !== combatantId);

/** O d20 que vale no teste (o maior) somado ao bônus, depois de somar os d20 extras (vantagem, como a fraqueza do alvo) */
export function totalWithExtraDice(attack: Pick<PendingAttackData, 'attackTotal' | 'rolls' | 'bonus' | 'keep'>, extraRolls: readonly number[] = []): number {
    // ataque manual do mestre, sem os d20: o total declarado vale e não há dado a somar
    if (attack.rolls.length === 0) return attack.attackTotal;

    // Vantagem e desvantagem pelo saldo (`engine/dicePool.ts`): os d20 do ataque valem o saldo dele (+ vantagens, − desvantagens) e cada d20 extra de vantagem soma 1.
    // Com o saldo ainda ≥ 0 rola-se 1 + saldo e vale o maior; abaixo de zero, 1 + |saldo| e vale o menor. Os dados já rolados bastam para qualquer um dos dois
    const base = attack.rolls.length;
    const score = (attack.keep === 'lowest' ? -(base - 1) : base - 1) + extraRolls.length;
    const pool = [ ...attack.rolls, ...extraRolls ].slice(0, 1 + Math.abs(score));
    return (score >= 0 ? Math.max(...pool) : Math.min(...pool)) + attack.bonus;
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
