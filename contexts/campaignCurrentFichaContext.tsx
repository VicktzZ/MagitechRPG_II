import type { Ficha } from '@types';
import { createContext, useContext } from 'react';
import { useFichaUpdater } from '@services/firestore/hooks';

const obj = {};

export const campaignCurrentFichaContext = createContext<{ ficha: Ficha; updateFicha: (data: Partial<Ficha>) => Promise<void> }>({
    ficha: obj as Ficha,
    updateFicha: async () => {}
});

export const useCampaignCurrentFichaContext = () => {
    const context = useContext(campaignCurrentFichaContext);
    const updater = useFichaUpdater(context.ficha._id ?? '');

    return {
        ...context,
        updateFicha: updater.updateFicha
    };
};