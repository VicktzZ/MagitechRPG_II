import { limitStatuses, planAbility, type AbilityBlock, type AbilityUses } from './passives/abilities';
import type { CounterSpec, PassiveDef, ReactionEffect, ReactionSpec, ReactionWhen } from './passives/types';

/**
 * **Reagir no meio do ataque** (2ª leva das passivas, Fase 5). O jogador atacado, antes de o mestre resolver, usa uma habilidade de reação (Barreira de Ki, Metamorfose Adaptativa,
 * Resposta Tática, Reflexos Táticos, Xeque-Mate). Mecânica **genérica**, que as magias de Reação usarão depois: a reação guarda no ataque pendente o que ela faz (`effects`, copiado
 * do catálogo pelo servidor: o cliente só diz qual habilidade) e o motor a lê em dois momentos:
 *  - na **proposta do mestre**: AP a mais, dano reduzido, erro automático, lembretes (`reactionAdjustments`);
 *  - na **resolução** (`resolve_attack`): as reações *armadas* (`miss`, `damaged`, `dodged`...) só se pagam se a condição se cumprir (`settleReactions`), e as que têm um contra-ataque
 *    abrem a oportunidade de contra-atacar quem atacou (`counterOf`).
 * Pura: a rota paga o custo, abre as oportunidades e grava.
 */

/** Uma reação já declarada num ataque pendente */
export interface AttackReaction {
    id: string;
    /** Chave da habilidade no catálogo (`subclass:barreira de ki`) */
    key: string;
    name: string;
    /** Quem reagiu (o alvo do ataque) */
    by: string;
    byName: string;
    /** As condições em que vale; `now` vale já */
    when: ReactionWhen[];
    /** Armada: ainda não foi paga, o custo sai na resolução se a condição se cumprir */
    armed: boolean;
    effects: ReactionEffect[];
    createdAt: string;
}

/** O contra-ataque que uma reação deu: vai na oportunidade aberta e no ataque pendente que a usa */
export interface AttackCounter extends CounterSpec {
    /** A habilidade que deu o contra-ataque */
    abilityKey: string;
    source: string;
}

/** No máximo três reações por ataque (uma por habilidade) */
export const MAX_ATTACK_REACTIONS = 3;

export const whenList = (spec: ReactionSpec): ReactionWhen[] => (Array.isArray(spec.when) ? [ ...spec.when ] : [ spec.when ]);

/** Só as condições `now` pagam já; qualquer outra deixa a reação armada */
export const isArmedWhen = (when: readonly ReactionWhen[]): boolean => !when.includes('now');

export const reactionSpecOf = (def: PassiveDef | undefined): ReactionSpec | null => def?.activation?.reaction ?? null;

/** A habilidade é uma reação a ataque (não se ativa pelo quadrado da seção Ações) */
export const isAttackReactionAbility = (def: PassiveDef | undefined): boolean => reactionSpecOf(def) !== null;

/** O que a reação precisa saber do ataque para valer */
export interface ReactionAttackInfo {
    /** O ataque é corpo a corpo (a arma é branca); `undefined` = o atacante não disse */
    melee?: boolean;
}

/** A reação pode se cumprir contra esse ataque? (Resposta Tática só contra corpo a corpo.) Condição que nunca se cumpre torna a reação inútil: o botão fica desabilitado */
export function canApply(spec: ReactionSpec, attack: ReactionAttackInfo): boolean {
    return whenList(spec).some(when => when !== 'missMelee' && when !== 'damagedMeleeNoDodge' ? true : attack.melee === true);
}

export type AttackReactionBlock = AbilityBlock | 'nao-e-reacao' | 'ja-reagiu' | 'nao-se-aplica' | 'muitas-reacoes';

export interface AttackReactionPlan {
    ok: boolean;
    block?: AttackReactionBlock;
    reason?: string;
    def?: PassiveDef;
    spec?: ReactionSpec;
    /** O custo em MP da habilidade (pago já nas `now`, na resolução nas armadas) */
    cost: number;
}

interface PlanInput {
    key: string;
    attack: ReactionAttackInfo & { reactions?: readonly AttackReaction[] };
    currentMp: number;
    uses: AbilityUses;
    owned: boolean;
    ignoreLimits?: boolean;
}

/** Confere se o personagem pode reagir a esse ataque com essa habilidade: tem a habilidade, é uma reação, ainda não reagiu com ela, a condição pode se cumprir, os usos e o MP dão */
export function planAttackReaction({ key, attack, currentMp, uses, owned, ignoreLimits = false }: PlanInput): AttackReactionPlan {
    const base = planAbility({ key, currentMp, uses, owned, ignoreLimits });
    const def = base.def;
    const spec = reactionSpecOf(def);
    if (!base.ok || !def) {
        // "Não é ativada" (texto ou automática) e as outras recusas de `planAbility` valem aqui também
        return { ok: false, block: base.block, reason: base.reason, ...(def ? { def } : {}), cost: base.cost };
    }
    if (!spec) return { ok: false, block: 'nao-e-reacao', reason: `${def.name}: não é uma reação a ataque.`, def, cost: 0 };

    if ((attack.reactions ?? []).some(reaction => reaction.key === key)) {
        return { ok: false, block: 'ja-reagiu', reason: `${def.name}: já reagiu a este ataque.`, def, spec, cost: base.cost };
    }
    if ((attack.reactions ?? []).length >= MAX_ATTACK_REACTIONS) {
        return { ok: false, block: 'muitas-reacoes', reason: 'Este ataque já tem reações demais.', def, spec, cost: base.cost };
    }
    if (!canApply(spec, attack)) {
        return { ok: false, block: 'nao-se-aplica', reason: `${def.name}: só vale contra ataque corpo a corpo.`, def, spec, cost: base.cost };
    }
    return { ok: true, def, spec, cost: base.cost };
}

/** A reação pronta para ir ao ataque pendente (os efeitos vêm do catálogo, nunca do cliente) */
export function buildAttackReaction(def: PassiveDef, by: { id: string; name: string }, id: string, createdAt: string): AttackReaction | null {
    const spec = reactionSpecOf(def);
    if (!spec) return null;
    const when = whenList(spec);
    return { id, key: def.key, name: def.name, by: by.id, byName: by.name, when, armed: isArmedWhen(when), effects: JSON.parse(JSON.stringify(spec.effects)) as ReactionEffect[], createdAt };
}

// ─── Na proposta do mestre ───────────────────────────────────────────────────────────────────────────────────────────────────────

export interface ReactionAdjustments {
    /** AP a mais do alvo contra este ataque */
    apBonus: number;
    /** O dano cai nessa % (várias reações somam, até 100) */
    damagePct: number;
    /** O ataque erra sozinho */
    autoMiss: boolean;
    /** De onde vem cada ajuste, para o cartão explicar ("Barreira de Ki: +10 de AP") */
    sources: Array<{ name: string; text: string }>;
    /** Lembretes só do mestre */
    notes: Array<{ name: string; text: string }>;
}

/**
 * O que as reações já declaradas mudam na proposta. O AP e o erro automático valem só nas reações `now`; a redução de dano vale também na `damaged` (se o ataque não causar
 * dano, ela não tem o que reduzir). Armadas de outras condições (Resposta Tática, Reflexos Táticos) não mexem no cálculo: só abrem o contra-ataque na resolução.
 */
export function reactionAdjustments(reactions: readonly AttackReaction[] | undefined): ReactionAdjustments {
    const result: ReactionAdjustments = { apBonus: 0, damagePct: 0, autoMiss: false, sources: [], notes: [] };

    for (const reaction of reactions ?? []) {
        const immediate = reaction.when.includes('now');
        for (const effect of reaction.effects) {
            if (effect.kind === 'apBonus' && immediate) {
                result.apBonus += effect.value;
                result.sources.push({ name: reaction.name, text: `+${effect.value} de AP contra este ataque` });
            } else if (effect.kind === 'damagePct' && (immediate || reaction.when.includes('damaged'))) {
                result.damagePct = Math.min(100, result.damagePct + effect.pct);
                result.sources.push({ name: reaction.name, text: `dano −${effect.pct}%` });
            } else if (effect.kind === 'autoMiss' && immediate) {
                result.autoMiss = true;
                result.sources.push({ name: reaction.name, text: 'o ataque erra automaticamente' });
            } else if (effect.kind === 'note') {
                result.notes.push({ name: reaction.name, text: effect.text });
            }
        }
    }
    return result;
}

/** O dano depois da redução em % das reações (arredonda para baixo; nunca abaixo de 0) */
export const reducedDamage = (damage: number, pct: number): number => Math.max(0, Math.floor(damage * (1 - Math.min(100, Math.max(0, pct)) / 100)));

// ─── Na resolução ────────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Como o ataque terminou (o que o mestre confirmou) */
export interface ReactionOutcome {
    hit: boolean;
    /** O dano que entrou de fato no alvo */
    dealt: number;
    /** A defesa que valeu na resolução */
    defense?: 'dodge' | 'resist' | 'none';
    /** O ataque era corpo a corpo */
    melee?: boolean;
}

/** A condição se cumpriu? */
export function whenMet(when: ReactionWhen, outcome: ReactionOutcome): boolean {
    const dodged = outcome.defense === 'dodge';
    switch (when) {
    case 'now': return true;
    case 'miss': return !outcome.hit;
    case 'missMelee': return !outcome.hit && outcome.melee === true;
    case 'damaged': return outcome.dealt > 0;
    // a esquiva anulou um ataque que teria acertado
    case 'dodged': return dodged && outcome.hit && outcome.dealt === 0;
    // levou dano corpo a corpo sem esquivar (não se defendeu ou resistiu); esquivar e falhar também é esquivar
    case 'damagedMeleeNoDodge': return outcome.dealt > 0 && outcome.melee === true && !dodged;
    default: return false;
    }
}

export interface SettledReaction {
    reaction: AttackReaction;
    /** A condição se cumpriu (ou a reação já era imediata) */
    fires: boolean;
    /** A reação armada se cumpriu: o custo sai agora */
    mustPay: boolean;
}

/** Quais reações do ataque valem, dado o resultado. As imediatas já foram pagas e sempre valem; as armadas pagam só se alguma das condições se cumprir */
export function settleReactions(reactions: readonly AttackReaction[] | undefined, outcome: ReactionOutcome): SettledReaction[] {
    return (reactions ?? []).map(reaction => {
        const fires = reaction.when.some(when => whenMet(when, outcome));
        return { reaction, fires, mustPay: reaction.armed && fires };
    });
}

/** O contra-ataque que a reação dá, se der */
export function counterOf(reaction: AttackReaction): AttackCounter | null {
    for (const effect of reaction.effects) {
        if (effect.kind === 'counter') return { ...effect.counter, abilityKey: reaction.key, source: reaction.name };
    }
    return null;
}

/** "+5 no acerto, crítico garantido, +6d6 de dano" (para o cartão do mestre e do jogador) */
export function describeCounter(counter: Pick<CounterSpec, 'hitBonus' | 'guaranteedCrit' | 'extraDice' | 'meleeOnly'>): string {
    const parts = [
        ...(counter.hitBonus ? [ `${counter.hitBonus > 0 ? '+' : '−'}${Math.abs(counter.hitBonus)} no acerto` ] : []),
        ...(counter.guaranteedCrit ? [ 'crítico garantido' ] : []),
        ...(counter.extraDice ? [ `+${counter.extraDice} de dano` ] : []),
        ...(counter.meleeOnly === false ? [ 'qualquer arma' ] : [ 'corpo a corpo' ])
    ];
    return parts.join(', ');
}

/** O resumo curto de uma reação para chips e dicas ("Barreira de Ki: +10 de AP contra este ataque") */
export function describeReaction(reaction: Pick<AttackReaction, 'name' | 'effects' | 'armed'>): string {
    const parts: string[] = [];
    for (const effect of reaction.effects) {
        if (effect.kind === 'apBonus') parts.push(`+${effect.value} de AP`);
        else if (effect.kind === 'damagePct') parts.push(`dano −${effect.pct}%`);
        else if (effect.kind === 'autoMiss') parts.push('o ataque erra');
        else if (effect.kind === 'counter') parts.push(`contra-ataque (${describeCounter(effect.counter)})`);
    }
    return `${reaction.name}${parts.length > 0 ? `: ${parts.join('; ')}` : ''}${reaction.armed ? ' (armada)' : ''}`;
}

/** A dica do botão "Reagir": custo, usos que sobram e o que ela faz */
export function describeReactionOption(def: PassiveDef, currentUses: AbilityUses): string {
    const spec = reactionSpecOf(def);
    if (!def.activation || !spec) return def.name;
    const statuses = limitStatuses(def.activation, def.key, currentUses);
    const cost = def.activation.cost?.mp ? `${def.activation.cost.mp} MP` : 'sem custo de MP';
    const left = statuses.map(status => `${status.left} de ${status.max} ${status.per === 'dia' ? 'por dia' : 'por combate'}`).join(', ');
    const what = describeReaction({ name: def.name, effects: spec.effects, armed: isArmedWhen(whenList(spec)) });
    return `${what} · ${cost}${left ? ` · ${left}` : ''} · gasta a Reação`;
}

// ─── Na tela do jogador atacado ──────────────────────────────────────────────────────────────────────────────────────────────

/** Uma habilidade de reação que o jogador pode (ou não) usar agora contra um ataque */
export interface ReactionOption {
    def: PassiveDef;
    /** Já reagiu a este ataque com ela */
    reacted: boolean;
    /** Dá para reagir agora; senão `plan.reason` diz por quê */
    plan: AttackReactionPlan;
    /** Dica do botão: o que faz, custo, usos e que gasta a Reação */
    hint: string;
}

/**
 * As habilidades de reação da ficha para esse ataque, na ordem do catálogo. As que não se aplicam (Resposta Tática contra ataque à distância) aparecem desabilitadas com o motivo,
 * para o jogador entender por que não dá; o que a ficha não tem não aparece.
 */
export function reactionOptionsFor(
    passives: readonly PassiveDef[],
    attack: ReactionAttackInfo & { reactions?: readonly AttackReaction[] },
    currentMp: number,
    uses: AbilityUses
): ReactionOption[] {
    return passives
        .filter(isAttackReactionAbility)
        .map(def => {
            const plan = planAttackReaction({ key: def.key, attack, currentMp, uses, owned: true });
            return { def, reacted: plan.block === 'ja-reagiu', plan, hint: describeReactionOption(def, uses) };
        });
}
