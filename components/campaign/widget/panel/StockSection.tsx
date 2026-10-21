import type { ReactElement } from 'react';
import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import type { CampaignWidget, WidgetStockItem } from '@models';

interface StockSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    /** O usuário tem uma ficha na campanha (pode retirar/depositar itens) */
    hasCharsheet: boolean;
    /** Quantidade de itens no inventário da ficha (0 desabilita o depósito) */
    ownItemsCount: number;
    /** Jogadores podem ajustar o estoque diretamente (sempre verdadeiro para o mestre) */
    canManageResources: boolean;
    onAdjustStock: (stockId: string, delta: number) => Promise<void>;
    onWithdraw: (stockItem: WidgetStockItem) => void;
    onDeposit: () => void;
}

/** Estoque compartilhado do widget, com retirada/depósito no inventário da ficha */
export default function StockSection({
    widget, isFinished, hasCharsheet, ownItemsCount, canManageResources, onAdjustStock, onWithdraw, onDeposit
}: StockSectionProps): ReactElement | null {
    const stockWeight = (widget.stock ?? []).reduce((sum, s) => sum + (s.weight || 0) * s.quantity, 0);

    if (!(widget.showStock !== false && ((widget.stock?.length ?? 0) > 0 || hasCharsheet))) return null;

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                <Typography
                    variant="caption" fontWeight={700} color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <Inventory2Icon sx={{ fontSize: 13 }} /> {widget.labels.stock}
                </Typography>
                {!!widget.stockMaxWeight && (
                    <Typography variant="caption" color="text.secondary">
                        {stockWeight.toFixed(1)} / {widget.stockMaxWeight} {widget.stockWeightUnit ?? 'kg'}
                    </Typography>
                )}
            </Box>
            <Box display="flex" flexWrap="wrap" gap={0.75} mt={0.75}>
                {widget.stock.map(item => (
                    <Tooltip key={item.id} title={item.description || ''} arrow disableHoverListener={!item.description}>
                        <Paper
                            variant="outlined"
                            sx={{ px: 0.75, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <Typography variant="caption">{item.name}</Typography>
                            <Chip label={item.quantity} size="small" sx={{ height: 18, fontWeight: 700, fontSize: '0.75rem' }} />
                            {!isFinished && (
                                <>
                                    {canManageResources && (
                                        <>
                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await onAdjustStock(item.id, -1)}>
                                                <RemoveIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await onAdjustStock(item.id, 1)}>
                                                <AddIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        </>
                                    )}
                                    {hasCharsheet && (
                                        <Tooltip title="Retirar para o meu inventário">
                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={() => onWithdraw(item)}>
                                                <DownloadIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </>
                            )}
                        </Paper>
                    </Tooltip>
                ))}
            </Box>
            {!isFinished && hasCharsheet && (
                <Button
                    size="small"
                    startIcon={<UploadIcon sx={{ fontSize: 15 }} />}
                    sx={{ mt: 0.75 }}
                    disabled={ownItemsCount === 0}
                    onClick={onDeposit}
                >
                    Transferir item para o estoque
                </Button>
            )}
        </Box>
    );
}
