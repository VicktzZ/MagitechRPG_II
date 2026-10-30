'use client';

import type { Combat } from '@models';
import { combatantBudget } from '@utils/combat/actionBudgets';
import { incomingAttacks } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import IncomingAttacksPanel from './IncomingAttacksPanel';
import { useAttackReactions } from './useAttackReactions';
import { useDefenseDeclaration } from './useDefenseDeclaration';

/** Os ataques declarados ao personagem do jogador, com a escolha de defesa (ver `IncomingAttacksPanel`). Só para quem joga: usa a ficha do contexto */
export default function IncomingAttacks({ combat, combatantId }: { combat: Combat; combatantId: string }): ReactElement | null {
    const { busyId, defend } = useDefenseDeclaration();
    const reactions = useAttackReactions();
    const { awaiting, answered } = incomingAttacks(combat.pendingAttacks, combatantId);
    const combatant = combat.combatants?.find(candidate => candidate.id === combatantId);

    return (
        <IncomingAttacksPanel
            awaiting={awaiting}
            answered={answered}
            hasReaction={combatant ? combatantBudget(combatant).reacao > 0 : true}
            // A matriz de percepção é do mestre e o jogador não a lê: o servidor marca o ataque (`surprised`) quando o alvo, jogador, não via o atacante
            isSurprised={(attack) => attack.surprised === true}
            busyId={busyId}
            onDefend={(attack, choice) => { void defend(attack, choice); }}
            reactionsFor={reactions.optionsFor}
            reactBusyKey={reactions.busyKey}
            onReact={(attack, ability) => { void reactions.react(attack, ability); }}
        />
    );
}
