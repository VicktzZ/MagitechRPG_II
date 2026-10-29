'use client'

import { useCampaignContext } from '@contexts';
import { Stack } from '@mui/material';
import type { ReactElement } from 'react';
import CreatureCreator from './CreatureCreator';
import CampaignStatsStrip from './CampaignStatsStrip';
import DeleteCreatureDialog from './DeleteCreatureDialog';
import GMCombatPanel from './combatPanel/GMCombatPanel';
import CustomCreaturesSection from './dashboard/CustomCreaturesSection';
import PlayersSection from './dashboard/PlayersSection';
import { useCreatureManager } from './dashboard/useCreatureManager';
import { useGMDashboardData } from './dashboard/useGMDashboardData';
import { useGMWindowActions } from './windows/GMWindowProvider';

export default function CampaignGMDashboard(): ReactElement | null {
    const { campaign } = useCampaignContext()
    const { playerCharsheets, isPlayerCharsheetsPending, campaignStats } = useGMDashboardData();
    const creatureManager = useCreatureManager();
    const { openWindow } = useGMWindowActions();

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            {/* Faixa com o resumo da campanha (e o combate, se houver) */}
            <CampaignStatsStrip
                totalPlayers={campaignStats.totalPlayers}
                averageLevel={campaignStats.averageLevel}
                highestLevel={campaignStats.highestLevel}
                combatRound={campaign.session?.combat?.isActive ? campaign.session.combat.round : undefined}
                loading={isPlayerCharsheetsPending}
            />

            {/* O combate (só com combate ativo): ordem de turnos, combatentes, ataques esperando, ambiente e histórico */}
            <GMCombatPanel />

            {/* Lista de Jogadores */}
            <PlayersSection playerCharsheets={playerCharsheets} pending={isPlayerCharsheetsPending} />

            {/* Seção de Criaturas Customizadas */}
            <CustomCreaturesSection
                onView={creature => openWindow('creature', creature.id)}
                onEdit={creatureManager.handleEditCreature}
                onDelete={creatureManager.handleRequestDeleteCreature}
                onCreate={creatureManager.handleNewCreature}
            />

            <CreatureCreator
                open={creatureManager.creatureModalOpen}
                onClose={creatureManager.handleCloseCreatureModal}
                editingCreature={creatureManager.selectedCreature || undefined}
            />

            <DeleteCreatureDialog
                open={creatureManager.deleteDialogOpen}
                creatureName={creatureManager.creatureToDelete?.name ?? ''}
                deleting={creatureManager.isDeletingCreature}
                onConfirm={creatureManager.handleConfirmDeleteCreature}
                onCancel={creatureManager.handleCancelDeleteCreature}
            />
        </Stack>
    )
}
