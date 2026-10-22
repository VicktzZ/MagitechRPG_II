import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import type { Armor, Item, Weapon } from '@models';
import { useSnackbar } from 'notistack';
import { type MouseEvent as ReactMouseEvent, useState } from 'react';
import type { DonationModalState, InventoryItemType } from './inventoryTypes';
import { normalizeToArray } from '@utils/normalizeToArray';

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
                const itemWeight = (donationModal.item.weight || 0) * (donationModal.item.quantity || 1);
                const updatedInventory: Record<string, unknown> = {};

                switch (donationModal.type) {
                case 'weapon':
                    updatedInventory['inventory.weapons'] = normalizeToArray<Weapon>(charsheet.inventory.weapons).filter(w => w.id !== donationModal.item.id);
                    break;
                case 'armor': {
                    updatedInventory['inventory.armors'] = normalizeToArray<Armor>(charsheet.inventory.armors).filter(a => a.id !== donationModal.item.id);
                    // Decrementa AP ao doar armadura
                    const armorAPValue = donationModal.item.ap || donationModal.item.value || 0;
                    const currentAP = charsheet.stats?.ap || 5;
                    const currentMaxAP = charsheet.stats?.maxAp || 5;
                    const newAP = Math.max(5, currentAP - armorAPValue);
                    const newMaxAP = Math.max(5, currentMaxAP - armorAPValue);
                    
                    updatedInventory['stats.ap'] = newAP;
                    updatedInventory['stats.maxAp'] = newMaxAP;
                    break;
                }
                case 'item': {
                    updatedInventory['inventory.items'] = normalizeToArray<Item>(charsheet.inventory.items).filter(i => i.id !== donationModal.item.id);
                    // Se o item for do tipo "Capacidade", diminui capacity.max ao invés de cargo
                    if (donationModal.item.kind === 'Capacidade') {
                        const currentMax = charsheet.capacity?.max || 0;
                        const newMax = Math.max(0, currentMax - Math.abs(donationModal.item.weight || 0));
                        updatedInventory['capacity.max'] = parseFloat(newMax.toFixed(1));
                    }
                    break;
                }
                }

                // Atualiza inventário e peso (apenas para itens que não são de Capacidade)
                if (donationModal.type !== 'item' || donationModal.item.kind !== 'Capacidade') {
                    const newCargo = parseFloat(Math.max(0, charsheet.capacity.cargo - itemWeight).toFixed(1));
                    updatedInventory['capacity.cargo'] = newCargo;
                }

                await updateCharsheet(updatedInventory);

                enqueueSnackbar(result.message, { variant: 'success' });
                setDonationModal({ open: false, item: null, type: 'item' });
            }

            return result;
        } catch (error) {
            console.error('Erro ao doar item:', error);
            return { success: false, message: 'Erro ao processar doação' };
        }
    };

    // Função para deletar item do inventário
    const handleDeleteItem = async (itemToDelete: any, type: InventoryItemType, e: ReactMouseEvent) => {
        e.stopPropagation(); // Evita expandir o accordion
        
        try {
            const updatedInventory: Record<string, unknown> = {};
            const itemWeight = (itemToDelete.weight || 0) * (itemToDelete.quantity || 1);
            
            switch (type) {
            case 'weapon':
                updatedInventory['inventory.weapons'] = normalizeToArray<Weapon>(charsheet.inventory.weapons).filter(w => w.id !== itemToDelete.id);
                break;
            case 'armor': {
                updatedInventory['inventory.armors'] = normalizeToArray<Armor>(charsheet.inventory.armors).filter(a => a.id !== itemToDelete.id);
                // Decrementa AP ao remover armadura
                const armorAPValue = itemToDelete.ap || itemToDelete.value || 0;
                const currentAP = charsheet.stats?.ap || 5;
                const currentMaxAP = charsheet.stats?.maxAp || 5;
                const newAP = Math.max(5, currentAP - armorAPValue);
                const newMaxAP = Math.max(5, currentMaxAP - armorAPValue);
                
                updatedInventory['stats.ap'] = newAP;
                updatedInventory['stats.maxAp'] = newMaxAP;
                break;
            }
            case 'item': {
                updatedInventory['inventory.items'] = normalizeToArray<Item>(charsheet.inventory.items).filter(i => i.id !== itemToDelete.id);
                // Se o item for do tipo "Capacidade", diminui capacity.max ao invés de cargo
                if (itemToDelete.kind === 'Capacidade') {
                    const currentMax = charsheet.capacity?.max || 0;
                    const newMax = Math.max(0, currentMax - Math.abs(itemToDelete.weight || 0));
                    updatedInventory['capacity.max'] = parseFloat(newMax.toFixed(1));
                }
                break;
            }
            }

            // Atualiza inventário e peso (apenas para itens que não são de Capacidade)
            if (type !== 'item' || itemToDelete.kind !== 'Capacidade') {
                const newCargo = parseFloat(Math.max(0, charsheet.capacity.cargo - itemWeight).toFixed(1));
                updatedInventory['capacity.cargo'] = newCargo;
            }
            
            await updateCharsheet(updatedInventory);

            enqueueSnackbar(`${itemToDelete.name} removido do inventário!`, { variant: 'success' });
        } catch (error) {
            console.error('Erro ao remover item:', error);
            enqueueSnackbar('Erro ao remover item', { variant: 'error' });
        }
    };

    return { donationModal, handleOpenDonationModal, handleCloseDonationModal, handleDonate, handleDeleteItem };
}
