import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import type { Combatant, Creature, Expertise } from '@models';
import { adjustDice, effectDice, expertiseScope, keptDie } from '@utils/combat/effectDice';

/** Criatura em turno (com seu combatente), usada quando a rolagem não indica uma criatura específica */
interface CreatureInTurn {
    creature: Creature;
    combatant: Combatant;
}

/** Rolagem de perícia de uma criatura: rola os d20, soma a perícia e manda o resultado ao chat da sessão */
export function useCreatureExpertiseRoll(currentCreatureInTurn: CreatureInTurn | null) {
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()

    const handleCreatureExpertiseRoll = async (expertiseName: string, expertise: Expertise, specificCreature?: Creature, specificCombatant?: Combatant) => {
        // Use criatura específica se fornecida, senão usa a atual em turno
        let creature, combatant;
        if (specificCreature && specificCombatant) {
            creature = specificCreature;
            combatant = specificCombatant;
        } else if (currentCreatureInTurn) {
            const data = currentCreatureInTurn;
            creature = data.creature;
            combatant = data.combatant;
        } else {
            return;
        }
        const expertiseValue = Number(expertise?.value ?? 0) || 0;

        const defaultAttrKey = expertise?.defaultAttribute;
        let numDice = 1;

        if (defaultAttrKey) {
            const attrValue = Number(creature.attributes?.[defaultAttrKey] ?? 0) || 0;
            // Nova fórmula: 0=-1, 5=1, 10=2, 15=3, 20=4, 30+=5
            let attrMod = attrValue === 0 ? -1 : Math.min(5, Math.floor(attrValue / 5));
            if (!Number.isFinite(attrMod)) attrMod = 1;
            numDice = attrMod;
        }

        if (!Number.isFinite(numDice) || numDice < 1) numDice = 1;

        // Percepção e Furtividade levam as vantagens e desvantagens dos efeitos aplicados à criatura (saldo de d20, como no jogador)
        const scope = expertiseScope(expertiseName);
        const effects = scope ? effectDice(combatant?.effects, scope) : undefined;
        const { dice, keep } = effects ? adjustDice({ dice: numDice, keep: 'highest' }, effects) : { dice: numDice, keep: 'highest' as const };

        const rolls: number[] = [];
        for (let i = 0; i < dice; i++) {
            rolls.push(Math.floor(Math.random() * 20) + 1);
        }

        const bestRoll = keptDie(rolls, keep);
        const total = bestRoll + expertiseValue;
        const rollPart = rolls.length > 1
            ? `${rolls.join(', ')}: ${bestRoll}`
            : `${bestRoll}`;

        const creatureName = combatant?.name || creature.name || 'Criatura';
        const remarks = [ ...(keep === 'lowest' ? [ 'desvantagem' ] : []), ...(effects?.notes ?? []) ];
        const label = `${expertiseName.toUpperCase()}${remarks.length > 0 ? ` (${remarks.join('; ')})` : ''}`;

        const text = `🎲 [${creatureName}] ${label} - ${dice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`;

        await handleSendMessage(text, MessageType.EXPERTISE);

        if (!isChatOpen) {
            setIsChatOpen(true);
        }
    };

    return handleCreatureExpertiseRoll;
}
