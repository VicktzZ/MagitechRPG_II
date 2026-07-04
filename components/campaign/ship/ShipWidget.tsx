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
import { useSnackbar } from 'notistack';
import type { CampaignShip, ShipComponentStatus } from '@models';
import ShipManagerDialog from './ShipManagerDialog';

const componentStatusConfig: Record<ShipComponentStatus, { label: string; color: string }> = {
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

/** Condição geral derivada do casco */
function hullCondition(ship: CampaignShip): { label: string; color: string } {
    const pct = ship.maxHull > 0 ? (ship.hull / ship.maxHull) * 100 : 0;
    if (pct <= 0) return { label: 'DESTRUÍDA', color: grey[700] };
    if (pct < 25) return { label: 'CRÍTICA', color: red[500] };
    if (pct < 60) return { label: 'AVARIADA', color: orange[500] };
    return { label: 'OPERACIONAL', color: green[500] };
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

export default function ShipWidget(): ReactElement | null {
    const theme = useTheme();
    const { campaign, isUserGM } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ expanded, setExpanded ] = useState(true);
    const [ managerOpen, setManagerOpen ] = useState(false);
    const [ logOpen, setLogOpen ] = useState(false);

    const ship = campaign.ship;
    const isFinished = campaign.status === 'finished';

    if (!ship?.enabled) {
        return null;
    }

    const condition = hullCondition(ship);
    const hullPct = ship.maxHull > 0 ? (ship.hull / ship.maxHull) * 100 : 0;
    const shieldPct = ship.maxShield > 0 ? (ship.shield / ship.maxShield) * 100 : 0;

    /** Ajuste rápido (membros): recursos e estoque */
    const adjust = async (payload: { resourceId?: string; cargoId?: string; delta: number }) => {
        if (isFinished) return;
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/ship`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao atualizar a nave');
            }
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao atualizar a nave', { variant: 'error' });
        }
    };

    const dangerAlerts = ship.alerts?.filter(a => a.severity === 'danger') ?? [];

    return (
        <Paper
            elevation={3}
            sx={{
                mb: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: dangerAlerts.length > 0 ? alpha(red[500], 0.5) : 'divider',
                borderRadius: 2,
                ...(dangerAlerts.length > 0 && {
                    animation: 'ship-alert-pulse 2s infinite',
                    '@keyframes ship-alert-pulse': {
                        '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(red[500], 0.35)}` },
                        '50%': { boxShadow: `0 0 12px 2px ${alpha(red[500], 0.35)}` }
                    }
                })
            }}
        >
            {/* ── Header ── */}
            <Box
                onClick={() => setExpanded(prev => !prev)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
            >
                <Typography fontSize="1.6rem" lineHeight={1}>{ship.icon || '🚀'}</Typography>
                <Box minWidth={0}>
                    <Typography fontWeight={700} noWrap>
                        {ship.name}
                        {ship.shipClass && (
                            <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                                {ship.shipClass}
                            </Typography>
                        )}
                    </Typography>
                    {ship.location && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                            📍 {ship.location}
                        </Typography>
                    )}
                </Box>

                <Box flex={1} />

                <Chip
                    label={condition.label}
                    size="small"
                    sx={{ bgcolor: alpha(condition.color, 0.15), color: condition.color, fontWeight: 700 }}
                />
                {ship.status && (
                    <Chip label={ship.status} size="small" variant="outlined" />
                )}
                {(ship.alerts?.length ?? 0) > 0 && (
                    <Chip
                        icon={<WarningAmberIcon />}
                        label={ship.alerts.length}
                        size="small"
                        color={dangerAlerts.length > 0 ? 'error' : 'warning'}
                    />
                )}
                {isUserGM && (
                    <Tooltip title="Administrar Nave (Mestre)">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setManagerOpen(true); }}
                        >
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <IconButton
                    size="small"
                    sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box p={2} pt={1.5} display="flex" flexDirection="column" gap={2}>
                    {/* ── Alertas ── */}
                    {(ship.alerts?.length ?? 0) > 0 && (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            {ship.alerts.map(alert => {
                                const cfg = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.info;
                                return (
                                    <Box
                                        key={alert.id}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        px={1.5}
                                        py={0.75}
                                        borderRadius={1.5}
                                        sx={{
                                            bgcolor: alpha(cfg.color, 0.1),
                                            border: `1px solid ${alpha(cfg.color, 0.35)}`,
                                            color: cfg.color
                                        }}
                                    >
                                        {cfg.icon}
                                        <Typography variant="body2" fontWeight={600} color="inherit">
                                            {alert.text}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    {/* ── Casco e Escudos ── */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <ResourceBar
                                label="Casco"
                                icon="🛡️"
                                value={ship.hull}
                                max={ship.maxHull}
                                color={hullPct < 25 ? red[500] : hullPct < 60 ? orange[500] : green[500]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <ResourceBar
                                label="Escudos"
                                icon="✨"
                                value={ship.shield}
                                max={ship.maxShield}
                                color={shieldPct < 30 ? orange[400] : blue[400]}
                            />
                        </Grid>
                    </Grid>

                    {/* ── Componentes ── */}
                    {(ship.components?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Sistemas
                            </Typography>
                            <Grid container spacing={1} mt={0}>
                                {ship.components.map(component => {
                                    const statusCfg = componentStatusConfig[component.status] ?? componentStatusConfig.operational;
                                    const compPct = component.maxHp > 0 ? (component.hp / component.maxHp) * 100 : 0;
                                    return (
                                        <Grid item xs={6} sm={4} md={3} key={component.id}>
                                            <Tooltip title={component.description || ''} arrow disableHoverListener={!component.description}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1,
                                                        borderColor: alpha(statusCfg.color, 0.4),
                                                        opacity: component.status === 'offline' ? 0.6 : 1
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                        {component.icon && <Typography fontSize="1rem">{component.icon}</Typography>}
                                                        <Typography variant="caption" fontWeight={700} noWrap flex={1}>
                                                            {component.name}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.max(0, Math.min(100, compPct))}
                                                        sx={{
                                                            height: 5,
                                                            borderRadius: 3,
                                                            mb: 0.5,
                                                            bgcolor: 'action.disabledBackground',
                                                            '& .MuiLinearProgress-bar': { bgcolor: statusCfg.color }
                                                        }}
                                                    />
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            {component.hp}/{component.maxHp}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 700 }}>
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

                    {/* ── Recursos (combustível etc) ── */}
                    {(ship.resources?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Recursos
                            </Typography>
                            <Grid container spacing={1.5} mt={0}>
                                {ship.resources.map(resource => (
                                    <Grid item xs={12} sm={6} key={resource.id}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
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
                                                <Box display="flex" flexDirection="column">
                                                    <IconButton size="small" sx={{ p: 0.25 }} onClick={async () => await adjust({ resourceId: resource.id, delta: 1 })}>
                                                        <AddIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ p: 0.25 }} onClick={async () => await adjust({ resourceId: resource.id, delta: -1 })}>
                                                        <RemoveIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* ── Estoque compartilhado ── */}
                    {(ship.cargo?.length ?? 0) > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Inventory2Icon sx={{ fontSize: 14 }} /> Estoque da Nave
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={0.75}>
                                {ship.cargo.map(item => (
                                    <Tooltip key={item.id} title={item.description || ''} arrow disableHoverListener={!item.description}>
                                        <Paper
                                            variant="outlined"
                                            sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}
                                        >
                                            <Typography variant="body2">{item.name}</Typography>
                                            <Chip label={item.quantity} size="small" sx={{ height: 20, fontWeight: 700 }} />
                                            {!isFinished && (
                                                <>
                                                    <IconButton size="small" sx={{ p: 0.2 }} onClick={async () => await adjust({ cargoId: item.id, delta: -1 })}>
                                                        <RemoveIcon sx={{ fontSize: 13 }} />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ p: 0.2 }} onClick={async () => await adjust({ cargoId: item.id, delta: 1 })}>
                                                        <AddIcon sx={{ fontSize: 13 }} />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Paper>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Diário de bordo ── */}
                    {(ship.log?.length ?? 0) > 0 && (
                        <Box>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                sx={{ cursor: 'pointer', width: 'fit-content' }}
                                onClick={() => setLogOpen(prev => !prev)}
                            >
                                <HistoryEduIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Diário de Bordo ({ship.log.length})
                                </Typography>
                                <ExpandMoreIcon
                                    sx={{ fontSize: 16, color: 'text.secondary', transform: logOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                />
                            </Box>
                            <Collapse in={logOpen}>
                                <Box mt={1} pl={1} borderLeft={`2px solid ${theme.palette.divider}`} display="flex" flexDirection="column" gap={0.75}>
                                    {[ ...ship.log ]
                                        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                                        .slice(0, 10)
                                        .map(entry => (
                                            <Box key={entry.id}>
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                                </Typography>
                                                <Typography variant="body2">{entry.text}</Typography>
                                            </Box>
                                        ))}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {ship.description && (
                        <>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">
                                {ship.description}
                            </Typography>
                        </>
                    )}
                </Box>
            </Collapse>

            {/* Dialog de administração (mestre) */}
            {isUserGM && (
                <ShipManagerDialog
                    open={managerOpen}
                    onClose={() => setManagerOpen(false)}
                />
            )}
        </Paper>
    );
}
