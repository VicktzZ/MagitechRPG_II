'use client';

import { useState, type ReactElement } from 'react';
import { Box, Chip, Collapse, Divider, Paper, Typography, useTheme } from '@mui/material';
import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { CampaignWidget } from '@models';
import WidgetManagerDialog from './WidgetManagerDialog';
import PanelHeader from './panel/PanelHeader';
import AlertsSection from './panel/AlertsSection';
import MainBarsSection from './panel/MainBarsSection';
import PartsSection from './panel/PartsSection';
import ResourcesSection from './panel/ResourcesSection';
import StockSection from './panel/StockSection';
import PoolsSection from './panel/PoolsSection';
import BountiesSection from './panel/BountiesSection';
import ClocksSection from './panel/ClocksSection';
import CraftingSection from './panel/CraftingSection';
import LogSection from './panel/LogSection';
import StockTransferDialog from './panel/StockTransferDialog';
import PoolTransactionDialog from './panel/PoolTransactionDialog';
import { useWidgetActions } from './panel/useWidgetActions';
import { useStockTransfer } from './panel/useStockTransfer';
import { usePoolTransaction } from './panel/usePoolTransaction';

interface SingleWidgetPanelProps {
    widget: CampaignWidget;
    campaignId: string;
    isUserGM: boolean;
    isFinished: boolean;
}

export default function SingleWidgetPanel({ widget, campaignId, isUserGM, isFinished }: SingleWidgetPanelProps): ReactElement {
    const theme = useTheme();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const [ expanded, setExpanded ] = useState(true);
    const [ managerOpen, setManagerOpen ] = useState(false);

    const hasCharsheet = !!charsheet?.id;
    const ownItems = charsheet?.inventory?.items ?? [];
    /** Ausente/true = comportamento padrão (jogadores podem ajustar recursos e estoque diretamente). */
    const canManageResources = isUserGM || widget.playersCanManageResources !== false;

    const actions = useWidgetActions({ widgetId: widget.id, campaignId, isFinished, charsheetId: charsheet?.id });
    const stockTransfer = useStockTransfer({ widgetId: widget.id, campaignId, charsheetId: charsheet?.id, ownItems });
    const poolTransaction = usePoolTransaction({ widgetId: widget.id, campaignId });

    const hasDangerAlert = (widget.alerts?.filter(a => a.severity === 'danger') ?? []).length > 0;

    return (
        <Paper
            elevation={4}
            sx={{
                width: 370,
                maxWidth: 'calc(100vw - 32px)',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: hasDangerAlert ? theme.palette.error.main : theme.palette.primary.main,
                borderRadius: 2,
                bgcolor: 'background.paper'
            }}
        >
            {/* ── Header (sempre visível — clique colapsa) ── */}
            <PanelHeader
                widget={widget}
                hasDangerAlert={hasDangerAlert}
                expanded={expanded}
                isUserGM={isUserGM}
                onToggle={() => setExpanded(prev => !prev)}
                onOpenManager={() => setManagerOpen(true)}
            />

            <Collapse in={expanded}>
                <Box p={1.5} display="flex" flexDirection="column" gap={1.5} maxHeight="60vh" overflow="auto">
                    {/* ── Status/local ── */}
                    {(widget.status || widget.location) && (
                        <Box display="flex" gap={0.75} flexWrap="wrap">
                            {widget.status && <Chip label={widget.status} size="small" variant="outlined" />}
                            {widget.location && (
                                <Chip label={widget.location} size="small" variant="outlined" />
                            )}
                        </Box>
                    )}

                    <AlertsSection widget={widget} />

                    <MainBarsSection widget={widget} isFinished={isFinished} onAdjustBar={actions.adjustBar} />

                    <PartsSection widget={widget} />

                    <ResourcesSection
                        widget={widget}
                        isFinished={isFinished}
                        canManageResources={canManageResources}
                        onAdjustResource={actions.adjustResource}
                    />

                    <StockSection
                        widget={widget}
                        isFinished={isFinished}
                        hasCharsheet={hasCharsheet}
                        ownItemsCount={ownItems.length}
                        canManageResources={canManageResources}
                        onAdjustStock={actions.adjustStock}
                        onWithdraw={stockTransfer.openWithdraw}
                        onDeposit={stockTransfer.openDeposit}
                    />

                    <PoolsSection widget={widget} isFinished={isFinished} onOpenPoolDialog={poolTransaction.openPoolDialog} />

                    <BountiesSection
                        widget={widget}
                        isUserGM={isUserGM}
                        isFinished={isFinished}
                        hasCharsheet={hasCharsheet}
                        onClaimBounty={actions.claimBounty}
                        onApproveBounty={actions.approveBounty}
                    />

                    <ClocksSection widget={widget} isFinished={isFinished} onAdjustClock={actions.adjustClock} />

                    <CraftingSection
                        widget={widget}
                        isFinished={isFinished}
                        hasCharsheet={hasCharsheet}
                        onCraft={actions.craft}
                    />

                    <LogSection widget={widget} />

                    {widget.description && (
                        <>
                            <Divider />
                            <Typography variant="caption" color="text.secondary">
                                {widget.description}
                            </Typography>
                        </>
                    )}
                </Box>
            </Collapse>

            {/* Dialog de administração (mestre) */}
            {isUserGM && (
                <WidgetManagerDialog
                    open={managerOpen}
                    onClose={() => setManagerOpen(false)}
                    initialWidgetId={widget.id}
                />
            )}

            {/* Dialog de transferência (depósito/retirada) */}
            <StockTransferDialog state={stockTransfer} ownItems={ownItems} />

            {/* Dialog de transação de fundo comum */}
            <PoolTransactionDialog state={poolTransaction} />
        </Paper>
    );
}
