'use client';

import { Box, useMediaQuery, type Theme } from '@mui/material';
import { duration, easing } from '@themes/tokens';
import type { ReactElement, ReactNode } from 'react';
import { useChatContext } from '@contexts/chatContext';
import { CHAT_PANEL_WIDTH } from './campaignLayout';

/**
 * Canto inferior direito da página: o card de combate e os widgets da campanha empilhados, ao lado do chat
 * (nunca dentro dele nem por baixo). Quem não tem conteúdo não renderiza nada, então o dock some sozinho.
 */
export default function FloatingDock({ children }: { children: ReactNode }): ReactElement {
    const { isChatOpen } = useChatContext();
    // Do md em diante o chat aberto não cobre a tela toda: o dock sai da frente dele
    const chatBesideDock = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                left: { xs: 8, sm: 'auto' },
                right: { xs: 8, sm: 16, md: isChatOpen && chatBesideDock ? CHAT_PANEL_WIDTH + 16 : 16 },
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column-reverse',
                alignItems: { xs: 'stretch', sm: 'flex-end' },
                gap: 1.5,
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto',
                // A caixa do dock não pode bloquear cliques na página por trás; só os cartões recebem
                pointerEvents: 'none',
                '& > *': { pointerEvents: 'auto' },
                transition: `right ${duration.slow}ms ${easing.standard}`
            }}
        >
            {children}
        </Box>
    );
}
