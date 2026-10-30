'use client';

import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Combatant, type Creature } from '@models';
import { campaignService } from '@services';
import { SLOT_EXECUTION } from '@utils/combat/actionBudgets';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import { effectDice } from '@utils/combat/effectDice';
import { rollCreatureExpertise } from '@utils/combat/creatureRoll';
import { buildSummonAttackBody, buildSummonHitText, type SummonAttackChoice } from '@utils/combat/summonAttack';
import { summonsOf } from '@utils/combat/summons';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import { asRequestError, errorMessage } from '@utils/errors';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { useCreatureDiceRoll } from '../../gmDashboard/dashboard/useCreatureDiceRoll';
import type { CreatureDice } from '@utils/combat/creatureDice';

export interface SummonsApi {
    /** Os invocados que o jogador controla, na ordem do combate (vazio fora do combate ativo) */
    summons: Combatant[];
    /** A criatura de origem do invocado (dados, perícias, vida) */
    creatureOf: (summon: Combatant) => Creature | undefined;
    /** Espera o servidor */
    busyKey: string | null;
    /** Gasta uma ação do invocado (é aviso: sem a ação, o mestre decide) */
    spend: (summon: Combatant, slot: ActionSlot, available: boolean) => Promise<void>;
    /** Passa o turno do invocado (só quando é a vez dele) */
    passTurn: (summon: Combatant) => Promise<void>;
    /** Rola um dado do invocado e manda o cartão ao chat em nome do jogador */
    rollDice: (summon: Combatant, dice: CreatureDice) => Promise<void>;
    /** Testa o acerto do invocado, rola o dano do dado escolhido e declara o ataque ao mestre; gasta a Padrão. Devolve `true` se deu certo */
    attack: (summon: Combatant, choice: SummonAttackChoice) => Promise<boolean>;
}

/**
 * Os invocados do jogador: criaturas do combate que o mestre pôs sob o controle dele (`utils/combat/summons.ts`). O jogador passa o turno, gasta as ações, rola os dados e declara os
 * ataques pelo invocado; a resolução (AP, defesa do alvo, dano final) continua do mestre, pelo mesmo ataque pendente de sempre.
 */
export function useSummons(): SummonsApi {
    const { campaign } = useCampaignContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const rollSummonDice = useCreatureDiceRoll();
    const [ busyKey, setBusyKey ] = useState<string | null>(null);

    const combat = campaign?.session?.combat;
    const userId = session?.user?.id;
    const summons = useMemo(() => (combat?.isActive ? summonsOf(combat.combatants, userId) : []), [ combat, userId ]);
    const creatureOf = useCallback((summon: Combatant): Creature | undefined => findBaseCreature(summon.id, campaign?.custom?.creatures ?? []) ?? undefined, [ campaign?.custom?.creatures ]);

    const summonerName = (summon: Combatant): string | undefined => combat?.combatants?.find(candidate => candidate.id === summon.summonerId)?.name;

    const run = useCallback(async (key: string, work: () => Promise<void>, fallback: string): Promise<void> => {
        setBusyKey(key);
        try {
            await work();
        } catch (error) {
            const { response } = asRequestError(error);
            const unavailable = response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE';
            enqueueSnackbar(errorMessage(error, fallback), { variant: unavailable ? 'warning' : 'error' });
        } finally {
            setBusyKey(null);
        }
    }, [ enqueueSnackbar ]);

    const spend = useCallback(async (summon: Combatant, slot: ActionSlot, available: boolean): Promise<void> => {
        if (!campaign?.id || !available) return;
        await run(`${summon.id}:${slot}`, async () => { await campaignService.spendCombatAction(campaign.id, { combatantId: summon.id, execution: SLOT_EXECUTION[slot] }); }, 'Erro ao gastar a ação do invocado');
    }, [ campaign?.id, run ]);

    const passTurn = useCallback(async (summon: Combatant): Promise<void> => {
        if (!campaign?.id) return;
        await run(`${summon.id}:turn`, async () => {
            await campaignService.nextTurn(campaign.id);
            enqueueSnackbar(`Turno de ${summon.name} passado`, { variant: 'success' });
        }, 'Erro ao passar o turno do invocado');
    }, [ campaign?.id, enqueueSnackbar, run ]);

    const rollDice = useCallback(async (summon: Combatant, dice: CreatureDice): Promise<void> => {
        const creature = creatureOf(summon);
        if (!creature) return;
        await run(`${summon.id}:dice:${dice.id}`, async () => { await rollSummonDice(creature, dice, summon.name, { asPlayer: true }); }, 'Erro ao rolar o dado do invocado');
    }, [ creatureOf, rollSummonDice, run ]);

    const attack = useCallback(async (summon: Combatant, choice: SummonAttackChoice): Promise<boolean> => {
        const creature = creatureOf(summon);
        if (!campaign?.id || !creature) {
            enqueueSnackbar('Não achei a criatura deste invocado na campanha', { variant: 'error' });
            return false;
        }
        let done = false;
        await run(`${summon.id}:attack`, async () => {
            // Acerto: a perícia do invocado pela regra única de d20, com as vantagens e desvantagens dos efeitos dele
            const roll = rollCreatureExpertise(creature, choice.skill, Math.random, effectDice(summon.effects ?? [], 'attack'));
            if (!roll) throw new Error(`O invocado não tem a perícia ${choice.skill}`);

            const dice = choice.diceId ? creature.dices?.find(candidate => candidate.id === choice.diceId) : undefined;
            const attackName = dice?.name ?? choice.skill;

            // O cartão do dano vai ao chat (em nome do jogador) antes de o ataque ir ao mestre; o total dele é o dano declarado
            const damageRoll = dice ? await rollSummonDice(creature, dice, summon.name, { asPlayer: true }) : undefined;

            await campaignService.declareAttack(campaign.id, buildSummonAttackBody({ summonId: summon.id, choice, attackName, roll, damage: damageRoll?.total }));

            await handleSendMessage(new Message({
                text: buildSummonHitText(summon.name, summonerName(summon), attackName, choice.skill, roll),
                type: MessageType.COMBAT_LOG,
                by: { id: session?.user?.id ?? '', name: session?.user?.name ?? '', image: session?.user?.image ?? '' },
                timestamp: new Date().toISOString(),
                isHTML: true
            }));
            if (!isChatOpen) setIsChatOpen(true);

            // Atacar gasta a Padrão do invocado: é aviso, nunca trava (o mestre decide o que vale)
            await campaignService.spendCombatAction(campaign.id, { combatantId: summon.id, execution: SLOT_EXECUTION.padrao }).catch(() => {
                enqueueSnackbar(`${summon.name} já não tinha a ação Padrão nesta rodada. Avise o mestre.`, { variant: 'warning' });
            });
            done = true;
        }, 'Erro ao declarar o ataque do invocado');
        return done;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ campaign?.id, combat, creatureOf, enqueueSnackbar, handleSendMessage, isChatOpen, rollSummonDice, run, session, setIsChatOpen ]);

    return { summons, creatureOf, busyKey, spend, passTurn, rollDice, attack };
}
