import { font } from '@themes/tokens';
import { Box, Divider, Paper, Typography, type SxProps } from '@mui/material';
import type { ReactElement } from 'react';

/** Cartão de uma seção da ficha. O `id` é a âncora usada pela lista de erros e pelo aviso de pontos. */
export default function Section({ id, title, icon, children, action, sx }: {
    id?: string;
    title: string;
    icon?: ReactElement;
    children: ReactElement;
    action?: ReactElement;
    sx?: SxProps;
}) {
    return (
        <Paper
            id={id}
            component="section"
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2,
                scrollMarginTop: 16,
                ...sx
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary' }}>
                    {icon}
                    <Typography variant="h6" component="h2" fontFamily={font.display} sx={{ color: 'text.primary' }}>{title}</Typography>
                </Box>
                {action}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    )
}
