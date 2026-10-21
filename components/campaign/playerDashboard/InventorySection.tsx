'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { Box, Paper } from '@mui/material';
import type { ReactElement } from 'react';
import { SubstitutionModal } from '@features/roguelite/components/perkCardsModal/components/SubstitutionModal';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import InventoryHeader from './inventory/InventoryHeader';
import InventoryItemList from './inventory/InventoryItemList';
import InventoryTabsBar from './inventory/InventoryTabsBar';
import { useInventoryActions } from './inventory/useInventoryActions';
import { useInventoryFilters } from './inventory/useInventoryFilters';
import { useInventoryTotals } from './inventory/useInventoryTotals';
import { useSessionPlayers } from './inventory/useSessionPlayers';
import { useWeaponRolls } from './inventory/useWeaponRolls';

export default function InventorySection(): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    // Unidade de peso do sistema customizado (ex: "kg", "slots", "" = simbólico)
    const { system: customSystem } = useCharsheetSystem(charsheet.systemId);
    const weightUnit = customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg';
    const weightUnitSuffix = weightUnit ? ` ${weightUnit}` : '';
    const { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredItems } = useInventoryFilters();
    const { handleWeaponHit, handleWeaponDamage } = useWeaponRolls();
    const sessionPlayers = useSessionPlayers();
    const {
        donationModal,
        handleOpenDonationModal,
        handleCloseDonationModal,
        handleDonate,
        handleDeleteItem
    } = useInventoryActions();
    const {
        totalWeight,
        totalItems,
        capacityPercent,
        isOverloaded,
        isNearLimit,
        capacityRole
    } = useInventoryTotals();

    return (
        <Box sx={{ width: '100%' }}>
            {/* A moldura e o título da seção vêm do Section da campanha */}
            <Paper elevation={0} sx={{ bgcolor: 'transparent', overflow: 'hidden' }}>
                {/* Header */}
                <InventoryHeader
                    totalItems={totalItems}
                    totalWeight={totalWeight}
                    maxCapacity={charsheet.capacity.max}
                    weightUnitSuffix={weightUnitSuffix}
                    capacityPercent={capacityPercent}
                    isOverloaded={isOverloaded}
                    isNearLimit={isNearLimit}
                    capacityRole={capacityRole}
                />

                {/* Tabs e Busca */}
                <InventoryTabsBar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    counts={{
                        all: totalItems,
                        weapons: charsheet.inventory.weapons.length,
                        armors: charsheet.inventory.armors.length,
                        items: charsheet.inventory.items.length
                    }}
                />

                {/* Lista de Itens */}
                <InventoryItemList
                    entries={filteredItems}
                    searchQuery={searchQuery}
                    weightUnitSuffix={weightUnitSuffix}
                    canDonate={sessionPlayers.length > 0}
                    onWeaponHit={handleWeaponHit}
                    onWeaponDamage={handleWeaponDamage}
                    onDonate={handleOpenDonationModal}
                    onDelete={handleDeleteItem}
                />
            </Paper>

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
