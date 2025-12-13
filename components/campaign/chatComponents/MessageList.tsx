'use client';

import { forwardRef } from 'react';
import {
    Avatar,
    Box,
    Chip,
    Paper,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { Chat, SmartToy, AdminPanelSettings, Casino } from '@mui/icons-material';
import { DiceMessage } from '@components/misc';
import { MessageType } from '@enums';
import { blue, green, orange, purple, grey } from '@mui/material/colors';
import type { Message } from '@models';

interface ExtendedMessage extends Message {
    tempId?: string;
    isPending?: boolean;
}

interface MessageListProps {
    messages: ExtendedMessage[];
    currentUserId?: string;
    adminIds: string[];
    onScroll: () => void;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
    { messages, currentUserId, adminIds, onScroll },
    ref
) {
    const theme = useTheme();

    return (
        <Box 
            ref={ref}
            sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                p: 2,
                background: theme.palette.mode === 'dark' 
                    ? 'rgba(0,0,0,0.2)' 
                    : 'rgba(255,255,255,0.3)',
                '&::-webkit-scrollbar': {
                    width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                        background: 'rgba(0,0,0,0.5)'
                    }
                }
            }} 
            onScroll={onScroll}
        >
            {messages.length === 0 ? (
                <Box 
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        p: 4
                    }}
                >
                    <Chat sx={{ fontSize: '4rem', color: grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Nenhuma mensagem ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Seja o primeiro a enviar uma mensagem no chat!
                    </Typography>
                </Box>
            ) : (
                messages
                    .sort((a, b) => {
                        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                        return timeA - timeB;
                    })
                    .map((msg, index) => {
                        const isOwnMessage = msg.by.id === currentUserId;
                        const isGM = adminIds?.includes(msg.by.id);
                        const isBot = msg.by.isBot;
                        const isDiceMessage = msg.type === MessageType.DICE || msg.type === MessageType.EXPERTISE;
                        const isCombatLog = msg.type === MessageType.COMBAT_LOG;
                            
                        return (
                            <Box
                                key={msg.tempId ?? `${msg.id}-${index}`}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                    mb: 2
                                }}
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        maxWidth: '85%',
                                        minWidth: '200px',
                                        bgcolor: isCombatLog
                                            ? theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)'
                                            : isOwnMessage 
                                                ? blue[900]
                                                : isBot 
                                                    ? theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : green[100]
                                                    : isGM 
                                                        ? purple[900]
                                                        : 'background.paper',
                                        color: isOwnMessage || isGM
                                            ? 'white'
                                            : 'text.primary',
                                        borderRadius: isOwnMessage 
                                            ? '16px 4px 16px 16px'
                                            : '4px 16px 16px 16px',
                                        border: isCombatLog
                                            ? '2px solid'
                                            : isDiceMessage 
                                                ? `2px solid ${orange[400]}`
                                                : '1px solid',
                                        borderColor: isCombatLog
                                            ? theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.3)'
                                            : isDiceMessage 
                                                ? orange[400]
                                                : 'divider',
                                        opacity: msg.isPending ? 0.6 : 1,
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    {/* Header da Mensagem */}
                                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                        <Avatar
                                            src={msg.by.image}
                                            alt={msg.by.name}
                                            sx={{ 
                                                width: 28, 
                                                height: 28,
                                                border: isOwnMessage 
                                                    ? '2px solid rgba(255,255,255,0.3)'
                                                    : '2px solid',
                                                borderColor: isOwnMessage 
                                                    ? 'rgba(255,255,255,0.3)'
                                                    : 'divider'
                                            }}
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: isOwnMessage || isGM
                                                    ? 'rgba(255,255,255,0.9)'
                                                    : 'text.primary'
                                            }}
                                        >
                                            {msg.by.name}
                                        </Typography>
                                            
                                        {/* Badges de Papel */}
                                        {isBot && (
                                            <Chip 
                                                icon={<SmartToy />}
                                                label="BOT"
                                                size="small"
                                                sx={{
                                                    bgcolor: green[500],
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                        {isGM && !isBot && (
                                            <Chip 
                                                icon={<AdminPanelSettings />}
                                                label="GM"
                                                size="small"
                                                sx={{
                                                    bgcolor: purple[500],
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                        {isDiceMessage && (
                                            <Chip 
                                                icon={<Casino />}
                                                label="DADOS"
                                                size="small"
                                                sx={{
                                                    bgcolor: orange[500],
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                            
                                        {/* Timestamp */}
                                        {msg.timestamp && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    ml: 'auto',
                                                    color: isOwnMessage || isGM
                                                        ? 'rgba(255,255,255,0.7)'
                                                        : 'text.secondary',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {new Date(msg.timestamp).toLocaleString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        )}
                                    </Stack>
                                        
                                    {/* Conteúdo da Mensagem */}
                                    <Box sx={{ mt: 1 }}>
                                        <DiceMessage text={msg.text} type={(msg.type as MessageType) ?? MessageType.TEXT} />
                                    </Box>
                                </Paper>
                            </Box>
                        );
                    })
            )}
        </Box>
    );
});

export default MessageList;
