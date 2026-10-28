import { buildActionRollText } from './actionRollMessage';
import { dodgeTarget, resistanceDT } from './engine/defense';
import type { PendingAttackData } from './pendingAttacks';
import type { SheetRollPlan, SheetRollResult } from '../sheetRoll';

/**
 * Mensagem de chat do teste de defesa do jogador atacado (ver `actionRollMessage.ts`, `[AÇÃO] defesa`): o cartão mostra o total, a **DT** e se
 * o teste passou, como o teste de magia da conjuração.
 *
 * A DT sai do total do ataque que o jogador viu no chat (`attack.attackTotal`): resistência = metade do total, para cima; esquiva = o total + 1
 * (Reflexos tem de ser **maior** que o ataque). O mestre ainda pode mexer no total ao resolver (d20 de fraqueza ou de surpresa que só ele rola),
 * então o resultado do cartão vale para o que o jogador viu; quem decide o desfecho é a resolução do mestre.
 */

export type DefenseRollChoice = 'dodge' | 'resist';

/** O que o teste de defesa precisa tirar para passar */
export const defenseRollDT = (choice: DefenseRollChoice, attackTotal: number): number =>
    choice === 'dodge' ? dodgeTarget(attackTotal) : resistanceDT(attackTotal);

interface DefenseMessageInput {
    /** O personagem que se defende */
    who: string;
    /** Perícia rolada: Reflexos na esquiva, RES Física/Mágica/Mental na resistência */
    skill: string;
    choice: DefenseRollChoice;
    attack: Pick<PendingAttackData, 'name' | 'attackerName' | 'attackTotal'>;
    plan: SheetRollPlan;
    result: SheetRollResult;
}

export function buildDefenseRollMessage({ who, skill, choice, attack, plan, result }: DefenseMessageInput): string {
    const bonus = `${plan.bonus >= 0 ? '+' : '-'} ${Math.abs(plan.bonus)}`;

    return buildActionRollText({
        kind: 'defesa',
        player: who,
        title: skill,
        detail: `${choice === 'dodge' ? 'Esquiva' : 'Resistência'} · ${attack.name} de ${attack.attackerName}`,
        critical: false,
        ...(plan.keep === 'lowest' ? { keepLowest: true } : {}),
        ...(plan.notes && plan.notes.length > 0 ? { notes: plan.notes } : {}),
        total: result.total,
        cost: null,
        dt: defenseRollDT(choice, attack.attackTotal),
        segments: [ {
            notation: `${plan.dice}d20${plan.bonus >= 0 ? '+' : ''}${plan.bonus}`,
            display: `[${result.rolls.join(', ')}] ${bonus} ${skill}`,
            total: result.total
        } ]
    });
}
