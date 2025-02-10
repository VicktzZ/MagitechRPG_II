'use client';

import { Box, Paper, TextField, IconButton, Typography, Stack, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState, useRef } from 'react';
import { useCampaignContext } from '@contexts/campaignContext';
import { useSession } from 'next-auth/react';
import { rollDice, rollSeparateDice, createDiceMessage } from '@utils/diceRoller';
import { PusherEvent } from '@enums';
import { useChannel } from '@contexts/channelContext';
import type { Message } from '@types';

export default function SessionChat() {
    const { campaign } = useCampaignContext();
    const { channel } = useChannel();
    const [ message, setMessage ] = useState('');
    const { data: session } = useSession();
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ shouldAutoScroll, setShouldAutoScroll ] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (chatBoxRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
            setShouldAutoScroll(isAtBottom);
        }
    };

    const sendMessage = async (newMessage: Message) => {
        const messageWithTimestamp = {
            ...newMessage,
            timestamp: new Date()
        };

        try {
            const response = await fetch(`/api/campaign/${campaign.campaignCode}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageWithTimestamp)
            });

            if (!response.ok) {
                console.error('Erro ao enviar mensagem');
                return false;
            }

            // Removemos o setMessages daqui pois a mensagem virá pelo Pusher
            return true;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return false;
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const user = {
            id: session?.user?._id ?? '',
            image: session?.user?.image ?? '',
            name: session?.user?.name ?? 'Usuário'
        };

        let success = true;

        if (message.startsWith('#')) {
            const separateResults = rollSeparateDice(message.trim(), user);
            if (separateResults) {
                // Envia as mensagens sequencialmente
                for (const diceMessage of separateResults) {
                    success = await sendMessage(diceMessage);
                    if (!success) break;
                }
            }
        } else {
            const diceResult = rollDice(message.trim());
            if (diceResult) {
                const diceMessage = createDiceMessage(diceResult, user);
                if (diceMessage) {
                    success = await sendMessage(diceMessage);
                }
            } else {
                const newMessage = {
                    text: message,
                    by: user
                };
                success = await sendMessage(newMessage);
            }
        }

        if (success) {
            setMessage('');
        }
    };

    const handleKeyPress = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSendMessage();
        }
    };

    // Carrega mensagens iniciais
    useEffect(() => {
        const fetchMessages = async () => {
            if (!campaign?._id) return;

            try {
                const response = await fetch(`/api/campaign/${campaign.campaignCode}/messages`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Erro ao carregar mensagens:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [ campaign?._id ]);

    // Configura os eventos do Pusher
    useEffect(() => {
        if (!channel) return;

        const handleNewMessage = (data: Message) => {
            setMessages(prev => {
                // Verifica se a mensagem já existe para evitar duplicação
                const messageExists = prev.some(
                    m => m.timestamp && data.timestamp && 
                    new Date(m.timestamp).getTime() === new Date(data.timestamp).getTime() &&
                    m.by.id === data.by.id &&
                    m.text === data.text
                );

                if (messageExists) {
                    return prev;
                }

                // Força o scroll após adicionar a mensagem
                setTimeout(scrollToBottom, 100);
                return [ ...prev, data ];
            });
        };

        channel.bind(PusherEvent.NEW_MESSAGE, handleNewMessage);

        return () => {
            channel.unbind(PusherEvent.NEW_MESSAGE, handleNewMessage);
        };
    }, [ channel ]);

    if (isLoading) {
        return (
            <Paper
                sx={{
                    position: 'fixed',
                    right: 20,
                    bottom: 20,
                    width: 350,
                    height: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography>Carregando mensagens...</Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                position: 'fixed',
                right: 20,
                bottom: 20,
                width: 350,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper3',
                borderRadius: 2,
                boxShadow: 3
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'background.paper2',
                    bgcolor: 'background.paper4'
                }}
            >
                <Typography variant="h6" color="primary">
                    Chat da Sessão
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Digite XdY para rolar dados (ex: 3d6*2, 2d20+1/2) ou #XdY para rolar separadamente
                </Typography>
            </Box>

            <Box
                ref={chatBoxRef}
                onScroll={handleScroll}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                {messages
                    .sort((a, b) => {
                        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                        return timeA - timeB;
                    })
                    .map((msg, index) => (
                        <Paper
                            key={index}
                            sx={{
                                p: 1,
                                bgcolor: 'background.paper2',
                                maxWidth: '80%',
                                alignSelf: msg.by.id === session?.user?._id ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <Avatar
                                    src={msg.by.image}
                                    alt={msg.by.name}
                                    sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="caption" color="primary.main">
                                    {msg.by.name}
                                </Typography>
                                {campaign.admin.includes(msg.by.id) && (
                                    <Typography 
                                        variant="caption" 
                                        color="primary.main"
                                        sx={{ opacity: 0.7, mx: 0.5 }}
                                    >
                                        (GM)
                                    </Typography>
                                )}
                                {msg.timestamp && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ ml: 'auto' }}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </Typography>
                                )}
                            </Stack>
                            <Typography>{msg.text}</Typography>
                        </Paper>
                    ))}
                <div ref={messagesEndRef} />
            </Box>

            <Stack
                direction="row"
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'background.paper2',
                    bgcolor: 'background.paper4'
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Digite sua mensagem, XdY para dados, ou #XdY para dados separados..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                    onKeyPress={handleKeyPress}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper2'
                        }
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{ ml: 1 }}
                >
                    <SendIcon />
                </IconButton>
            </Stack>
        </Paper>
    );
};