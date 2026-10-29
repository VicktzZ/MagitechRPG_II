'use client';

import { useCampaignContext } from '@contexts';
import { Badge, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { combatAttention } from '@utils/combat/combatPanel';
import { useState, type ReactElement, type ReactNode } from 'react';
import PendingAttacksPanel from '../attacks/PendingAttacksPanel';
import EnvironmentPanel from '../environment/EnvironmentPanel';
import { usePlayerInfos } from '../playerInfos';
import AttentionNotice from './AttentionNotice';
import CombatPanelHeader from './CombatPanelHeader';
import CombatantsTab from './CombatantsTab';
import HistoryTab from './HistoryTab';
import { useGmCombat } from './useGmCombat';

type TabId = 'combatentes' | 'ataques' | 'ambiente' | 'historico';

const idOf = (tab: TabId): { tab: string; panel: string } => ({ tab: `combat-tab-${tab}`, panel: `combat-panel-${tab}` });

function TabPanel({ tab, active, children }: { tab: TabId; active: TabId; children: ReactNode }): ReactElement | null {
    if (tab !== active) return null;
    return <Box role="tabpanel" id={idOf(tab).panel} aria-labelledby={idOf(tab).tab} sx={{ pt: 2 }}>{children}</Box>;
}

/**
 * O painel de combate do mestre, uma seção fixa no topo do dashboard enquanto há combate (no lugar do antigo diálogo): o topo com a rodada, a vez e a ordem de turnos
 * fica à vista; abaixo, abas para os combatentes (com as ações de cada um), os ataques e reações esperando o mestre, o ambiente e o histórico. O estado vem da campanha em
 * tempo real, então nada precisa ser buscado de volta. Sem combate ativo não desenha nada (começar é o diálogo "Iniciar combate").
 */
export default function GMCombatPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const players = usePlayerInfos();
    const controls = useGmCombat(campaign.id);
    const [ tab, setTab ] = useState<TabId>('combatentes');
    const combat = campaign.session?.combat;

    if (!combat?.isActive) return null;

    const attention = combatAttention(combat);
    const inAction = combat.phase === 'ACTION';

    return (
        <Paper id="combate" component="section" elevation={2} sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 0, sm: 0 }, borderRadius: 2, scrollMarginTop: 'var(--campaign-sticky-offset, 16px)' }}>
            <CombatPanelHeader combat={combat} controls={controls} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1.5 }}>
                {tab !== 'ataques' && inAction && <AttentionNotice attention={attention} onSee={() => { setTab('ataques'); }} />}

                <Tabs value={tab} onChange={(_event, value: TabId) => { setTab(value); }} variant="scrollable" scrollButtons="auto" aria-label="Seções do combate">
                    <Tab
                        value="combatentes"
                        id={idOf('combatentes').tab}
                        aria-controls={idOf('combatentes').panel}
                        label={`Combatentes (${combat.combatants?.length ?? 0})`}
                        sx={{ textTransform: 'none' }}
                    />
                    <Tab
                        value="ataques"
                        id={idOf('ataques').tab}
                        aria-controls={idOf('ataques').panel}
                        sx={{ textTransform: 'none' }}
                        label={(
                            <Badge badgeContent={inAction ? attention.total : 0} color="primary" sx={{ '& .MuiBadge-badge': { right: -16, top: 2 } }}>
                                <Box component="span">Ataques</Box>
                            </Badge>
                        )}
                    />
                    <Tab value="ambiente" id={idOf('ambiente').tab} aria-controls={idOf('ambiente').panel} label="Ambiente" sx={{ textTransform: 'none' }} />
                    <Tab value="historico" id={idOf('historico').tab} aria-controls={idOf('historico').panel} label="Histórico" sx={{ textTransform: 'none' }} />
                </Tabs>
            </Box>

            <TabPanel tab="combatentes" active={tab}>
                <CombatantsTab combat={combat} players={players} creatures={campaign.custom?.creatures ?? []} controls={controls} />
            </TabPanel>
            <TabPanel tab="ataques" active={tab}>
                {inAction ? (
                    <PendingAttacksPanel />
                ) : (
                    <Typography color="text.secondary">Os ataques, as saídas de alcance e as reações aparecem aqui na fase de ação, depois de definida a ordem de iniciativa.</Typography>
                )}
            </TabPanel>
            <TabPanel tab="ambiente" active={tab}>
                <EnvironmentPanel />
            </TabPanel>
            <TabPanel tab="historico" active={tab}>
                <HistoryTab campaignId={campaign.id} combat={combat} />
            </TabPanel>
        </Paper>
    );
}
