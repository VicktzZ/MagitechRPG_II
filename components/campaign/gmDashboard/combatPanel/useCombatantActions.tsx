'use client';

import { useCampaignContext } from '@contexts';
import type { Combatant, Creature, Expertise } from '@models';
import { campaignService } from '@services';
import type { MpLimitView } from '@utils/combat/combatPanel';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useCallback, type ReactNode } from 'react';
import { useQuickEffect } from '../actions/useQuickEffect';
import { useSetMpSpent } from '../actions/useSetMpSpent';
import { useToggleCombatAction } from '../actions/useToggleCombatAction';
import { useCreatureExpertiseRoll } from '../dashboard/useCreatureExpertiseRoll';
import { useGMWindowActions } from '../windows/GMWindowProvider';
import type { DamageHealKind } from './useDamageHealDialog';

export interface CombatantActions {
    applyEffect: (combatant: Combatant) => void;
    /** Dano ou cura narrados neste combatente (abre o diálogo com ele como alvo) */
    damageHeal: (type: DamageHealKind, combatant: Combatant) => void;
    removeEffect: (combatantId: string, appliedEffectId: string) => Promise<void>;
    setMpSpent: (combatant: Combatant, mp: MpLimitView) => void;
    resetMpLimit: (combatantId: string) => Promise<void>;
    releaseMpLimit: (combatantId: string, enabled: boolean) => Promise<void>;
    toggleAction: (combatantId: string, slot: ActionSlot, available: boolean) => Promise<void>;
    openWindow: (combatant: Combatant) => void;
    /** A rolagem de perícia da criatura (a regra da criatura, não a da ficha) */
    rollCreatureExpertise: (name: string, expertise: Expertise, creature: Creature, combatant: Combatant) => Promise<void>;
    /** Esperando o servidor ao gastar ou devolver uma ação */
    togglingAction: boolean;
    /** Os diálogos que as ações abrem: quem usa precisa renderizá-los uma vez só (não uma por linha) */
    dialogs: ReactNode;
}

/**
 * As ações do mestre sobre um combatente (efeito, limite de MP, ações da rodada, janela, rolagem da criatura), numa instância só para a lista inteira: os diálogos
 * (`dialogs`) são um só e as linhas apenas chamam, em vez de cada uma montar o seu.
 */
export function useCombatantActions(onDamageHeal: (type: DamageHealKind, targetId: string) => void): CombatantActions {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const { openWindow } = useGMWindowActions();
    const { openEffectFor, effectDialog } = useQuickEffect(campaign.id);
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaign.id);
    const { toggleAction, busy: togglingAction } = useToggleCombatAction(campaign.id);
    // Sem criatura em turno: a rolagem sempre diz de qual criatura é
    const rollExpertise = useCreatureExpertiseRoll(null);

    const campaignId = campaign.id;

    const removeEffect = useCallback(async (combatantId: string, appliedEffectId: string): Promise<void> => {
        try {
            await campaignService.removeCombatEffect(campaignId, { targetId: combatantId, appliedEffectId });
            enqueueSnackbar('Efeito removido', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao remover efeito'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    const resetMpLimit = useCallback(async (combatantId: string): Promise<void> => {
        try {
            await campaignService.resetMpLimit(campaignId, { combatantId });
            enqueueSnackbar('Limite de MP resetado', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao resetar o limite de MP'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    const releaseMpLimit = useCallback(async (combatantId: string, enabled: boolean): Promise<void> => {
        try {
            await campaignService.setCombatMpLimitOverride(campaignId, { combatantId, enabled });
            enqueueSnackbar(enabled ? 'Limite de MP liberado até a rodada virar' : 'Limite de MP restabelecido', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao atualizar o limite de MP'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    return {
        applyEffect: (combatant) => { openEffectFor({ id: combatant.id, name: combatant.name }); },
        damageHeal: (type, combatant) => { onDamageHeal(type, combatant.id); },
        removeEffect,
        setMpSpent: (combatant, mp) => { openSetMpSpent({ id: combatant.id, name: combatant.name, spent: mp.spent, limit: mp.limit }); },
        resetMpLimit,
        releaseMpLimit,
        toggleAction,
        // Jogador em combate abre a janela de combatente (id da ficha); criatura, a do combatente dela
        openWindow: (combatant) => { openWindow('combatant', combatant.id); },
        rollCreatureExpertise: async (name, expertise, creature, combatant) => { await rollExpertise(name, expertise, creature, combatant); },
        togglingAction,
        dialogs: <>{effectDialog}{setMpSpentDialog}</>
    };
}
