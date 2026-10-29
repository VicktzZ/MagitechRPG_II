'use client';

import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';
import SetMpSpentDialog, { type SetMpSpentTarget } from './SetMpSpentDialog';

interface SetMpSpent {
    /** Abre o diálogo para definir o MP gasto na rodada de um jogador ou criatura em combate */
    openSetMpSpent: (target: SetMpSpentTarget) => void;
    /** Quem usa o hook precisa renderizar isto */
    setMpSpentDialog: ReactElement;
}

/** O mestre define o MP gasto na rodada (a parte "atual" do limite de MP por turno); o servidor confere 0 até o limite */
export function useSetMpSpent(campaignId: string): SetMpSpent {
    const { enqueueSnackbar } = useSnackbar();
    const [ target, setTarget ] = useState<SetMpSpentTarget | null>(null);

    const save = async (current: SetMpSpentTarget, value: number): Promise<void> => {
        try {
            await campaignService.setMpSpent(campaignId, { combatantId: current.id, value });
            enqueueSnackbar(`MP gasto de ${current.name}: ${value}/${current.limit}`, { variant: 'success' });
            setTarget(null);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao definir o MP gasto'), { variant: 'error' });
        }
    };

    return {
        openSetMpSpent: setTarget,
        setMpSpentDialog: <SetMpSpentDialog target={target} onClose={() => { setTarget(null); }} onSave={save} />
    };
}
