import { buildActionRollText } from '../actionRollMessage';
import { findPassiveByKey } from './catalog';
import type { AbilityActivation, AbilityChoice, AbilityEffect, AbilityLimit, PassiveDef } from './types';

/**
 * Habilidades **ativadas**: o jogador aciona (um quadrado na seção Ações), a rota do combate confere os limites, gasta o MP e a ação, cura ou põe o efeito sobre ele. Este módulo é a
 * parte pura: os limites de uso (por dia e por combate), o custo de MP e a escolha da variação. Os usos por dia ficam na ficha (`abilityUses`, o mestre renova no descanso) e os usos
 * por combate no combatente (`Combatant.abilityUses`).
 */

/** Usos já feitos: por dia (ficha) e neste combate (combatente), por chave de habilidade */
export interface AbilityUses {
    day: Readonly<Record<string, number>>;
    combat: Readonly<Record<string, number>>;
}

export const NO_USES: AbilityUses = { day: {}, combat: {} };

/** Os usos por dia que a ficha tem (`abilityUses`); o que não é número inteiro positivo não conta */
export function readAbilityDayUses(sheet: { abilityUses?: unknown } | null | undefined): Record<string, number> {
    const raw = sheet?.abilityUses;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw as Record<string, unknown>)
        .map(([ key, value ]) => [ key, Math.floor(Number(value)) ] as const)
        .filter(([ , value ]) => Number.isFinite(value) && value > 0));
}

/** A chave guardada no banco: sem os caracteres que um caminho de campo do Firestore não aceita ("class:cura interior" → "class_cura-interior") */
export const abilityStorageKey = (key: string): string => key.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export interface LimitStatus extends AbilityLimit {
    used: number;
    left: number;
}

/** Quanto já se usou de cada limite da habilidade */
export function limitStatuses(activation: AbilityActivation, key: string, uses: AbilityUses): LimitStatus[] {
    const storage = abilityStorageKey(key);
    return (activation.limits ?? []).map(limit => {
        const used = Math.max(0, Math.floor(Number((limit.per === 'dia' ? uses.day : uses.combat)[storage]) || 0));
        return { ...limit, used, left: Math.max(0, limit.max - used) };
    });
}

/** O primeiro limite esgotado, ou `null` se ainda há uso */
export const exhaustedLimit = (statuses: readonly LimitStatus[]): LimitStatus | null => statuses.find(status => status.left <= 0) ?? null;

/** "2 de 3 por dia, 1 de 1 por combate" */
export const describeLimits = (statuses: readonly LimitStatus[]): string =>
    statuses.map(status => `${status.left} de ${status.max} ${status.per === 'dia' ? 'por dia' : 'por combate'}`).join(' · ');

/** O custo em MP: o valor fixo ou, em `allMp`, todo o MP que o personagem tem agora */
export function abilityCost(activation: AbilityActivation, currentMp: number): number {
    if (activation.cost?.allMp) return Math.max(0, Math.floor(Number(currentMp) || 0));
    return Math.max(0, Math.floor(activation.cost?.mp ?? 0));
}

export type AbilityBlock = 'sem-habilidade' | 'nao-ativada' | 'limite' | 'sem-mp' | 'escolha-invalida' | 'escolha-ausente';

export interface AbilityPlan {
    ok: boolean;
    block?: AbilityBlock;
    /** Texto para o jogador quando bloqueia */
    reason?: string;
    def?: PassiveDef;
    cost: number;
    choice: AbilityChoice | null;
    statuses: LimitStatus[];
}

interface PlanInput {
    key: string;
    choiceId?: string | null;
    currentMp: number;
    uses: AbilityUses;
    /** A habilidade está entre as que a ficha tem (`ownedPassives`) */
    owned: boolean;
    /** O mestre libera mesmo com os usos esgotados */
    ignoreLimits?: boolean;
}

/** Confere se a habilidade pode ser ativada agora: a ficha a tem, os usos não acabaram, o MP dá e a variação (se houver) foi escolhida */
export function planAbility({ key, choiceId, currentMp, uses, owned, ignoreLimits = false }: PlanInput): AbilityPlan {
    const fail = (block: AbilityBlock, reason: string, extra: Partial<AbilityPlan> = {}): AbilityPlan =>
        ({ ok: false, block, reason, cost: 0, choice: null, statuses: [], ...extra });

    const def = findPassiveByKey(key);
    if (!def || def.mode !== 'ativada' || !def.activation) return fail('nao-ativada', 'Esta habilidade não se ativa pelo app.');
    if (!owned) return fail('sem-habilidade', 'O personagem não tem esta habilidade.', { def });

    const activation = def.activation;
    const statuses = limitStatuses(activation, key, uses);
    const exhausted = ignoreLimits ? null : exhaustedLimit(statuses);
    if (exhausted) return fail('limite', `${def.name}: acabaram os usos ${exhausted.per === 'dia' ? 'do dia' : 'deste combate'}.`, { def, statuses });

    let choice: AbilityChoice | null = null;
    if (activation.choices && activation.choices.length > 0) {
        if (!choiceId) return fail('escolha-ausente', `${def.name}: escolha uma variação.`, { def, statuses });
        choice = activation.choices.find(candidate => candidate.id === choiceId) ?? null;
        if (!choice) return fail('escolha-invalida', `${def.name}: variação desconhecida.`, { def, statuses });
    }

    const cost = abilityCost(activation, currentMp);
    if (activation.cost?.allMp ? currentMp <= 0 : cost > currentMp) {
        return fail('sem-mp', `${def.name}: precisa de ${activation.cost?.allMp ? 'algum' : cost} MP e o personagem tem ${Math.max(0, Math.floor(currentMp))}.`, { def, statuses, cost });
    }

    return { ok: true, def, cost, choice, statuses };
}

/** "por 2 turnos", "por 3 rodadas" ou "até o fim do combate" */
export function describeDuration(duration: AbilityEffect['duration']): string {
    if (duration.unit === 'combate') return 'até o fim do combate';
    const amount = Math.max(1, Math.floor(duration.amount ?? 1));
    return `por ${amount} ${duration.unit === 'turnos' ? (amount === 1 ? 'turno' : 'turnos') : (amount === 1 ? 'rodada' : 'rodadas')}`;
}

export interface AbilityUseSummary {
    actor: string;
    ability: string;
    choice?: string | null;
    cost: number;
    /** O que a cura rendeu: o rolado e o que de fato entrou (a vida não passa do máximo) */
    heal?: { total: number; applied: number } | null;
    effect?: AbilityEffect | null;
    /** Habilidade de área: quem foi atingido (nomes) */
    targets?: readonly string[];
    /** Habilidade de área com cura: quanto cada um recuperou */
    healed?: ReadonlyArray<{ name: string; applied: number }>;
}

/** "Borin, Caio e Dara" */
export const joinNames = (names: readonly string[]): string => (names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`);

/** A linha do log e do chat quando o jogador usa a habilidade (sem o valor da vida de ninguém, salvo o que a própria cura rendeu) */
export function describeAbilityUse({ actor, ability, choice, cost, heal, effect, targets, healed }: AbilityUseSummary): string {
    const onTargets = targets && targets.length > 0 ? ` em ${joinNames(targets)}` : '';
    const cure = healed && healed.length > 0
        ? ` e curou ${joinNames(healed.map(entry => `${entry.name} (**${entry.applied}**)`))}`
        : heal ? ` e curou **${heal.applied} de LP**` : '';
    const head = `**${actor}** usou **${ability}**${choice ? ` (${choice})` : ''}${cost > 0 ? ` gastando ${cost} MP` : ''}${onTargets}${cure}`;
    return effect ? `${head}. ${effect.description} (${describeDuration(effect.duration)}).` : `${head}.`;
}

/** O cartão de dados da cura da habilidade (o mesmo cartão do efeito da magia: total à vista e os dados no dropdown) */
export function buildAbilityHealText(player: string, ability: string, heal: { notation: string; display: string; total: number }, targetName?: string): string {
    return buildActionRollText({
        kind: 'efeito',
        player,
        title: ability,
        detail: targetName ? `Habilidade · Cura em ${targetName}` : 'Habilidade · Cura',
        critical: false,
        total: heal.total,
        cost: null,
        dt: null,
        segments: [ { notation: heal.notation, display: heal.display, total: heal.total } ]
    });
}
