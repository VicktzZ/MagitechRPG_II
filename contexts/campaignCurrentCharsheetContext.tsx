import { charsheetEntity } from '@utils/firestoreEntities';
import { createContext, useCallback, useContext } from 'react';
import type { CharsheetDTO } from '@models/dtos';
import type { Charsheet } from '@models/entities';

const obj = {};

/** Campos da ficha a gravar: o objeto parcial da ficha ou caminhos com ponto ({ 'inventory.money': 10 }) */
export type CharsheetUpdate = Partial<Charsheet> | Record<string, unknown>;

export const campaignCurrentCharsheetContext = createContext<{ charsheet: CharsheetDTO; }>({
    charsheet: obj as CharsheetDTO
});

export const useCampaignCurrentCharsheetContext = () => {
    const context = useContext(campaignCurrentCharsheetContext);
    
    const updateCharsheet = useCallback(async (data: CharsheetUpdate) => {
        if (!context.charsheet.id) return;

        try {
            await charsheetEntity.update(context.charsheet.id, data as Partial<Charsheet>);
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