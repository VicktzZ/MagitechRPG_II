'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { Box } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { SubstitutionModal } from '@features/roguelite/components/perkCardsModal/components/SubstitutionModal';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import AttackTargetPicker from './attacks/AttackTargetPicker';
import ConfirmRemoveDialog from './inventory/ConfirmRemoveDialog';
import InventoryItemList from './inventory/InventoryItemList';
import InventorySummary from './inventory/InventorySummary';
import InventoryToolbar from './inventory/InventoryToolbar';
import type { InventoryItemType } from './inventory/inventoryTypes';
import { useInventoryActions } from './inventory/useInventoryActions';
import { useInventoryView } from './inventory/useInventoryFilters';
import { useSessionPlayers } from './inventory/useSessionPlayers';
import { useWeaponRolls } from './inventory/useWeaponRolls';

/** Inventário do jogador na campanha: capacidade, filtro por tipo, busca, ordem e os itens (a moldura e o título vêm do `Section`) */
export default function InventorySection(): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    // Unidade de peso do sistema customizado (ex: "kg", "slots", "" = simbólico)
    const { system: customSystem } = useCharsheetSystem(charsheet.systemId);
    const weightUnit = customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg';
    const weightUnitSuffix = weightUnit ? ` ${weightUnit}` : '';

    const view = useInventoryView();
    const { handleWeaponHit, handleWeaponDamage, targeting } = useWeaponRolls();
    const sessionPlayers = useSessionPlayers();
    const { donationModal, handleOpenDonationModal, handleCloseDonationModal, handleDonate, handleDeleteItem } = useInventoryActions();

    // Remover pede confirmação; o alvo fica guardado depois de fechar para o texto não sumir durante a animação
    const [ removal, setRemoval ] = useState<{ item: unknown; type: InventoryItemType; name: string } | null>(null);
    const [ confirmOpen, setConfirmOpen ] = useState(false);
    const [ removing, setRemoving ] = useState(false);

    const requestRemoval = (item: any, type: InventoryItemType): void => {
        setRemoval({ item, type, name: item.name });
        setConfirmOpen(true);
    };

    const confirmRemoval = async (): Promise<void> => {
        if (!removal) return;
        setRemoving(true);
        try {
            await handleDeleteItem(removal.item, removal.type);
        } finally {
            setRemoving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InventorySummary
                totalItems={view.totalItems}
                counts={view.counts}
                totalWeight={view.totalWeight}
                maxCapacity={view.maxCapacity}
                weightUnitSuffix={weightUnitSuffix}
                capacity={view.capacity}
                armorAp={view.armorAp}
                heaviest={view.heaviest}
            />

            <InventoryToolbar
                activeTab={view.activeTab}
                onTabChange={view.setActiveTab}
                searchQuery={view.searchQuery}
                onSearchChange={view.setSearchQuery}
                sort={view.sort}
                onSortChange={view.setSort}
                counts={{ all: view.totalItems, weapons: view.counts.weapon, armors: view.counts.armor, items: view.counts.item }}
                shown={view.filtered.length}
                isFiltering={view.isFiltering}
            />

            <AttackTargetPicker targeting={targeting} />

            <InventoryItemList
                entries={view.filtered}
                isFiltering={view.isFiltering}
                onClearFilters={view.clearFilters}
                weightUnitSuffix={weightUnitSuffix}
                canDonate={sessionPlayers.length > 0}
                onWeaponHit={handleWeaponHit}
                onWeaponDamage={handleWeaponDamage}
                onDonate={handleOpenDonationModal}
                onRemove={requestRemoval}
            />

            <ConfirmRemoveDialog
                open={confirmOpen}
                target={removal ? { name: removal.name, type: removal.type } : null}
                busy={removing}
                onCancel={() => { setConfirmOpen(false) }}
                onConfirm={() => { void confirmRemoval() }}
            />

            {/* Modal de Doação */}
            {donationModal.open && donationModal.item && (
                <SubstitutionModal
                    open={donationModal.open}
                    type={donationModal.type}
                    newItem={{
                        id: donationModal.item.id,
                        name: donationModal.item.name,
                        description: donationModal.item.description || '',
                        rarity: donationModal.item.rarity,
                        weight: donationModal.item.weight
                    }}
                    existingItems={[]}
                    sessionPlayers={sessionPlayers}
                    onSubstitute={() => {}} // Não usado no modo donateOnly
                    onDonate={handleDonate}
                    onCancel={handleCloseDonationModal}
                    donateOnly={true}
                    itemWeight={donationModal.item.weight || 0}
                />
            )}
        </Box>
    );
}
