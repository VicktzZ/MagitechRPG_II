'use client';

import { memo, type ReactElement } from 'react';
import {
    Badge,
    Box,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import { Chat, ChevronRight } from '@mui/icons-material';

interface ChatWrapperProps {
    children: ReactElement;
    isChatOpen: boolean;
    setIsChatOpen: (value: boolean) => void;
    messageCount?: number;
}

const ChatWrapper = memo(function ChatWrapper({ 
    children, 
    isChatOpen, 
    setIsChatOpen,
    messageCount = 0
}: ChatWrapperProps) {
    const theme = useTheme();
    
    return (
        <Box sx={{
            position: 'fixed',
            right: isChatOpen ? 0 : -400,
            top: 0,
            height: '100vh',
            width: '400px',
            background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderLeft: '2px solid',
            borderColor: 'primary.main',
            zIndex: 1300,
            display: 'flex',
            boxShadow: theme.shadows[8]
        }}>
            <Tooltip title={isChatOpen ? 'Fechar chat' : 'Abrir chat'} placement="left">
                <Badge 
                    badgeContent={!isChatOpen && messageCount > 0 ? messageCount : 0} 
                    color="error"
                    sx={{
                        position: 'absolute',
                        left: -30,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1300
                    }}
                >
                    <IconButton
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            width: 50,
                            height: 50,
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.1)',
                                boxShadow: 4
                            },
                            transition: 'all 0.3s ease'
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
