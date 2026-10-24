import type { Combatant, Creature } from '@models';

/**
 * Id da criatura personalizada que deu origem a um combatente. O combatente leva o id da criatura, e quando há mais de
 * uma cópia no combate o id ganha um sufixo (`<id da criatura>-<n>`): se o que vem antes do último hífen é o id de uma
 * criatura da campanha, é ele; senão o id do combatente já é o da criatura.
 */
export function baseCreatureId(combatantId: string, creatures: Array<Pick<Creature, 'id'>>): string {
    const lastDashIndex = combatantId.lastIndexOf('-');
    if (lastDashIndex > 0) {
        const possibleBaseId = combatantId.slice(0, lastDashIndex);
        if (creatures.some(creature => creature.id === possibleBaseId)) return possibleBaseId;
    }
    return combatantId;
}

/** A criatura personalizada que o combatente representa, se ela ainda existe na campanha */
export function findBaseCreature(combatantId: string, creatures: Creature[]): Creature | undefined {
    const id = baseCreatureId(combatantId, creatures);
    return creatures.find(creature => creature.id === id);
}

/** Combatentes que são criaturas (os jogadores já têm janelas pela ficha) */
export const creatureCombatants = (combatants: Combatant[] | undefined): Combatant[] =>
    (Array.isArray(combatants) ? combatants : []).filter(combatant => combatant.type === 'creature');
