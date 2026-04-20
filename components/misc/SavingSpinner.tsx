'use client';

import { Box, CircularProgress } from '@mui/material';
import type { ReactElement } from 'react';
import { useSavingSpinner } from '@contexts/savingSpinnerContext';
import { amber } from '@mui/material/colors';

export function SavingSpinner(): ReactElement | null {
    const { isSaving } = useSavingSpinner()

    if (!isSaving) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1500
            }}
        >
            <CircularProgress
                size={30}
                sx={{
                    color: amber[500]
                }}
            />
        </Box>
    );
}
