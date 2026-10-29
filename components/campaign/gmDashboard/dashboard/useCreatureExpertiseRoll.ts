import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import type { Combatant, Creature, Expertise } from '@models';
import { adjustDice, effectDice, expertiseScope, keptDie } from '@utils/combat/effectDice';
import { creatureD20Pool, SINGLE_D20 } from '@utils/d20Rule';

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
        // Regra única de d20: o modificador do atributo da criatura (0 vale -1, 5 vale 1, 10 vale 2... até 5) + 1; negativo rola 2 e vale o menor
        const pool = defaultAttrKey ? creatureD20Pool(Number(creature.attributes?.[defaultAttrKey] ?? 0) || 0) : SINGLE_D20;

        // Percepção e Furtividade levam as vantagens e desvantagens dos efeitos aplicados à criatura (saldo de d20, como no jogador)
        const scope = expertiseScope(expertiseName);
        const effects = scope ? effectDice(combatant?.effects, scope) : undefined;
        const { dice, keep } = effects ? adjustDice(pool, effects) : pool;

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
