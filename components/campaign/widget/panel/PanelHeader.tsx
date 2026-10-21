import type { ReactElement } from 'react';
import { alpha, Box, Chip, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import WidgetsIcon from '@mui/icons-material/Widgets';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { CampaignWidget } from '@models';
import { integrityCondition } from './panelConfig';

interface PanelHeaderProps {
    widget: CampaignWidget;
    /** Há algum alerta de severidade "danger" (o cabeçalho fica vermelho) */
    hasDangerAlert: boolean;
    expanded: boolean;
    isUserGM: boolean;
    onToggle: () => void;
    onOpenManager: () => void;
}

/** Cabeçalho do painel (sempre visível — clique colapsa) */
export default function PanelHeader({ widget, hasDangerAlert, expanded, isUserGM, onToggle, onOpenManager }: PanelHeaderProps): ReactElement {
    const theme = useTheme();
    const condition = integrityCondition(widget);

    // Texto do cabeçalho: branco sobre o vermelho de alerta, escuro sobre o âmbar
    const headerText = hasDangerAlert ? 'common.white' : 'primary.contrastText';

    return (
        <Box
            onClick={onToggle}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                bgcolor: hasDangerAlert
                    ? alpha(theme.palette.error.dark, 0.9)
                    : alpha(theme.palette.primary.main, 0.85),
                color: headerText
            }}
        >
            {widget.icon
                ? <Typography fontSize="1.4rem" lineHeight={1}>{widget.icon}</Typography>
                : <WidgetsIcon />}
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
                        bgcolor: alpha(theme.palette.background.default, 0.25),
                        color: headerText,
                        fontWeight: 700,
                        height: 20,
                        fontSize: '0.75rem'
                    }}
                />
            )}
            {(widget.alerts?.length ?? 0) > 0 && (
                <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: 14, color: 'inherit !important' }} />}
                    label={widget.alerts.length}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.background.default, 0.25), color: headerText, height: 20, fontSize: '0.75rem' }}
                />
            )}
            {isUserGM && (
                <Tooltip title="Administrar (Mestre)">
                    <IconButton
                        size="small"
                        sx={{ color: headerText }}
                        onClick={(e) => { e.stopPropagation(); onOpenManager(); }}
                    >
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <IconButton
                size="small"
                sx={{ color: headerText, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
                <ExpandMoreIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}
