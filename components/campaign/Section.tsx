import { Box, Divider, Paper, type SxProps, Typography } from '@mui/material';
import { font } from '@themes/tokens'
import type { ReactElement, ReactNode } from 'react';

/**
 * Seção da campanha (jogador e mestre): título com ícone neutro, filete e conteúdo.
 * Com `id`, a seção é um destino da navegação por âncoras do jogador; `scroll-margin-top`
 * deixa o título livre das barras fixas no topo (variável --campaign-sticky-offset).
 */
export default function Section({ id, title, icon, children, action, sx }: {
    id?: string;
    title?: string;
    icon?: ReactElement;
    children: ReactNode;
    action?: ReactElement;
    sx?: SxProps;
}) {
    return (
        <Paper
            id={id}
            component="section"
            elevation={2}
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                scrollMarginTop: 'var(--campaign-sticky-offset, 96px)',
                ...sx
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    {title && <Typography variant="h6" component="h2" fontFamily={font.display}>{title}</Typography>}
                </Box>
                {action}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    )
}
