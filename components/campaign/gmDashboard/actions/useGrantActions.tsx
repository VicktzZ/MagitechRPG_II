'use client';

import type { Combatant } from '@models';
import { campaignService } from '@services';
import { combatantBudget, combatantPerRound, describeBudget, type ActionGrantPlan } from '@utils/combat/actionBudgets';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';
import GrantActionsDialog, { type GrantActionsTarget } from './GrantActionsDialog';

interface GrantActions {
    /** Abre o diálogo para dar ou tirar ações de um jogador ou criatura em combate */
    openGrantActions: (combatant: Pick<Combatant, 'id' | 'name' | 'actions' | 'actionsPerRound'>) => void;
    /** Quem usa o hook precisa renderizar isto */
    grantActionsDialog: ReactElement;
}

/** O diálogo "Dar ações" do mestre: manda só a variação das ações de agora e o novo número por rodada (o servidor soma e confere de 0 a 9) */
export function useGrantActions(campaignId: string): GrantActions {
    const { enqueueSnackbar } = useSnackbar();
    const [ target, setTarget ] = useState<GrantActionsTarget | null>(null);

    const save = async (current: GrantActionsTarget, plan: ActionGrantPlan): Promise<void> => {
        try {
            const response = await campaignService.adjustCombatActions(campaignId, {
                combatantId: current.id,
                ...(Object.keys(plan.delta).length > 0 ? { delta: plan.delta } : {}),
                ...(Object.keys(plan.perRound).length > 0 ? { perRound: plan.perRound } : {})
            });
            const fresh = (response as { combat?: { combatants?: Combatant[] } } | undefined)?.combat?.combatants?.find(candidate => candidate.id === current.id);
            enqueueSnackbar(fresh ? `Ações de ${current.name}: ${describeBudget(combatantBudget(fresh))}` : `Ações de ${current.name} ajustadas`, { variant: 'success' });
            setTarget(null);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao ajustar as ações'), { variant: 'error' });
        }
    };

    return {
        openGrantActions: combatant => { setTarget({ id: combatant.id, name: combatant.name, now: combatantBudget(combatant), perRound: combatantPerRound(combatant) }); },
        grantActionsDialog: <GrantActionsDialog target={target} onClose={() => { setTarget(null); }} onSave={save} />
    };
}
