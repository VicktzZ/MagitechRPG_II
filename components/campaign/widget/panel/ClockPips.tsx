import type { ReactElement } from 'react';
import { alpha, Box } from '@mui/material';

/** Marcador segmentado ao estilo "clock" — preenche à medida que o relógio avança */
export default function ClockPips({ current, max, color }: { current: number; max: number; color: string }): ReactElement {
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
