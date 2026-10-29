import type { AppliedEffect, CombatEffect, CombatEffectLevel, CombatEffectModifier } from '@models';
import { color } from '@themes/tokens';
import { normalizeSearchText } from '@utils/searchText';
import { v4 as uuidv4 } from 'uuid';
import { conditionMet, sheetMastery, type PassiveContext } from './owned';
import type { AbilityChoice, AbilityEffect, PassiveDef, PassiveRule } from './types';

/**
 * Passivas e habilidades ativadas como **efeitos** no formato do catálogo de efeitos (`AppliedEffect`), para o motor (`collectModifiers`) enxergar sem mudar nada: AP, imunidade
 * a terreno difícil, resistência e dano causado. Os efeitos das passivas são **derivados da ficha** a cada leitura (nunca gravados): tirar a passiva da ficha tira o efeito, e a
 * condição (furtivo, LP baixo) é conferida na hora. Os das habilidades ativadas são gravados no combatente quando o jogador ativa (`ability`).
 */

/**
 * Objetos simples no formato do catálogo (não as classes dos modelos): o motor só lê os campos, e assim este módulo roda também em teste de componente, onde os decoradores
 * dos modelos não carregam.
 */
const snapshotOf = (id: string, name: string, description: string, tint: string, level: CombatEffectLevel, category: CombatEffect['category'] = 'buff'): CombatEffect => ({
    id,
    name,
    description,
    category,
    timing: 'round',
    color: tint,
    icon: '',
    usesLevels: false,
    levels: [ level ],
    scope: 'global',
    createdAt: new Date(0).toISOString()
});

const levelOf = (duration: number, indefinite: boolean, modifiers: CombatEffectModifier[], formula = '0'): CombatEffectLevel => ({
    level: 1,
    formula,
    duration,
    ...(indefinite ? { indefinite: true } : {}),
    modifiers
});

function modifiersOfRule(rule: PassiveRule, context: PassiveContext): CombatEffectModifier[] {
    switch (rule.kind) {
    case 'stat':
        return conditionMet(rule.when, context) ? [ { kind: 'stat_bonus', target: rule.stat, value: rule.flat } ] : [];
    case 'flag':
        return [ { kind: 'flag', target: rule.flag } ];
    case 'dealtPct':
        return conditionMet(rule.when, context) ? [ { kind: 'damage_dealt_bonus', value: `${rule.pct}%` } ] : [];
    case 'defense': {
        const element = rule.element === 'mastery' ? sheetMastery(context.sheet) : normalizeSearchText(rule.element);
        // "Da maestria" sem maestria na ficha não protege de nada
        if (rule.element === 'mastery' && !element) return [];
        return [ {
            kind: 'damage_resistance',
            value: `${rule.pct}%`,
            ...(rule.against !== 'any' ? { target: rule.against } : {}),
            ...(element ? { element: element as CombatEffectModifier['element'] } : {})
        } ];
    }
    default:
        return [];
    }
}

/** Os modificadores que as regras de uma passiva dão agora (as condições já conferidas) */
export function passiveModifiers(passive: PassiveDef, context: PassiveContext): CombatEffectModifier[] {
    const modifiers: CombatEffectModifier[] = [];

    for (const rule of passive.rules ?? []) {
        modifiers.push(...modifiersOfRule(rule, context));
    }
    return modifiers;
}

/**
 * Os efeitos que as passivas da ficha dão **agora**: um por passiva que tem algo para o motor (AP, terreno, resistência, dano causado), com a origem no nome. Quem lê os
 * efeitos de um combatente junta estes aos aplicados (`[...combatant.effects, ...passiveEffects(...)]`).
 */
export function passiveEffects(passives: readonly PassiveDef[], context: PassiveContext): AppliedEffect[] {
    const effects: AppliedEffect[] = [];

    for (const passive of passives) {
        const modifiers = passiveModifiers(passive, context);
        if (modifiers.length === 0) continue;

        const snapshot = snapshotOf(`passive:${passive.key}`, passive.name, 'Habilidade de classe, sempre ativa.', color.inkMuted, levelOf(0, true, modifiers));
        effects.push({
            id: `passive:${passive.key}`,
            effectId: snapshot.id,
            snapshot,
            level: 1,
            remaining: 0,
            indefinite: true,
            appliedAtRound: 1,
            passive: { key: passive.key }
        });
    }
    return effects;
}

/** Os lembretes das passivas para o mestre na resolução do ataque (resistências que dependem de dado ou de escolha dele) */
export const passiveReminders = (passives: readonly PassiveDef[], side: 'defender' | 'attacker'): string[] =>
    passives.flatMap(passive => (passive.rules ?? []).flatMap(rule => (rule.kind === 'reminder' && rule.side === side ? [ rule.text ] : [])));

/** Os efeitos aplicados mais os derivados das passivas */
export const withPassiveEffects = (effects: readonly AppliedEffect[] | null | undefined, passives: readonly PassiveDef[], context: PassiveContext): AppliedEffect[] =>
    [ ...(effects ?? []), ...passiveEffects(passives, context) ];

// ─── Habilidade ativada: o efeito que fica sobre o personagem ─────────────────────────────────────────────────────────────────

/**
 * O efeito gravado no combatente quando o jogador ativa a habilidade. Dura em turnos dele (`timing: 'turn'`) ou em rodadas (`'round'`), ou vai até o fim do combate; o mestre
 * pode tirá-lo como qualquer outro efeito.
 */
export function buildAbilityEffect(def: PassiveDef, effect: AbilityEffect, choice: AbilityChoice | null, round: number, appliedByName: string, appliedById: string): AppliedEffect {
    const untilEnd = effect.duration.unit === 'combate';
    const amount = Math.max(1, Math.floor(effect.duration.amount ?? 1));
    const name = choice ? choice.label : def.name;

    // O tick do efeito (cura ou dano a cada turno ou rodada) é o do catálogo: a categoria do efeito decide e a fórmula do nível é o dado
    const level = levelOf(untilEnd ? 0 : amount, untilEnd, effect.modifiers, effect.tick?.dice ?? '0');
    const snapshot = snapshotOf(`ability:${def.key}${choice ? `:${choice.id}` : ''}`, name, effect.description, color.amber, level, effect.tick?.kind ?? 'buff');
    snapshot.timing = effect.duration.unit === 'turnos' ? 'turn' : 'round';

    return {
        id: uuidv4(),
        effectId: snapshot.id,
        snapshot: JSON.parse(JSON.stringify(snapshot)) as CombatEffect,
        level: 1,
        remaining: untilEnd ? 0 : amount,
        ...(untilEnd ? { indefinite: true } : {}),
        appliedAtRound: round,
        appliedByName,
        appliedById,
        ability: { key: def.key, ...(choice ? { choiceId: choice.id } : {}) }
    };
}

/** Os efeitos de habilidade ativa que o combatente tem agora */
export const abilityEffects = (effects: readonly AppliedEffect[] | null | undefined): AppliedEffect[] => (effects ?? []).filter(effect => Boolean(effect.ability));
