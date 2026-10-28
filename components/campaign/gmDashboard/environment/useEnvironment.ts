'use client';

import { useCampaignContext } from '@contexts';
import { campaignService } from '@services';
import type { AmbientLight } from '@utils/combat/environment';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export interface EnvironmentActions {
    busy: boolean;
    /** Define a iluminação da cena; devolve `true` se o servidor aceitou */
    setLight: (light: AmbientLight) => Promise<boolean>;
    /** Marca (`difficult: true`) ou desmarca combatentes em terreno difícil; os avisos do servidor saem em snackbar */
    setTerrain: (combatantIds: string[], difficult: boolean) => Promise<boolean>;
}

/** Ambiente manual (ver `utils/combat/environment.ts`): as chamadas ao servidor, que são só do mestre, com os erros e avisos na tela */
export function useEnvironment(): EnvironmentActions {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const setLight: EnvironmentActions['setLight'] = async (light) => {
        setBusy(true);
        try {
            await campaignService.setLight(campaign.id, light);
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao mudar a iluminação'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const setTerrain: EnvironmentActions['setTerrain'] = async (combatantIds, difficult) => {
        setBusy(true);
        try {
            const result = await campaignService.setTerrain(campaign.id, { combatantIds, difficult });
            (result.warnings ?? []).forEach(warning => { enqueueSnackbar(warning, { variant: 'warning' }); });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao marcar o terreno'), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    };

    return { busy, setLight, setTerrain };
}
