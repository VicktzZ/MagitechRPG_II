import type { ReactElement } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function ResourceBar({ label, value, max, color, unit, icon }: {
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
