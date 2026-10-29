'use client';

import type { Combatant } from '@models';
import { campaignService } from '@services';
import { SLOT_EXECUTION } from '@utils/combat/actionBudgets';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import { asRequestError, errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { handleHealingBlocked } from '../healBlocked';

interface CallsOptions {
    campaignId: string;
    /** O combatente do jogador que está vendo */
    userCombatant: Combatant | undefined;
    isGM: boolean;
    /** Quem tem a vez (o mestre aplica dano e cura por ele) */
    currentCombatant: Combatant | undefined;
    onActionComplete?: () => void;
}

export interface DamageHealInput {
    type: 'damage' | 'heal';
    targetId: string;
    value: number;
}

const post = async (campaignId: string, body: Record<string, unknown>): Promise<{ ok: boolean; result: Record<string, unknown> }> => {
    const response = await fetch(`/api/campaign/${campaignId}/combat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return { ok: response.ok, result: await response.json() as Record<string, unknown> };
};

const failure = (result: Record<string, unknown>, fallback: string): Error => new Error(typeof result['error'] === 'string' && result['error'] ? result['error'] : fallback);

/** As chamadas do card de combate do jogador à rota de combate: rolar iniciativa, gastar ação, passar o turno e aplicar dano ou cura. Cada uma com o seu "ocupado". */
export function useCombatStatusCalls({ campaignId, userCombatant, isGM, currentCombatant, onActionComplete }: CallsOptions) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ isRolling, setIsRolling ] = useState(false);
    const [ isPassingTurn, setIsPassingTurn ] = useState(false);
    const [ isSpendingAction, setIsSpendingAction ] = useState(false);
    const [ isApplying, setIsApplying ] = useState(false);

    /** Devolve `true` se rolou (o diálogo fecha) */
    const rollInitiative = useCallback(async (): Promise<boolean> => {
        if (!userCombatant) return false;

        setIsRolling(true);
        try {
            const { ok, result } = await post(campaignId, { action: 'roll_initiative', combatantId: userCombatant.id });
            if (!ok) throw failure(result, 'Erro ao rolar iniciativa');

            enqueueSnackbar('Iniciativa rolada! Veja o chat para o resultado.', { variant: 'success' });
            onActionComplete?.();
            return true;
        } catch (error) {
            console.error('Erro ao rolar iniciativa:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao rolar iniciativa', { variant: 'error' });
            return false;
        } finally {
            setIsRolling(false);
        }
    }, [ campaignId, userCombatant, enqueueSnackbar, onActionComplete ]);

    // Marcar uma ação da rodada como usada (o jogador só gasta; quem devolve é o mestre)
    const spendAction = useCallback(async (slot: ActionSlot, available: boolean): Promise<void> => {
        if (!userCombatant || !available) return;

        setIsSpendingAction(true);
        try {
            await campaignService.spendCombatAction(campaignId, { combatantId: userCombatant.id, execution: SLOT_EXECUTION[slot] });
            onActionComplete?.();
        } catch (error) {
            const { response } = asRequestError(error);
            const unavailable = response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE';
            enqueueSnackbar(errorMessage(error, 'Erro ao gastar a ação'), { variant: unavailable ? 'warning' : 'error' });
        } finally {
            setIsSpendingAction(false);
        }
    }, [ campaignId, userCombatant, enqueueSnackbar, onActionComplete ]);

    const passTurn = useCallback(async (): Promise<void> => {
        setIsPassingTurn(true);
        try {
            const { ok, result } = await post(campaignId, { action: 'next_turn' });
            if (!ok) throw failure(result, 'Erro ao passar turno');

            enqueueSnackbar('Turno passado!', { variant: 'success' });
            onActionComplete?.();
        } catch (error) {
            console.error('Erro ao passar turno:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao passar turno', { variant: 'error' });
        } finally {
            setIsPassingTurn(false);
        }
    }, [ campaignId, enqueueSnackbar, onActionComplete ]);

    /** Devolve `true` se aplicou (o diálogo fecha). `force` é a cura do mestre em quem tem Necrose, Incurável... */
    const applyDamageHeal = useCallback(async ({ type, targetId, value }: DamageHealInput, force = false): Promise<boolean> => {
        if (!targetId || value <= 0) {
            enqueueSnackbar('Selecione um alvo e um valor válido', { variant: 'warning' });
            return false;
        }

        setIsApplying(true);
        try {
            // Se for GM, usa o combatente do turno atual; se for jogador, usa o próprio combatente
            const actorId = isGM && currentCombatant ? currentCombatant.id : userCombatant?.id;

            const { ok, result } = await post(campaignId, {
                action: type === 'damage' ? 'apply_damage' : 'apply_heal',
                combatantId: actorId,
                targetId,
                value,
                ...(force ? { force: true } : {})
            });

            // Necrose, Incurável...: o alvo não recebe cura. O mestre pode curar mesmo assim
            const forceHeal = (): void => { void applyDamageHeal({ type, targetId, value }, true); };
            if (!ok && handleHealingBlocked(result as { code?: string; error?: string; canForce?: boolean }, { enqueueSnackbar, closeSnackbar }, forceHeal)) return false;
            if (!ok) throw failure(result, 'Erro ao aplicar ação');

            enqueueSnackbar(type === 'damage' ? `${value} de dano aplicado!` : `${value} de cura aplicada!`, { variant: 'success' });
            onActionComplete?.();
            return true;
        } catch (error) {
            console.error('Erro ao aplicar ação:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao aplicar ação', { variant: 'error' });
            return false;
        } finally {
            setIsApplying(false);
        }
    }, [ campaignId, isGM, currentCombatant, userCombatant, enqueueSnackbar, closeSnackbar, onActionComplete ]);

    return { isRolling, rollInitiative, isSpendingAction, spendAction, isPassingTurn, passTurn, isApplying, applyDamageHeal };
}
