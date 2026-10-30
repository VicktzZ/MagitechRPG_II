import type { ExtraSpec } from './rolls';
import { rulesOf, specFromExtra } from './rolls';
import type { PassiveContext } from './owned';
import type { PassiveDef } from './types';

/**
 * **Modificadores de conjuração** (2ª leva das passivas, Fase 6): o que as habilidades de metamagia e de conjuração mudam na hora de conjurar uma magia. Mecânica **genérica**: as
 * regras (`castOption`, `quickCast`, `twinCast`, `fixation`, `guidedHits`) estão no catálogo e este módulo as junta num **plano de conjuração** (`planCast`): o custo de MP, a ação
 * que se gasta, os dados a mais no teste, a margem de crítico e o que se soma ao efeito ao "Efetuar". Pura: quem conjura (`useSpellCasting`) rola, paga e grava.
 */

/** Uma opção de metamagia que o jogador pode ligar nesta conjuração */
export interface CastOptionInfo {
    id: string;
    /** A habilidade de que vem */
    source: string;
    label: string;
    hint: string;
    /** MP a mais (já no nível da magia: Estágio Quatro custa 12, ou 20 no nível 4) */
    extraMp: number;
    /** Dano ou cura a mais ao efetuar */
    spec: ExtraSpec | null;
    /** Reduz a margem de crítico da conjuração (positivo = reduz) */
    critMarginReduction: number;
    note?: string;
    /** Dá para ligar nesta magia e neste estágio */
    available: boolean;
    /** Por que não dá */
    reason?: string;
}

interface SpellRef {
    level?: unknown;
    execution?: unknown;
}

const levelOf = (spell: SpellRef): number => Math.max(0, Math.floor(Number(spell.level) || 0));

/** As opções de metamagia que a ficha tem, para esta magia no estágio `stage` (de `stageCount` estágios) */
export function castOptionsFor(passives: readonly PassiveDef[], spell: SpellRef, stage: number, stageCount: number, context: PassiveContext): CastOptionInfo[] {
    const level = levelOf(spell);

    return rulesOf(passives, 'castOption').map(({ passive, rule }) => {
        let reason: string | undefined;
        if (rule.lastStageOnly && stage !== stageCount) reason = 'só vale no último estágio da magia';
        else if (rule.maxSpellLevel !== undefined && level > rule.maxSpellLevel) reason = `só vale em magia de nível ${rule.maxSpellLevel} ou menos`;

        return {
            id: rule.id,
            source: passive.name,
            label: rule.label,
            hint: rule.hint,
            extraMp: level === 4 && rule.mpLevel4 !== undefined ? rule.mpLevel4 : rule.mp,
            spec: rule.effect ? specFromExtra(passive.name, rule.effect, context) : null,
            critMarginReduction: Math.max(0, -(rule.critMarginDelta ?? 0)),
            ...(rule.note ? { note: rule.note } : {}),
            available: reason === undefined,
            ...(reason ? { reason: `${rule.label}: ${reason}` } : {})
        };
    });
}

/** As opções de metamagia que a ficha tem, sem olhar para uma magia (o painel de conjuração as lista; quais valem é conferido em cada conjuração) */
export const castOptionList = (passives: readonly PassiveDef[]): Array<{ id: string; label: string; hint: string; source: string; mp: number; mpLevel4?: number }> =>
    rulesOf(passives, 'castOption').map(({ passive, rule }) => ({ id: rule.id, label: rule.label, hint: rule.hint, source: passive.name, mp: rule.mp, ...(rule.mpLevel4 !== undefined ? { mpLevel4: rule.mpLevel4 } : {}) }));

// ─── Conjuração Rápida ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A ficha tem Conjuração Rápida e esta magia entra (nível até `maxLevel`, execução Padrão ou Completa) */
export function quickCastApplies(passives: readonly PassiveDef[], spell: SpellRef): boolean {
    const rule = rulesOf(passives, 'quickCast')[0]?.rule;
    if (!rule || levelOf(spell) < 1 || levelOf(spell) > rule.maxLevel) return false;
    const execution = String(spell.execution ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
    return execution === 'padrao' || execution === 'completa';
}

/** O personagem já usou a Conjuração Rápida nesta rodada (`Combatant.quickCastRound`); uma vez por turno, e cada um age uma vez por rodada */
export const quickCastUsed = (quickCastRound: unknown, round: number): boolean => Number(quickCastRound) === round;

// ─── Teia da Realidade ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A regra da Teia da Realidade da ficha, ou `null` */
export const twinCastRule = (passives: readonly PassiveDef[]): { maxLevel: number; extraMp: number } | null => {
    const rule = rulesOf(passives, 'twinCast')[0]?.rule;
    return rule ? { maxLevel: rule.maxLevel, extraMp: rule.extraMp } : null;
};

/** A magia pode entrar no par da Teia da Realidade (nível 1 a `maxLevel`) */
export const twinCastAllows = (passives: readonly PassiveDef[], spell: SpellRef): boolean => {
    const rule = twinCastRule(passives);
    return rule !== null && levelOf(spell) >= 1 && levelOf(spell) <= rule.maxLevel;
};

/** O papel da conjuração no par: `first` abre o par (gasta a ação), `second` fecha (não gasta ação), `none` é conjuração comum */
export type TwinRole = 'none' | 'first' | 'second';

// ─── Fixação Mágica ────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A magia que a ficha fixou (`fixedSpell`: id da magia e o nome, para o mestre reconhecer no ataque) */
export interface FixedSpell {
    key: string;
    name: string;
}

export function readFixedSpell(sheet: { fixedSpell?: unknown } | null | undefined): FixedSpell | null {
    const raw = sheet?.fixedSpell;
    if (!raw || typeof raw !== 'object') return null;
    const { key, name } = raw as Record<string, unknown>;
    return typeof key === 'string' && key !== '' && typeof name === 'string' ? { key, name } : null;
}

/** A ficha tem Fixação Mágica */
export const fixationRule = (passives: readonly PassiveDef[]): { testDice: string; maxStageDamage: number } | null => {
    const rule = rulesOf(passives, 'fixation')[0]?.rule;
    return rule ? { testDice: rule.testDice, maxStageDamage: rule.maxStageDamage } : null;
};

/** Esta magia é a fixada (e a ficha tem a habilidade) */
export const isFixedSpell = (passives: readonly PassiveDef[], sheet: { fixedSpell?: unknown } | null | undefined, spellKey: string): boolean =>
    fixationRule(passives) !== null && readFixedSpell(sheet)?.key === spellKey;

/** O nome da magia a que o personagem é **invulnerável** (a que ele fixou, se tem a habilidade): o cálculo do mestre faz a magia de mesmo nome errar */
export const invulnerableSpellName = (sheet: { fixedSpell?: unknown } | null | undefined, passives: readonly PassiveDef[]): string | null =>
    fixationRule(passives) !== null ? readFixedSpell(sheet)?.name ?? null : null;

// ─── Magia Guiada ──────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A sequência de acertos de magia (`Combatant.guided`): quem foi acertado, com qual magia e quantas vezes seguidas */
export interface GuidedHits {
    targetId: string;
    spellKey: string;
    hits: number;
}

export const guidedRule = (passives: readonly PassiveDef[]): { die: string; maxHits: number } | null => {
    const rule = rulesOf(passives, 'guidedHits')[0]?.rule;
    return rule ? { die: rule.die, maxHits: rule.maxHits } : null;
};

/** Quantos dados de bônus esta conjuração leva: um por acerto consecutivo já feito neste alvo com esta magia, até o limite */
export function guidedBonusDice(passives: readonly PassiveDef[], guided: Partial<GuidedHits> | null | undefined, targetId: string | undefined, spellKey: string): number {
    const rule = guidedRule(passives);
    if (!rule || !guided || !targetId || guided.targetId !== targetId || guided.spellKey !== spellKey) return 0;
    return Math.min(rule.maxHits, Math.max(0, Math.floor(Number(guided.hits) || 0)));
}

/** O que aconteceu ao personagem que mexe na sequência de Magia Guiada */
export type GuidedEvent =
    | { kind: 'spellHit'; targetId: string; spellKey: string }
    | { kind: 'reset' };

/**
 * A nova sequência depois de um evento. Magia que acerta o mesmo alvo com a mesma magia soma um acerto (até o limite); acertar outro alvo ou outra magia recomeça em 1; qualquer
 * outra coisa (errar, atacar com arma, sofrer dano) zera.
 */
export function nextGuided(previous: GuidedHits | undefined, event: GuidedEvent, maxHits: number): GuidedHits | undefined {
    if (event.kind === 'reset') return undefined;
    const sameChain = previous !== undefined && previous.targetId === event.targetId && previous.spellKey === event.spellKey;
    return { targetId: event.targetId, spellKey: event.spellKey, hits: sameChain ? Math.min(maxHits, previous.hits + 1) : 1 };
}

// ─── O plano da conjuração ───────────────────────────────────────────────────────────────────────────────────────────────────────

export interface CastPlanInput {
    spell: SpellRef;
    stage: number;
    stageCount: number;
    passives: readonly PassiveDef[];
    context: PassiveContext;
    /** As opções de metamagia que o jogador ligou */
    selected: readonly string[];
    /** O custo de MP do estágio, já com as passivas que mexem nele (Magismo Total) */
    baseCost: number;
    /** O papel nesta conjuração se a Teia da Realidade está armada */
    twin: TwinRole;
    /** A Conjuração Rápida pode valer agora: a ação Bônus está livre e ela ainda não foi usada nesta rodada */
    quickCastReady: boolean;
    /** Esta magia é a fixada (`isFixedSpell`) */
    fixed: boolean;
    /** A magia já está no estágio máximo que dá para conjurar: a Fixação soma o dano em vez de pular estágio */
    fixedAtMaxStage: boolean;
    /** Acertos consecutivos anteriores desta magia neste alvo (`guidedBonusDice`) */
    guidedDice: number;
}

export interface CastPlan {
    /** O custo total de MP desta conjuração */
    cost: number;
    /** De onde vem cada parte do que passa do custo do estágio: `[Intensificação Mágica, 2]` */
    extraCosts: Array<{ source: string; mp: number }>;
    /** A ação que se gasta; `null` não gasta (a segunda magia da Teia da Realidade) */
    execution: string | null;
    /** A Conjuração Rápida trocou a ação por Bônus (o servidor marca a rodada) */
    quickCast: boolean;
    /** Dados a mais no teste de magia ("1d6", Fixação Mágica) */
    testDice: string[];
    /** Quanto a margem de crítico cai nesta conjuração */
    critMarginReduction: number;
    /** O que se soma ao dano ou à cura ao efetuar (guardado até o "Efetuar") */
    effectSpecs: ExtraSpec[];
    /** Frases para o chat e para o jogador ("Intensificação Mágica: +2 MP, +2d8 ao efetuar") */
    notes: string[];
    /** Opções de metamagia de fato aplicadas */
    applied: string[];
}

/** Junta tudo que as habilidades de conjuração mudam nesta conjuração */
export function planCast(input: CastPlanInput): CastPlan {
    const { spell, stage, stageCount, passives, context, selected, baseCost, twin, quickCastReady, fixed, fixedAtMaxStage, guidedDice } = input;
    const plan: CastPlan = { cost: baseCost, extraCosts: [], execution: String(spell.execution ?? '') || null, quickCast: false, testDice: [], critMarginReduction: 0, effectSpecs: [], notes: [], applied: [] };

    for (const option of castOptionsFor(passives, spell, stage, stageCount, context)) {
        if (!selected.includes(option.id)) continue;
        // Ligada mas fora do que a magia aceita (Estágio Quatro fora do último estágio): não cobra nada, e a frase diz por quê
        if (!option.available) {
            plan.notes.push(`${option.reason ?? option.label} (não foi aplicada)`);
            continue;
        }
        plan.applied.push(option.id);
        plan.extraCosts.push({ source: option.label, mp: option.extraMp });
        plan.critMarginReduction += option.critMarginReduction;
        if (option.spec) plan.effectSpecs.push(option.spec);
        plan.notes.push(`${option.label}: +${option.extraMp} MP${option.spec ? `, ${[ ...option.spec.dice, ...(option.spec.flat ? [ String(option.spec.flat) ] : []) ].join('+')} ao efetuar` : ''}`);
        if (option.note) plan.notes.push(option.note);
    }

    const twinRule = twinCastRule(passives);
    if (twinRule && twin !== 'none' && twinCastAllows(passives, spell)) {
        plan.extraCosts.push({ source: 'Teia da Realidade', mp: twinRule.extraMp });
        plan.notes.push(`Teia da Realidade: ${twin === 'first' ? 'primeira magia do par' : 'segunda magia do par, sem gastar ação'} (+${twinRule.extraMp} MP)`);
        if (twin === 'second') plan.execution = null;
    }

    if (plan.execution !== null && quickCastReady && quickCastApplies(passives, spell)) {
        plan.execution = 'Bônus';
        plan.quickCast = true;
        plan.notes.push('Conjuração Rápida: gasta a ação Bônus');
    }

    const fixation = fixationRule(passives);
    if (fixed && fixation) {
        plan.testDice.push(fixation.testDice);
        plan.notes.push(`Fixação Mágica: +${fixation.testDice} no teste`);
        if (fixedAtMaxStage && fixation.maxStageDamage > 0) {
            plan.effectSpecs.push({ source: 'Fixação Mágica', dice: [], flat: fixation.maxStageDamage, sameDie: 0 });
            plan.notes.push(`Fixação Mágica: +${fixation.maxStageDamage} de dano (estágio máximo)`);
        }
    }

    const guided = guidedRule(passives);
    if (guided && guidedDice > 0) {
        const dice = `${Math.min(guided.maxHits, guidedDice)}${guided.die.replace(/^\d+/, '')}`;
        plan.effectSpecs.push({ source: 'Magia Guiada', dice: [ dice ], flat: 0, sameDie: 0 });
        plan.notes.push(`Magia Guiada: ${Math.min(guided.maxHits, guidedDice)} acerto${guidedDice > 1 ? 's' : ''} seguido${guidedDice > 1 ? 's' : ''}, +${dice} ao efetuar`);
    }

    plan.cost = baseCost + plan.extraCosts.reduce((sum, part) => sum + part.mp, 0);
    return plan;
}
