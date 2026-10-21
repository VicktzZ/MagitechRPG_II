import { useState, type ReactElement } from 'react';
import { Box, Button, Chip, Collapse, Paper, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SavingsIcon from '@mui/icons-material/Savings';
import type { CampaignWidget, WidgetPool } from '@models';
import ResourceBar from './ResourceBar';

interface PoolsSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    onOpenPoolDialog: (pool: WidgetPool, mode: 'deposit' | 'withdraw') => void;
}

/** Fundos Comuns (beta) — recursos alimentados por contribuições rastreadas dos jogadores */
export default function PoolsSection({ widget, isFinished, onOpenPoolDialog }: PoolsSectionProps): ReactElement | null {
    const theme = useTheme();
    const [ poolsOpen, setPoolsOpen ] = useState(false);

    if ((widget.pools?.length ?? 0) === 0) return null;

    return (
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
                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.75rem', fontWeight: 700 }} />
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
                                max={pool.max} unit={pool.unit} color={pool.color || theme.palette.info.main}
                            />
                            {!isFinished && (
                                <Box display="flex" gap={0.5} mt={0.5}>
                                    <Button size="small" variant="outlined" onClick={() => onOpenPoolDialog(pool, 'deposit')}>
                                        Depositar
                                    </Button>
                                    <Button
                                        size="small" variant="outlined"
                                        disabled={pool.value <= 0}
                                        onClick={() => onOpenPoolDialog(pool, 'withdraw')}
                                    >
                                        Retirar
                                    </Button>
                                </Box>
                            )}
                            {(pool.history?.length ?? 0) > 0 && (
                                <Box mt={0.5} display="flex" flexDirection="column" gap={0.15}>
                                    {pool.history.slice(0, 3).map(entry => (
                                        <Typography key={entry.id} variant="caption" color="text.secondary" fontSize="0.75rem">
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
    );
}
