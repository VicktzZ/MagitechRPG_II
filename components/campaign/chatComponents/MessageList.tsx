'use client';

import { forwardRef, memo, useMemo } from 'react';
import {
    alpha,
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
import { color } from '@themes/tokens';
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

const MessageList = memo(forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
    { messages, currentUserId, adminIds, onScroll },
    ref
) {
    const theme = useTheme();

    // useMemo em vez de .sort() direto no render: .sort() muta o array e é
    // O(n log n) — refazer isso em TODO render (ex: ao só abrir/fechar o
    // chat, sem nenhuma mensagem nova) é desperdício, especialmente com
    // muitas mensagens.
    const sortedMessages = useMemo(
        () => [ ...messages ].sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeA - timeB;
        }),
        [ messages ]
    );

    return (
        <Box 
            ref={ref}
            sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                p: 2,
                bgcolor: 'background.paper',
                '&::-webkit-scrollbar': {
                    width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                    background: color.canvas,
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                    background: color.borderStrong,
                    borderRadius: '4px',
                    '&:hover': {
                        background: color.borderControl
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
                    <Chat sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Nenhuma mensagem ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Seja o primeiro a enviar uma mensagem no chat!
                    </Typography>
                </Box>
            ) : (
                sortedMessages
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
                                            ? alpha(theme.palette.error.main, 0.15)
                                            : isOwnMessage 
                                                ? color.amberSubtle
                                                : isBot 
                                                    ? alpha(theme.palette.success.main, 0.2)
                                                    : 'background.raised',
                                        color: 'text.primary',
                                        borderRadius: isOwnMessage 
                                            ? '16px 4px 16px 16px'
                                            : '4px 16px 16px 16px',
                                        border: isCombatLog || isDiceMessage
                                            ? '2px solid'
                                            : '1px solid',
                                        borderColor: isCombatLog
                                            ? alpha(theme.palette.error.main, 0.5)
                                            : isDiceMessage 
                                                ? 'primary.main'
                                                : isOwnMessage
                                                    ? color.amberLine
                                                    : 'divider',
                                        opacity: msg.isPending ? 0.6 : 1,
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
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
                                                border: '2px solid',
                                                borderColor: isOwnMessage 
                                                    ? color.amberLine
                                                    : 'divider'
                                            }}
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: 'text.primary'
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
                                                    bgcolor: 'info.main',
                                                    color: 'info.contrastText',
                                                    '& .MuiChip-icon': { color: 'inherit' },
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
                                                    bgcolor: 'background.overlay',
                                                    color: 'text.primary',
                                                    border: '1px solid',
                                                    borderColor: color.borderStrong,
                                                    '& .MuiChip-icon': { color: 'inherit' },
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
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    '& .MuiChip-icon': { color: 'inherit' },
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
                                                    color: 'text.secondary',
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
}));

export default MessageList;
