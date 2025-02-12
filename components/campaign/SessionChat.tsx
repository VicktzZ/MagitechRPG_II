'use client';

import { Box, Paper, TextField, IconButton, Typography, Stack, Avatar, Button, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState, useRef } from 'react';
import { useCampaignContext } from '@contexts/campaignContext';
import { useSession } from 'next-auth/react';
import { rollDice, rollSeparateDice, createDiceMessage } from '@utils/diceRoller';
import { useChannel } from '@contexts/channelContext';
import type { Message, TempMessage, TestData, TestRequest } from '@types';
import { PusherEvent } from '@enums';
import { DiceMessage } from '@components/misc';
import { messageService } from '@services';
import TestModal from './TestModal';
import TestDialog from './TestDialog';

export default function SessionChat() {
    const { campaign } = useCampaignContext();
    const { channel } = useChannel();
    const [ message, setMessage ] = useState('');
    const { data: session } = useSession();
    const [ messages, setMessages ] = useState<TempMessage[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ shouldAutoScroll, setShouldAutoScroll ] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Estados para o sistema de testes
    const [ isTestModalOpen, setIsTestModalOpen ] = useState(false);
    const [ isTestDialogOpen, setIsTestDialogOpen ] = useState(false);
    const [ currentTest, setCurrentTest ] = useState<TestRequest | null>(null);
    const [ snackbarMessage, setSnackbarMessage ] = useState('');
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ snackbarSeverity, setSnackbarSeverity ] = useState<'success' | 'error' | 'info'>('success');

    const isAdmin = session?.user && campaign.admin.includes(session.user._id);

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

    const addTempMessage = (newMessage: TempMessage) => {
        const tempMessage = {
            ...newMessage,
            isPending: true,
            tempId: Math.random().toString(36).substring(7)
        };
        setMessages(prev => [ ...prev, tempMessage ]);
        setTimeout(scrollToBottom, 100);
        return tempMessage;
    };

    const removeTempMessage = (tempId: string) => {
        setMessages(prev => prev.filter(m => m.tempId !== tempId));
    };

    const sendMessage = async (newMessage: Message) => {
        const messageWithTimestamp = {
            ...newMessage,
            timestamp: new Date()
        };

        const tempMessage = addTempMessage(messageWithTimestamp);

        try {
            const response = await messageService.sendMessage(campaign.campaignCode, messageWithTimestamp);

            if (!response) {
                console.error('Erro ao enviar mensagem');
                removeTempMessage(tempMessage.tempId);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            removeTempMessage(tempMessage.tempId);
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

        setMessage('');

        let success = true;

        if (message.startsWith('#')) {
            const separateResults = rollSeparateDice(message.trim(), user);
            if (separateResults) {
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
    };

    const handleKeyPress = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSendMessage();
        }
    };

    // Funções do sistema de testes
    const handleTestConfirm = (data: TestData) => {
        if (!session?.user) return;

        const testRequest: TestRequest = {
            ...data,
            requestedBy: {
                id: session.user._id,
                name: session.user.name
            }
        };

        channel?.trigger(PusherEvent.TEST_REQUEST, testRequest);

        // Se o teste não for visível, mostra apenas para os admins
        if (!data.isVisible) {
            setSnackbarMessage('Teste solicitado. Aguardando respostas...');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    };

    const handleTestRollComplete = async (success: boolean, roll: { dice: string, result: number[] }) => {
        setIsTestDialogOpen(false);

        if (!currentTest || !session?.user) return;

        // Cria a mensagem do resultado da rolagem
        const rollMessage: Message = {
            id: crypto.randomUUID(),
            text: `🎲 Rolou ${roll.dice}: [${roll.result.join(', ')}] = ${roll.result.reduce((a, b) => a + b, 0)}`,
            by: {
                id: session.user._id,
                name: session.user.name,
                image: session.user.image ?? '/assets/default-avatar.png'
            },
            timestamp: new Date()
        };

        // Cria a mensagem do resultado do teste (apenas se showResult estiver ativo)
        const resultMessage: Message = currentTest.showResult ? {
            id: crypto.randomUUID(),
            text: `${success ? '✅' : '❌'} ${session.user.name} ${success ? 'passou' : 'não passou'} no teste!`,
            by: {
                id: 'dice-roller-bot',
                image: '/assets/dice-roller-bot.jpg',
                name: 'Dice Roller',
                isBot: true
            },
            timestamp: new Date()
        } : null;

        if (currentTest.isVisible) {
            // Se o teste é visível, envia a rolagem para o chat
            await sendMessage(rollMessage);
            // Se showResult está ativo, envia o resultado também
            if (resultMessage) {
                await sendMessage(resultMessage);
            }
        } else {
            // Se o teste é privado
            // Mostra apenas a rolagem em toast para o jogador
            setSnackbarMessage(rollMessage.text);
            setSnackbarSeverity('info');
            setSnackbarOpen(true);

            // Envia a rolagem e o resultado (se showResult ativo) para os mestres via Pusher
            channel?.trigger(PusherEvent.TEST_RESULT, {
                success,
                playerName: session.user.name,
                roll: {
                    dice: roll.dice,
                    result: roll.result
                },
                showResult: currentTest.showResult
            });
        }
    };

    const handleTestResult = (data: { 
        success: boolean, 
        playerName: string, 
        roll: { dice: string, result: number[] },
        showResult: boolean 
    }) => {
        // Só mostra o resultado para os mestres
        if (!isAdmin) return;

        const rollText = `🎲 ${data.playerName} rolou ${data.roll.dice}: [${data.roll.result.join(', ')}] = ${data.roll.result.reduce((a, b) => a + b, 0)}`;
        const resultText = data.showResult ? 
            `\n${data.success ? '✅' : '❌'} ${data.playerName} ${data.success ? 'passou' : 'não passou'} no teste!` : 
            '';

        setSnackbarMessage(rollText + resultText);
        setSnackbarSeverity(data.showResult ? (data.success ? 'success' : 'error') : 'info');
        setSnackbarOpen(true);
    };

    const handleTestComplete = async (success: boolean) => {
        if (!currentTest || !session?.user) return;

        const resultMessage = {
            text: `${success ? '✅' : '❌'} ${session.user.name} ${success ? 'passou' : 'não passou'} no teste!`,
            by: {
                id: 'dice-roller-bot',
                image: '/assets/dice-roller-bot.jpg',
                name: 'Dice Roller',
                isBot: true
            }
        };

        if (currentTest.isVisible) {
            await sendMessage(resultMessage);
        } else {
            // Envia o resultado apenas para os admins via Pusher
            channel?.trigger(PusherEvent.TEST_RESULT, {
                success,
                playerName: session.user.name
            });
        }

        setIsTestDialogOpen(false);
        setCurrentTest(null);
    };

    // Carrega mensagens iniciais
    useEffect(() => {
        const fetchMessages = async () => {
            if (!campaign?._id) return;

            try {
                const response = await messageService.getMessages(campaign.campaignCode);
  
                if (response) {
                    setMessages(response);
                    setTimeout(scrollToBottom, 100);
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
        if (!channel || !session?.user) return;

        const handleNewMessage = (data: Message) => {
            setMessages(prev => {
                // Procura uma mensagem temporária correspondente
                const tempMessage = prev.find(
                    m => m.timestamp && data.timestamp && 
                    new Date(m.timestamp).getTime() === new Date(data.timestamp).getTime() &&
                    m.by.id === data.by.id &&
                    m.text === data.text &&
                    m.isPending
                );

                if (tempMessage) {
                    // Atualiza a mensagem temporária para não pendente
                    return prev.map(m => 
                        m.tempId === tempMessage.tempId
                            ? { ...m, isPending: false }
                            : m
                    );
                }

                // Se não encontrou mensagem temporária, adiciona a nova
                setTimeout(scrollToBottom, 100);
                return [ ...prev, data ];
            });
        };

        const handleTestRequest = (data: TestRequest) => {
            // Se o usuário atual é um dos selecionados para o teste
            const isSelected = data.isGroupTest || data.selectedPlayers.includes(session.user._id);
            
            if (isSelected && !campaign.admin.includes(session.user._id)) {
                setCurrentTest(data);
                setIsTestDialogOpen(true);
            }
        };

        const handleTestResultPusher = (data: { 
            success: boolean, 
            playerName: string, 
            roll: { dice: string, result: number[] },
            showResult: boolean 
        }) => {
            handleTestResult(data);
        };

        channel.bind(PusherEvent.NEW_MESSAGE, handleNewMessage);
        channel.bind(PusherEvent.TEST_REQUEST, handleTestRequest);
        channel.bind(PusherEvent.TEST_RESULT, handleTestResultPusher);

        return () => {
            channel.unbind(PusherEvent.NEW_MESSAGE, handleNewMessage);
            channel.unbind(PusherEvent.TEST_REQUEST, handleTestRequest);
            channel.unbind(PusherEvent.TEST_RESULT, handleTestResultPusher);
        };
    }, [ channel, session?.user?._id ]);

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                bgcolor: 'background.paper',
                position: 'relative'
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    }}
                >
                    Chat da Sessão
                </Typography>
                <Typography>Carregando mensagens...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            bgcolor: 'background.paper',
            position: 'relative'
        }}>
            <Typography
                variant="h6"
                sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}
            >
                Chat da Sessão
            </Typography>

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
                            key={msg.tempId ?? index}
                            sx={{
                                p: 1,
                                bgcolor: 'background.paper',
                                maxWidth: '80%',
                                alignSelf: msg.by.id === session?.user?._id ? 'flex-end' : 'flex-start',
                                opacity: msg.isPending ? 0.5 : 1,
                                transition: 'opacity 0.2s ease-in-out'
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
                                {(campaign.admin.includes(msg.by.id) || msg.by.isBot) && (
                                    <Typography 
                                        variant="caption" 
                                        color={msg.by.isBot ? 'success.main' : 'primary.main'}
                                        sx={{ opacity: 0.7, mx: 0.5 }}
                                    >
                                        {msg.by.isBot ? '(BOT)' : '(GM)'}
                                    </Typography>
                                )}
                                {msg.timestamp && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ ml: 'auto' }}
                                    >
                                        {new Date(msg.timestamp).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                )}
                            </Stack>
                            <DiceMessage text={msg.text} />
                        </Paper>
                    ))}
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Digite sua mensagem, XdY para dados, ou #XdY para dados separados..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                    onKeyPress={handleKeyPress}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper'
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
            </Box>

            {/* Modais e Snackbar */}
            <TestModal
                open={isTestModalOpen}
                onClose={() => { setIsTestModalOpen(false); }}
                onConfirm={handleTestConfirm}
                campaign={campaign}
            />

            <TestDialog
                open={isTestDialogOpen}
                onClose={() => {
                    setIsTestDialogOpen(false);
                    setCurrentTest(null);
                }}
                dt={currentTest?.dt ?? 0}
                onRollComplete={handleTestRollComplete}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => { setSnackbarOpen(false); }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => { setSnackbarOpen(false); }}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}