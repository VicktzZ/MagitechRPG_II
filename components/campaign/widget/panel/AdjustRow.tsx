import type { ReactElement } from 'react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { NumberField } from '@components/misc';

/** Linha de controle -/número/+ compartilhada por barras principais e recursos */
export default function AdjustRow({ value, min = 0, max, onChange, disabled }: {
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
