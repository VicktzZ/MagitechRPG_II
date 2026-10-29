import { useState, type ReactElement } from 'react';
import { alpha, Box, Chip, Collapse, Paper, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimerIcon from '@mui/icons-material/Timer';
import type { CampaignWidget } from '@models';
import ClockPips from './ClockPips';
import AdjustRow from './AdjustRow';

interface ClocksSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    onAdjustClock: (clockId: string, value: number) => Promise<void>;
}

/** Relógios (beta) — contagens segmentadas para tensão narrativa */
export default function ClocksSection({ widget, isFinished, onAdjustClock }: ClocksSectionProps): ReactElement | null {
    const theme = useTheme();
    const [ clocksOpen, setClocksOpen ] = useState(false);

    if ((widget.clocks?.length ?? 0) === 0) return null;

    return (
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
                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.75rem', fontWeight: 700 }} />
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
                                sx={{ p: 1, ...(triggered && { borderColor: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) }) }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption" fontWeight={700}>
                                        {clock.icon ? `${clock.icon} ` : ''}{clock.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {clock.current}/{clock.max}{clock.unit ? ` ${clock.unit}` : ''}
                                    </Typography>
                                </Box>
                                <ClockPips current={clock.current} max={clock.max} color={triggered ? theme.palette.error.main : (clock.color || theme.palette.info.main)} />
                                <AdjustRow
                                    value={clock.current} max={clock.max} disabled={isFinished}
                                    onChange={async (v) => await onAdjustClock(clock.id, v)}
                                />
                                {triggered && clock.triggeredMessage && (
                                    <Typography variant="caption" sx={{ color: 'error.main' }} fontWeight={700} display="block" mt={0.5}>
                                        {clock.triggeredMessage}
                                    </Typography>
                                )}
                            </Paper>
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
}
