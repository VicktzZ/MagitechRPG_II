import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useSnackbar } from 'notistack';
import { type MouseEvent as ReactMouseEvent, useState } from 'react';
import type { DonationModalState, InventoryItemType } from './inventoryTypes';
import { buildRemovalUpdate } from './inventoryRemoval';

/** Doar e remover itens do inventário: o estado do modal de doação e as gravações na ficha */
export function useInventoryActions() {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();

    // Estado para modal de doação
    const [ donationModal, setDonationModal ] = useState<DonationModalState>({ open: false, item: null, type: 'item' });

    // Abre modal de doação
    const handleOpenDonationModal = (item: any, type: InventoryItemType, e: ReactMouseEvent) => {
        e.stopPropagation();
        setDonationModal({ open: true, item, type });
    };

    const handleCloseDonationModal = () => setDonationModal({ open: false, item: null, type: 'item' });

    // Callback de doação
    const handleDonate = async (targetPlayerId: string, targetCharsheetId: string): Promise<{ success: boolean; message: string }> => {
        if (!donationModal.item || !campaign?.id) {
            return { success: false, message: 'Dados insuficientes para doação' };
        }

        try {
            const response = await fetch(`/api/campaign/${campaign.id}/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donorCharsheetId: charsheet.id,
                    targetCharsheetId,
                    targetUserId: targetPlayerId,
                    itemType: donationModal.type,
                    item: donationModal.item,
                    donorName: charsheet.name || 'Um jogador'
                })
            });

            const result = await response.json();

            if (result.success) {
                // Remove o item do inventário do doador
                await updateCharsheet(buildRemovalUpdate(charsheet, donationModal.item, donationModal.type));

                enqueueSnackbar(result.message, { variant: 'success' });
                setDonationModal({ open: false, item: null, type: 'item' });
            }

            return result;
        } catch (error) {
            console.error('Erro ao doar item:', error);
            return { success: false, message: 'Erro ao processar doação' };
        }
    };

    // Remove o item do inventário (a tela já pediu a confirmação)
    const handleDeleteItem = async (itemToDelete: any, type: InventoryItemType, e?: ReactMouseEvent) => {
        e?.stopPropagation(); // Evita expandir o cartão

        try {
            await updateCharsheet(buildRemovalUpdate(charsheet, itemToDelete, type));

            enqueueSnackbar(`${itemToDelete.name} removido do inventário!`, { variant: 'success' });
        } catch (error) {
            console.error('Erro ao remover item:', error);
            enqueueSnackbar('Erro ao remover item', { variant: 'error' });
        }
    };

    return { donationModal, handleOpenDonationModal, handleCloseDonationModal, handleDonate, handleDeleteItem };
}
