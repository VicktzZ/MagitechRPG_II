import { createContext, useContext } from 'react';
import { useCharsheetUpdater } from '@services/firestore/hooks';
import type { CharsheetDTO } from '@models/dtos';

const obj = {};

export const campaignCurrentCharsheetContext = createContext<{ charsheet: CharsheetDTO; updateCharsheet: (data: Partial<CharsheetDTO>) => Promise<void> }>({
    charsheet: obj as CharsheetDTO,
    updateCharsheet: async () => {}
});

export const useCampaignCurrentCharsheetContext = () => {
    const context = useContext(campaignCurrentCharsheetContext);
    const updater = useCharsheetUpdater(context.charsheet.id ?? '');

    return {
        ...context,
        updateCharsheet: updater.updateCharsheet
    };
};