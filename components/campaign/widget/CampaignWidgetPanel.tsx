'use client';

import { useState, type ReactElement } from 'react';
import {
    alpha,
    Box,
    Chip,
    Collapse,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
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
import { amber, blue, green, grey, orange, red } from '@mui/material/colors';
import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { useSnackbar } from 'notistack';
import type { CampaignWidget, WidgetPartStatus } from '@models';
import WidgetManagerDialog from './WidgetManagerDialog';

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

/**
 * Painel FLUTUANTE do widget da campanha — visível a todos os participantes
 * (jogadores e mestre), no mesmo estilo do pop-up de combate.
 */
export default function CampaignWidgetPanel(): ReactElement | null {
    const theme = useTheme();
    const { campaign, isUserGM } = useCampaignContext();
    const { isChatOpen } = useChatContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ expanded, setExpanded ] = useState(true);
    const [ managerOpen, setManagerOpen ] = useState(false);
    const [ logOpen, setLogOpen ] = useState(false);

    const widget = campaign.widget;
    const isFinished = campaign.status === 'finished';

    if (!widget?.enabled) {
        return null;
    }

    const labels = widget.labels;
    const condition = integrityCondition(widget);
    const integrityPct = widget.maxIntegrity > 0 ? (widget.integrity / widget.maxIntegrity) * 100 : 0;
    const secondaryPct = widget.maxSecondary > 0 ? (widget.secondary / widget.maxSecondary) * 100 : 0;

    /** Ajuste rápido (membros): recursos e estoque */
    const adjust = async (payload: { resourceId?: string; stockId?: string; delta: number }) => {
        if (isFinished) return;
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao atualizar o widget');
            }
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao atualizar o widget', { variant: 'error' });
        }
    };

    const dangerAlerts = widget.alerts?.filter(a => a.severity === 'danger') ?? [];

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'fixed',
                bottom: 80,
                // Desloca para a esquerda do chat (400px + gap) quando ele está aberto,
                // para o widget continuar visível ao lado em vez de ficar coberto
                right: isChatOpen ? 416 : 16,
                width: 370,
                maxWidth: isChatOpen ? 'calc(100vw - 432px)' : 'calc(100vw - 32px)',
                zIndex: 1200,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: dangerAlerts.length > 0 ? red[500] : theme.palette.primary.main,
                borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                <ResourceBar
                                    label={labels.integrity}
                                    icon="🛡️"
                                    value={widget.integrity}
                                    max={widget.maxIntegrity}
                                    color={integrityPct < 25 ? red[500] : integrityPct < 60 ? orange[500] : green[500]}
                                />
                            )}
                            {widget.showSecondary && (
                                <ResourceBar
                                    label={labels.secondary}
                                    icon="✨"
                                    value={widget.secondary}
                                    max={widget.maxSecondary}
                                    color={secondaryPct < 30 ? orange[400] : blue[400]}
                                />
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
                                    <Box key={resource.id} display="flex" alignItems="center" gap={0.5}>
                                        <Box flex={1}>
                                            <ResourceBar
                                                label={resource.name}
                                                icon={resource.icon}
                                                value={resource.value}
                                                max={resource.max}
                                                unit={resource.unit}
                                                color={resource.color || blue[400]}
                                            />
                                        </Box>
                                        {!isFinished && (
                                            <Box display="flex">
                                                <IconButton size="small" sx={{ p: 0.25 }} onClick={async () => await adjust({ resourceId: resource.id, delta: -1 })}>
                                                    <RemoveIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                                <IconButton size="small" sx={{ p: 0.25 }} onClick={async () => await adjust({ resourceId: resource.id, delta: 1 })}>
                                                    <AddIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Estoque compartilhado ── */}
                    {(widget.stock?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Inventory2Icon sx={{ fontSize: 13 }} /> {labels.stock}
                            </Typography>
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
                                                    <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await adjust({ stockId: item.id, delta: -1 })}>
                                                        <RemoveIcon sx={{ fontSize: 12 }} />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ p: 0.15 }} onClick={async () => await adjust({ stockId: item.id, delta: 1 })}>
                                                        <AddIcon sx={{ fontSize: 12 }} />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Paper>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Box>
                    )}

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
                />
            )}
        </Paper>
    );
}
