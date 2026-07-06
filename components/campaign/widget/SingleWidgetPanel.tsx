'use client';

import { useState, type ReactElement } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    Menu,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportIcon from '@mui/icons-material/Report';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import ScienceIcon from '@mui/icons-material/Science';
import SavingsIcon from '@mui/icons-material/Savings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import { amber, blue, green, grey, orange, red } from '@mui/material/colors';
import { useCampaignCurrentCharsheetContext } from '@contexts';
import { useSnackbar } from 'notistack';
import { NumberField } from '@components/misc';
import type { CampaignWidget, WidgetBountyStatus, WidgetPartStatus, WidgetPool, WidgetStockItem } from '@models';
import WidgetManagerDialog from './WidgetManagerDialog';

const bountyStatusConfig: Record<WidgetBountyStatus, { label: string; color: string }> = {
    open: { label: 'Aberta', color: blue[400] },
    pending: { label: 'Pendente', color: amber[600] },
    done: { label: 'Concluída', color: green[500] }
};

const partStatusConfig: Record<WidgetPartStatus, { label: string; color: string }> = {
    operational: { label: 'Operacional', color: green[500] },
    damaged: { label: 'Avariado', color: orange[500] },
    critical: { label: 'Crítico', color: red[500] },
    offline: { label: 'Offline', color: grey[600] }
};

const alertSeverityConfig = {
    info: { color: blue[400], icon: <InfoOutlinedIcon fontSize="small" /> },
    warning: { color: amber[600], icon: <WarningAmberIcon fontSize="small" /> },
    danger: { color: red[500], icon: <ReportIcon fontSize="small" /> }
} as const;

/** Condição geral derivada da barra de integridade */
function integrityCondition(widget: CampaignWidget): { label: string; color: string } {
    const pct = widget.maxIntegrity > 0 ? (widget.integrity / widget.maxIntegrity) * 100 : 0;
    if (pct <= 0) return { label: 'DESTRUÍDO', color: grey[700] };
    if (pct < 25) return { label: 'CRÍTICO', color: red[500] };
    if (pct < 60) return { label: 'AVARIADO', color: orange[500] };
    return { label: 'ESTÁVEL', color: green[500] };
}

function ResourceBar({ label, value, max, color, unit, icon }: {
    label: string;
    value: number;
    max?: number;
    color: string;
    unit?: string;
    icon?: string;
}): ReactElement {
    const pct = max && max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 100;
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
                <Typography variant="caption" fontWeight={600}>
                    {icon ? `${icon} ` : ''}{label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {value}{max !== undefined && max !== null ? ` / ${max}` : ''}{unit ? ` ${unit}` : ''}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.disabledBackground',
                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
                }}
            />
        </Box>
    );
}

/** Linha de controle -/número/+ compartilhada por barras principais e recursos */
function AdjustRow({ value, min = 0, max, onChange, disabled }: {
    value: number;
    min?: number;
    max?: number;
    onChange: (next: number) => void;
    disabled?: boolean;
}): ReactElement | null {
    if (disabled) return null;
    return (
        <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => onChange(value - 1)}>
                <RemoveIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <NumberField
                size="small"
                value={value}
                min={min}
                max={max}
                onChange={onChange}
                sx={{ width: 64, '& input': { textAlign: 'center', py: 0.4, fontSize: '0.75rem' } }}
            />
            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => onChange(value + 1)}>
                <AddIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
}

/** Marcador segmentado ao estilo "clock" — preenche à medida que o relógio avança */
function ClockPips({ current, max, color }: { current: number; max: number; color: string }): ReactElement {
    return (
        <Box display="flex" gap={0.4} flexWrap="wrap">
            {Array.from({ length: Math.max(1, max) }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        bgcolor: i < current ? color : 'action.disabledBackground',
                        border: `1px solid ${alpha(color, 0.5)}`
                    }}
                />
            ))}
        </Box>
    );
}

type TransferDialogState =
    | { mode: 'withdraw'; stockItem: WidgetStockItem }
    | { mode: 'deposit' };

interface PoolDialogState {
    pool: WidgetPool;
    mode: 'deposit' | 'withdraw';
}

interface SingleWidgetPanelProps {
    widget: CampaignWidget;
    campaignId: string;
    isUserGM: boolean;
    isFinished: boolean;
}

export default function SingleWidgetPanel({ widget, campaignId, isUserGM, isFinished }: SingleWidgetPanelProps): ReactElement {
    const theme = useTheme();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ expanded, setExpanded ] = useState(true);
    const [ managerOpen, setManagerOpen ] = useState(false);
    const [ logOpen, setLogOpen ] = useState(false);
    const [ transfer, setTransfer ] = useState<TransferDialogState | null>(null);
    // Guarda o ÍNDICE do item em ownItems (como string, para o Select) — itens do
    // catálogo padrão (ex: "Bolsa") podem não ter um `id` próprio.
    const [ transferItemIndex, setTransferItemIndex ] = useState('');
    const [ transferQty, setTransferQty ] = useState(1);
    const [ transferBusy, setTransferBusy ] = useState(false);
    const [ craftOpen, setCraftOpen ] = useState(false);
    const [ craftRecipesModalOpen, setCraftRecipesModalOpen ] = useState(false);
    const [ craftMultipliers, setCraftMultipliers ] = useState<Record<string, number>>({});
    const [ multiplierMenu, setMultiplierMenu ] = useState<{ recipeId: string; anchor: HTMLElement } | null>(null);
    const [ poolsOpen, setPoolsOpen ] = useState(false);
    const [ bountiesOpen, setBountiesOpen ] = useState(false);
    const [ clocksOpen, setClocksOpen ] = useState(false);
    const [ poolDialog, setPoolDialog ] = useState<PoolDialogState | null>(null);
    const [ poolAmount, setPoolAmount ] = useState(1);
    const [ poolBusy, setPoolBusy ] = useState(false);

    const labels = widget.labels;
    const condition = integrityCondition(widget);
    const integrityPct = widget.maxIntegrity > 0 ? (widget.integrity / widget.maxIntegrity) * 100 : 0;
    const secondaryPct = widget.maxSecondary > 0 ? (widget.secondary / widget.maxSecondary) * 100 : 0;

    const hasCharsheet = !!charsheet?.id;
    const ownItems = charsheet?.inventory?.items ?? [];
    /** Ausente/true = comportamento padrão (jogadores podem ajustar recursos e estoque diretamente). */
    const canManageResources = isUserGM || widget.playersCanManageResources !== false;

    const patch = async (payload: Record<string, unknown>) => {
        if (isFinished) return;
        try {
            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId: widget.id, ...payload })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao atualizar o widget');
            }
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao atualizar o widget', { variant: 'error' });
        }
    };

    const adjustResource = async (resourceId: string, value: number) =>
        await patch({ action: 'adjustResource', resourceId, value });
    const adjustBar = async (bar: 'integrity' | 'secondary', value: number) =>
        await patch({ action: 'adjustBar', bar, value });
    const adjustStock = async (stockId: string, delta: number) =>
        await patch({ action: 'adjustStock', stockId, delta });

    const openWithdraw = (stockItem: WidgetStockItem) => {
        setTransfer({ mode: 'withdraw', stockItem });
        setTransferQty(stockItem.quantity);
    };
    const openDeposit = () => {
        setTransfer({ mode: 'deposit' });
        setTransferItemIndex(ownItems.length > 0 ? '0' : '');
        setTransferQty(ownItems[0]?.quantity ?? 1);
    };
    const closeTransfer = () => {
        setTransfer(null);
        setTransferItemIndex('');
        setTransferQty(1);
    };

    const confirmTransfer = async () => {
        if (!transfer || !charsheet?.id) return;
        setTransferBusy(true);
        try {
            const body = transfer.mode === 'withdraw'
                ? { action: 'withdraw', charsheetId: charsheet.id, stockId: transfer.stockItem.id, quantity: transferQty }
                : { action: 'deposit', charsheetId: charsheet.id, itemIndex: Number(transferItemIndex), quantity: transferQty };

            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId: widget.id, ...body })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro na transferência');
            }
            enqueueSnackbar(transfer.mode === 'withdraw' ? 'Item retirado do estoque!' : 'Item transferido para o estoque!', { variant: 'success' });
            closeTransfer();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro na transferência', { variant: 'error' });
        } finally {
            setTransferBusy(false);
        }
    };

    const getMultiplier = (recipeId: string): number => craftMultipliers[recipeId] ?? 1;
    const craft = async (recipeId: string) =>
        await patch({ action: 'craft', recipeId, quantity: getMultiplier(recipeId), charsheetId: charsheet?.id });

    const claimBounty = async (bountyId: string) => {
        if (!charsheet?.id) return;
        await patch({ action: 'claimBounty', bountyId, charsheetId: charsheet.id });
    };
    const approveBounty = async (bountyId: string) => await patch({ action: 'approveBounty', bountyId });
    const adjustClock = async (clockId: string, value: number) => await patch({ action: 'adjustClock', clockId, value });

    const openPoolDialog = (pool: WidgetPool, mode: 'deposit' | 'withdraw') => {
        setPoolDialog({ pool, mode });
        setPoolAmount(1);
    };
    const confirmPoolTransaction = async () => {
        if (!poolDialog) return;
        setPoolBusy(true);
        try {
            const amount = poolDialog.mode === 'withdraw' ? -Math.abs(poolAmount) : Math.abs(poolAmount);
            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId: widget.id, action: 'poolTransaction', poolId: poolDialog.pool.id, amount })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro na transação');
            }
            enqueueSnackbar(poolDialog.mode === 'deposit' ? 'Depósito realizado!' : 'Retirada realizada!', { variant: 'success' });
            setPoolDialog(null);
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro na transação', { variant: 'error' });
        } finally {
            setPoolBusy(false);
        }
    };

    const dangerAlerts = widget.alerts?.filter(a => a.severity === 'danger') ?? [];
    const stockWeight = (widget.stock ?? []).reduce((sum, s) => sum + (s.weight || 0) * s.quantity, 0);
    const selectedOwnItem = ownItems[Number(transferItemIndex)];

    return (
        <Paper
            elevation={4}
            sx={{
                width: 370,
                maxWidth: 'calc(100vw - 32px)',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: dangerAlerts.length > 0 ? red[500] : theme.palette.primary.main,
                borderRadius: 2,
                bgcolor: 'background.paper',
                ...(dangerAlerts.length > 0 && {
                    animation: 'widget-alert-pulse 2s infinite',
                    '@keyframes widget-alert-pulse': {
                        '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(red[500], 0.4)}` },
                        '50%': { boxShadow: `0 0 14px 3px ${alpha(red[500], 0.4)}` }
                    }
                })
            }}
        >
            {/* ── Header (sempre visível — clique colapsa) ── */}
            <Box
                onClick={() => setExpanded(prev => !prev)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    bgcolor: dangerAlerts.length > 0
                        ? alpha(red[600], 0.9)
                        : alpha(theme.palette.primary.main, 0.85),
                    color: 'white'
                }}
            >
                <Typography fontSize="1.4rem" lineHeight={1}>{widget.icon || '📋'}</Typography>
                <Box minWidth={0} flex={1}>
                    <Typography fontWeight={700} noWrap fontSize="0.95rem">
                        {widget.name}
                    </Typography>
                    {widget.subtitle && (
                        <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap display="block">
                            {widget.subtitle}
                        </Typography>
                    )}
                </Box>
                {widget.showIntegrity && (
                    <Chip
                        label={condition.label}
                        size="small"
                        sx={{
                            bgcolor: alpha('#000', 0.25),
                            color: 'white',
                            fontWeight: 700,
                            height: 20,
                            fontSize: '0.62rem'
                        }}
                    />
                )}
                {(widget.alerts?.length ?? 0) > 0 && (
                    <Chip
                        icon={<WarningAmberIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                        label={widget.alerts.length}
                        size="small"
                        sx={{ bgcolor: alpha('#000', 0.25), color: 'white', height: 20, fontSize: '0.65rem' }}
                    />
                )}
                {isUserGM && (
                    <Tooltip title="Administrar (Mestre)">
                        <IconButton
                            size="small"
                            sx={{ color: 'white' }}
                            onClick={(e) => { e.stopPropagation(); setManagerOpen(true); }}
                        >
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <IconButton
                    size="small"
                    sx={{ color: 'white', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box p={1.5} display="flex" flexDirection="column" gap={1.5} maxHeight="60vh" overflow="auto">
                    {/* ── Status/local ── */}
                    {(widget.status || widget.location) && (
                        <Box display="flex" gap={0.75} flexWrap="wrap">
                            {widget.status && <Chip label={widget.status} size="small" variant="outlined" />}
                            {widget.location && (
                                <Chip label={`📍 ${widget.location}`} size="small" variant="outlined" />
                            )}
                        </Box>
                    )}

                    {/* ── Alertas ── */}
                    {(widget.alerts?.length ?? 0) > 0 && (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            {widget.alerts.map(alert => {
                                const cfg = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.info;
                                return (
                                    <Box
                                        key={alert.id}
                                        display="flex"
                                        alignItems="center"
                                        gap={0.75}
                                        px={1}
                                        py={0.5}
                                        borderRadius={1.5}
                                        sx={{
                                            bgcolor: alpha(cfg.color, 0.1),
                                            border: `1px solid ${alpha(cfg.color, 0.35)}`,
                                            color: cfg.color
                                        }}
                                    >
                                        {cfg.icon}
                                        <Typography variant="caption" fontWeight={600} color="inherit">
                                            {alert.text}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    {/* ── Barras principais ── */}
                    {(widget.showIntegrity || widget.showSecondary) && (
                        <Box display="flex" flexDirection="column" gap={1}>
                            {widget.showIntegrity && (
                                <Box>
                                    <ResourceBar
                                        label={labels.integrity}
                                        icon="🛡️"
                                        value={widget.integrity}
                                        max={widget.maxIntegrity}
                                        color={integrityPct < 25 ? red[500] : integrityPct < 60 ? orange[500] : green[500]}
                                    />
                                    <AdjustRow
                                        value={widget.integrity}
                                        max={widget.maxIntegrity}
                                        disabled={isFinished}
                                        onChange={async (v) => await adjustBar('integrity', v)}
                                    />
                                </Box>
                            )}
                            {widget.showSecondary && (
                                <Box>
                                    <ResourceBar
                                        label={labels.secondary}
                                        icon="✨"
                                        value={widget.secondary}
                                        max={widget.maxSecondary}
                                        color={secondaryPct < 30 ? orange[400] : blue[400]}
                                    />
                                    <AdjustRow
                                        value={widget.secondary}
                                        max={widget.maxSecondary}
                                        disabled={isFinished}
                                        onChange={async (v) => await adjustBar('secondary', v)}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* ── Partes ── */}
                    {(widget.parts?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                {labels.parts}
                            </Typography>
                            <Grid container spacing={0.75} mt={0}>
                                {widget.parts.map(part => {
                                    const statusCfg = partStatusConfig[part.status] ?? partStatusConfig.operational;
                                    const partPct = part.maxHp > 0 ? (part.hp / part.maxHp) * 100 : 0;
                                    return (
                                        <Grid item xs={6} key={part.id}>
                                            <Tooltip title={part.description || ''} arrow disableHoverListener={!part.description}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 0.75,
                                                        borderColor: alpha(statusCfg.color, 0.4),
                                                        opacity: part.status === 'offline' ? 0.6 : 1
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={0.5} mb={0.4}>
                                                        {part.icon && <Typography fontSize="0.85rem">{part.icon}</Typography>}
                                                        <Typography variant="caption" fontWeight={700} noWrap flex={1}>
                                                            {part.name}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.max(0, Math.min(100, partPct))}
                                                        sx={{
                                                            height: 4,
                                                            borderRadius: 2,
                                                            mb: 0.4,
                                                            bgcolor: 'action.disabledBackground',
                                                            '& .MuiLinearProgress-bar': { bgcolor: statusCfg.color }
                                                        }}
                                                    />
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary" fontSize="0.6rem">
                                                            {part.hp}/{part.maxHp}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 700, fontSize: '0.6rem' }}>
                                                            {statusCfg.label}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Tooltip>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    )}

                    {/* ── Recursos ── */}
                    {(widget.resources?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                {labels.resources}
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1} mt={0.5}>
                                {widget.resources.map(resource => (
                                    <Box key={resource.id}>
                                        <ResourceBar
                                            label={resource.name}
                                            icon={resource.icon}
                                            value={resource.value}
                                            max={resource.max}
                                            unit={resource.unit}
                                            color={resource.color || blue[400]}
                                        />
                                        {canManageResources && (
                                            <AdjustRow
                                                value={resource.value}
                                                max={resource.max}
                                                disabled={isFinished}
                                                onChange={async (v) => await adjustResource(resource.id, v)}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Estoque compartilhado ── */}
                    {widget.showStock !== false && ((widget.stock?.length ?? 0) > 0 || hasCharsheet) && (
                        <Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                                <Typography
                                    variant="caption" fontWeight={700} color="text.secondary"
                                    sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                    <Inventory2Icon sx={{ fontSize: 13 }} /> {labels.stock}
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
                                            <Chip label={item.quantity} size="small" sx={{ height: 18, fontWeight: 700, fontSize: '0.65rem' }} />
                                            {!isFinished && (
                                                <>
                                                    {canManageResources && (
                                                        <>
                                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await adjustStock(item.id, -1)}>
                                                                <RemoveIcon sx={{ fontSize: 12 }} />
                                                            </IconButton>
                                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await adjustStock(item.id, 1)}>
                                                                <AddIcon sx={{ fontSize: 12 }} />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    {hasCharsheet && (
                                                        <Tooltip title="Retirar para o meu inventário">
                                                            <IconButton size="small" sx={{ p: 0.15 }} onClick={() => openWithdraw(item)}>
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
                                    disabled={ownItems.length === 0}
                                    onClick={openDeposit}
                                >
                                    Transferir item para o estoque
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* ── Fundos Comuns (beta) ── */}
                    {(widget.pools?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex" alignItems="center" gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setPoolsOpen(prev => !prev)}
                            >
                                <SavingsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Fundos Comuns ({widget.pools.length})
                                </Typography>
                                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }} />
                                <ExpandMoreIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', transform: poolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={poolsOpen}>
                                <Box display="flex" flexDirection="column" gap={1} mt={0.75}>
                                    {widget.pools.map(pool => (
                                        <Paper key={pool.id} variant="outlined" sx={{ p: 1 }}>
                                            <ResourceBar
                                                label={pool.name} icon={pool.icon} value={pool.value}
                                                max={pool.max} unit={pool.unit} color={pool.color || blue[400]}
                                            />
                                            {!isFinished && (
                                                <Box display="flex" gap={0.5} mt={0.5}>
                                                    <Button size="small" variant="outlined" onClick={() => openPoolDialog(pool, 'deposit')}>
                                                        Depositar
                                                    </Button>
                                                    <Button
                                                        size="small" variant="outlined"
                                                        disabled={pool.value <= 0}
                                                        onClick={() => openPoolDialog(pool, 'withdraw')}
                                                    >
                                                        Retirar
                                                    </Button>
                                                </Box>
                                            )}
                                            {(pool.history?.length ?? 0) > 0 && (
                                                <Box mt={0.5} display="flex" flexDirection="column" gap={0.15}>
                                                    {pool.history.slice(0, 3).map(entry => (
                                                        <Typography key={entry.id} variant="caption" color="text.secondary" fontSize="0.62rem">
                                                            {entry.userName} {entry.amount > 0 ? '+' : ''}{entry.amount}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* ── Tarefas / Bounties (beta) ── */}
                    {(widget.bounties?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex" alignItems="center" gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setBountiesOpen(prev => !prev)}
                            >
                                <AssignmentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Tarefas ({widget.bounties.length})
                                </Typography>
                                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }} />
                                <ExpandMoreIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', transform: bountiesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={bountiesOpen}>
                                <Box display="flex" flexDirection="column" gap={0.75} mt={0.75}>
                                    {widget.bounties.map(bounty => {
                                        const statusCfg = bountyStatusConfig[bounty.status];
                                        const rewardResource = widget.resources.find(r => r.id === bounty.rewardResourceId);
                                        const rewardParts = [
                                            bounty.rewardText,
                                            rewardResource ? `${bounty.rewardAmount ?? 0} ${rewardResource.name}` : null
                                        ].filter(Boolean);
                                        return (
                                            <Paper key={bounty.id} variant="outlined" sx={{ p: 1 }}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                                    <Typography variant="caption" fontWeight={700}>{bounty.title}</Typography>
                                                    <Chip
                                                        label={statusCfg.label}
                                                        size="small"
                                                        sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, bgcolor: alpha(statusCfg.color, 0.15), color: statusCfg.color }}
                                                    />
                                                </Box>
                                                {bounty.description && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {bounty.description}
                                                    </Typography>
                                                )}
                                                {rewardParts.length > 0 && (
                                                    <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block">
                                                        Recompensa: {rewardParts.join(' + ')}
                                                    </Typography>
                                                )}
                                                {bounty.status !== 'open' && bounty.claimedByName && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Reivindicada por {bounty.claimedByName}
                                                    </Typography>
                                                )}
                                                <Box display="flex" gap={0.5} mt={0.5} justifyContent="flex-end">
                                                    {bounty.status === 'open' && hasCharsheet && !isFinished && (
                                                        <Button size="small" variant="outlined" onClick={async () => await claimBounty(bounty.id)}>
                                                            Cumprir
                                                        </Button>
                                                    )}
                                                    {bounty.status === 'pending' && isUserGM && !isFinished && (
                                                        <Button size="small" variant="contained" onClick={async () => await approveBounty(bounty.id)}>
                                                            Aprovar
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* ── Relógios (beta) ── */}
                    {(widget.clocks?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex" alignItems="center" gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setClocksOpen(prev => !prev)}
                            >
                                <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Relógios ({widget.clocks.length})
                                </Typography>
                                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }} />
                                <ExpandMoreIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', transform: clocksOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={clocksOpen}>
                                <Box display="flex" flexDirection="column" gap={1} mt={0.75}>
                                    {widget.clocks.map(clock => {
                                        const triggered = clock.current >= clock.max;
                                        return (
                                            <Paper
                                                key={clock.id}
                                                variant="outlined"
                                                sx={{ p: 1, ...(triggered && { borderColor: red[500], bgcolor: alpha(red[500], 0.05) }) }}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Typography variant="caption" fontWeight={700}>
                                                        {clock.icon ? `${clock.icon} ` : ''}{clock.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {clock.current}/{clock.max}{clock.unit ? ` ${clock.unit}` : ''}
                                                    </Typography>
                                                </Box>
                                                <ClockPips current={clock.current} max={clock.max} color={triggered ? red[500] : (clock.color || blue[400])} />
                                                <AdjustRow
                                                    value={clock.current} max={clock.max} disabled={isFinished}
                                                    onChange={async (v) => await adjustClock(clock.id, v)}
                                                />
                                                {triggered && clock.triggeredMessage && (
                                                    <Typography variant="caption" sx={{ color: red[600] }} fontWeight={700} display="block" mt={0.5}>
                                                        ⚠ {clock.triggeredMessage}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* ── Crafting (beta) ── */}
                    {(widget.recipes?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setCraftOpen(prev => !prev)}
                            >
                                <ScienceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Crafting ({widget.recipes.length})
                                </Typography>
                                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }} />
                                <ExpandMoreIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', transform: craftOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={craftOpen}>
                                <Box display="flex" flexDirection="column" gap={0.75} mt={0.75}>
                                    {(widget.craftLog?.length ?? 0) > 0 && (
                                        <Box display="flex" flexDirection="column" gap={0.5}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                Últimas Fabricações
                                            </Typography>
                                            {widget.craftLog!.slice(0, 5).map(entry => (
                                                <Box key={entry.id} display="flex" justifyContent="space-between" gap={1}>
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        <strong>{entry.userName}</strong> fabricou {entry.recipeName} x{entry.quantity}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" flexShrink={0}>
                                                        {new Date(entry.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<ScienceIcon fontSize="small" />}
                                        onClick={() => setCraftRecipesModalOpen(true)}
                                        sx={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}
                                    >
                                        Ver Receitas Disponíveis ({widget.recipes.length})
                                    </Button>
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* ── Modal: catálogo completo de receitas ── */}
                    <Dialog open={craftRecipesModalOpen} onClose={() => setCraftRecipesModalOpen(false)} maxWidth="xs" fullWidth>
                        <DialogTitle>Receitas Disponíveis</DialogTitle>
                        <DialogContent dividers>
                            <Box display="flex" flexDirection="column" gap={0.75}>
                                {widget.recipes.map(recipe => {
                                    const multiplier = getMultiplier(recipe.id);
                                    const missingInputs = recipe.inputs.filter(input => {
                                        const stockItem = widget.stock.find(s => s.name.toLowerCase() === input.stockName.toLowerCase());
                                        return !stockItem || stockItem.quantity < input.quantity * multiplier;
                                    });
                                    const missingResources = (recipe.resourceCosts ?? []).filter(cost => {
                                        const resource = widget.resources.find(r => r.id === cost.resourceId);
                                        return !resource || resource.value < cost.amount * multiplier;
                                    });
                                    const outputKind = recipe.output.kind ?? 'item';
                                    const noDestination = (outputKind !== 'item' || widget.showStock === false) && !hasCharsheet;
                                    const noDestinationMsg = outputKind !== 'item'
                                        ? 'Armas/armaduras vão para o inventário pessoal — entre com uma ficha para fabricar'
                                        : 'Este widget não possui estoque próprio — entre com uma ficha para fabricar';
                                    const canCraft = missingInputs.length === 0 && missingResources.length === 0 && !noDestination;
                                    return (
                                        <Paper key={recipe.id} variant="outlined" sx={{ p: 1 }}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                                <Typography variant="caption" fontWeight={700}>
                                                    {recipe.name}
                                                    {outputKind !== 'item' && (
                                                        <Chip
                                                            label={outputKind === 'weapon' ? 'Arma' : 'Armadura'}
                                                            size="small"
                                                            sx={{ ml: 0.5, height: 14, fontSize: '0.55rem' }}
                                                        />
                                                    )}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Tooltip title={noDestination ? noDestinationMsg : ''}>
                                                        <span>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                disabled={isFinished || noDestination}
                                                                onClick={(e) => setMultiplierMenu({ recipeId: recipe.id, anchor: e.currentTarget })}
                                                                sx={{ minWidth: 0, px: 0.75, fontSize: '0.65rem', py: 0.25 }}
                                                            >
                                                                {multiplier}x
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={noDestination ? noDestinationMsg : ''}>
                                                        <span>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                disabled={!canCraft || isFinished}
                                                                onClick={async () => await craft(recipe.id)}
                                                                sx={{ minWidth: 0, fontSize: '0.65rem', py: 0.25 }}
                                                            >
                                                                Fabricar
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            {recipe.description && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {recipe.description}
                                                </Typography>
                                            )}
                                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                                {recipe.inputs.map(input => {
                                                    const insufficient = missingInputs.includes(input);
                                                    return (
                                                        <Chip
                                                            key={input.id}
                                                            label={`${input.stockName} x${input.quantity * multiplier}`}
                                                            size="small"
                                                            sx={{
                                                                height: 18, fontSize: '0.6rem',
                                                                bgcolor: insufficient ? alpha(red[500], 0.15) : alpha(green[500], 0.15),
                                                                color: insufficient ? red[700] : green[800]
                                                            }}
                                                        />
                                                    );
                                                })}
                                                {(recipe.resourceCosts ?? []).map(cost => {
                                                    const resource = widget.resources.find(r => r.id === cost.resourceId);
                                                    const insufficient = missingResources.includes(cost);
                                                    return (
                                                        <Chip
                                                            key={cost.id}
                                                            label={`${resource?.name ?? '?'} -${cost.amount * multiplier}`}
                                                            size="small"
                                                            sx={{
                                                                height: 18, fontSize: '0.6rem',
                                                                bgcolor: insufficient ? alpha(red[500], 0.15) : alpha(blue[500], 0.15),
                                                                color: insufficient ? red[700] : blue[800]
                                                            }}
                                                        />
                                                    );
                                                })}
                                                <Chip
                                                    label={`→ ${recipe.output.name} x${recipe.output.quantity * multiplier}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 18, fontSize: '0.6rem' }}
                                                />
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCraftRecipesModalOpen(false)}>Fechar</Button>
                        </DialogActions>
                    </Dialog>

                    <Menu
                        anchorEl={multiplierMenu?.anchor ?? null}
                        open={!!multiplierMenu}
                        onClose={() => setMultiplierMenu(null)}
                    >
                        {[ 1, 3, 5, 10 ].map(n => (
                            <MenuItem
                                key={n}
                                selected={multiplierMenu ? getMultiplier(multiplierMenu.recipeId) === n : false}
                                onClick={() => {
                                    if (multiplierMenu) {
                                        setCraftMultipliers(prev => ({ ...prev, [multiplierMenu.recipeId]: n }));
                                    }
                                    setMultiplierMenu(null);
                                }}
                            >
                                {n}x
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* ── Registro/Diário ── */}
                    {(widget.log?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setLogOpen(prev => !prev)}
                            >
                                <HistoryEduIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {labels.log} ({widget.log.length})
                                </Typography>
                                <ExpandMoreIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', transform: logOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={logOpen}>
                                <Box mt={0.75} pl={1} borderLeft={`2px solid ${theme.palette.divider}`} display="flex" flexDirection="column" gap={0.5}>
                                    {[ ...widget.log ]
                                        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                                        .slice(0, 10)
                                        .map(entry => (
                                            <Box key={entry.id}>
                                                <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                                                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                                </Typography>
                                                <Typography variant="caption" display="block">{entry.text}</Typography>
                                            </Box>
                                        ))}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

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
            <Dialog open={!!transfer} onClose={closeTransfer} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {transfer?.mode === 'withdraw' ? 'Retirar do estoque' : 'Transferir para o estoque'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        {transfer?.mode === 'deposit' && (
                            <FormControl fullWidth size="small">
                                <InputLabel>Item</InputLabel>
                                <Select
                                    label="Item"
                                    value={transferItemIndex}
                                    onChange={(e) => {
                                        setTransferItemIndex(e.target.value);
                                        const item = ownItems[Number(e.target.value)];
                                        setTransferQty(item?.quantity ?? 1);
                                    }}
                                >
                                    {ownItems.map((item, idx) => (
                                        <MenuItem key={item.id ?? idx} value={String(idx)}>
                                            {item.name} (x{item.quantity})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {transfer?.mode === 'withdraw' && (
                            <Typography variant="body2">
                                {transfer.stockItem.name} — disponível: {transfer.stockItem.quantity}
                            </Typography>
                        )}
                        <NumberField
                            fullWidth
                            size="small"
                            label="Quantidade"
                            min={1}
                            max={transfer?.mode === 'withdraw' ? transfer.stockItem.quantity : (selectedOwnItem?.quantity ?? 1)}
                            value={transferQty}
                            onChange={setTransferQty}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeTransfer} disabled={transferBusy}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={confirmTransfer}
                        disabled={transferBusy || (transfer?.mode === 'deposit' && !transferItemIndex)}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de transação de fundo comum */}
            <Dialog open={!!poolDialog} onClose={() => setPoolDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {poolDialog?.mode === 'withdraw' ? 'Retirar do fundo' : 'Depositar no fundo'}: {poolDialog?.pool.name}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        <Typography variant="body2" color="text.secondary">
                            Saldo atual: {poolDialog?.pool.value}{poolDialog?.pool.max !== undefined ? ` / ${poolDialog.pool.max}` : ''} {poolDialog?.pool.unit ?? ''}
                        </Typography>
                        <NumberField
                            fullWidth
                            size="small"
                            label="Quantidade"
                            min={1}
                            max={poolDialog?.mode === 'withdraw' ? poolDialog.pool.value : undefined}
                            value={poolAmount}
                            onChange={setPoolAmount}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPoolDialog(null)} disabled={poolBusy}>Cancelar</Button>
                    <Button variant="contained" onClick={confirmPoolTransaction} disabled={poolBusy}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
