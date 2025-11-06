import { charsheetEntity } from '@utils/firestoreEntities';
import { createContext, useCallback, useContext } from 'react';
import type { CharsheetDTO } from '@models/dtos';
import type { Charsheet } from '@models/entities';

const obj = {};

export const campaignCurrentCharsheetContext = createContext<{ charsheet: CharsheetDTO; }>({
    charsheet: obj as CharsheetDTO
});

export const useCampaignCurrentCharsheetContext = () => {
    const context = useContext(campaignCurrentCharsheetContext);
    
    const updateCharsheet = useCallback(async (data: Partial<Charsheet>) => {
        if (!context.charsheet.id) return;

        try {
            await charsheetEntity.update(context.charsheet.id, data);
            console.log('[CharsheetUpdater] Charsheet atualizada:', context.charsheet.id);
        } catch (error) {
            console.error('[CharsheetUpdater] Erro ao atualizar charsheet:', error);
            throw error;
        }
    }, [ context.charsheet?.id ]);

    return {
        ...context,
        updateCharsheet
    };
};