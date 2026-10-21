'use client';

import { memo, type ReactElement } from 'react';
import {
    Badge,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Chat, ChevronRight } from '@mui/icons-material';
import { duration, easing } from '@themes/tokens';
import { CHAT_PANEL_WIDTH } from '../campaignLayout';

interface ChatWrapperProps {
    children: ReactElement;
    isChatOpen: boolean;
    setIsChatOpen: (value: boolean) => void;
    /** Mensagens que chegaram com o chat fechado (o selo do botão) */
    unreadCount?: number;
}

const ChatWrapper = memo(function ChatWrapper({
    children,
    isChatOpen,
    setIsChatOpen,
    unreadCount = 0
}: ChatWrapperProps) {
    const theme = useTheme();
    // Em janelas estreitas o painel ocupa a tela toda e o botão (que fica para fora dele) sairia da tela:
    // aberto, ele passa a ficar dentro do painel, no canto superior direito
    const fillsScreen = useMediaQuery(`(max-width: ${CHAT_PANEL_WIDTH + 60}px)`);
    const buttonInside = fillsScreen && isChatOpen;

    return (
        <Box sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            width: `min(${CHAT_PANEL_WIDTH}px, 100vw)`,
            // transform em vez de animar `right`: `right` dispara reflow de
            // layout a cada frame (o painel é fixed, mas o navegador ainda
            // recalcula posição/composição); transform é só compositor/GPU,
            // o que elimina o travamento da animação com o chat cheio de mensagens.
            transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
            willChange: 'transform',
            bgcolor: 'background.paper',
            transition: `transform ${duration.slow}ms ${easing.standard}`,
            borderLeft: '2px solid',
            borderColor: 'primary.main',
            zIndex: 1300,
            display: 'flex',
            boxShadow: theme.shadows[8]
        }}>
            <Tooltip title={isChatOpen ? 'Fechar chat' : 'Abrir chat'} placement="left">
                <Badge
                    badgeContent={!isChatOpen ? unreadCount : 0}
                    max={99}
                    color="error"
                    sx={{
                        position: 'absolute',
                        ...(buttonInside
                            ? { right: 8, top: 8 }
                            : { left: -30, top: '50%', transform: 'translateY(-50%)' }),
                        zIndex: 1300
                    }}
                >
                    <IconButton
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        aria-label={isChatOpen ? 'Fechar chat' : 'Abrir chat'}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            width: buttonInside ? 40 : 50,
                            height: buttonInside ? 40 : 50,
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {isChatOpen ? <ChevronRight /> : <Chat />}
                    </IconButton>
                </Badge>
            </Tooltip>
            {children}
        </Box>
    );
});

export default ChatWrapper;
