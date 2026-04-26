'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Paper, Snackbar } from '@mui/material';
import { useCampaignContext } from '@contexts';
import { useChannel } from '@contexts/channelContext';
import { useChatContext } from '@contexts/chatContext';
import { MessageType, PusherEvent } from '@enums';
import { charsheetService } from '@services';
import { useSession } from 'next-auth/react';
import TestDialog from './TestDialog';
import TestModal from './TestModal';
import CombatStatus from './CombatStatus';
import type { Expertises, Message } from '@models';

import { 
    MessageInput, 
    ChatWrapper, 
    ChatHeader, 
    MessageList 
} from './chatComponents';

export default function SessionChat() {
    const { campaign, updateCampaign } = useCampaignContext();
    const { data: session } = useSession();
    const { channel } = useChannel();

    const [ shouldAutoScroll, setShouldAutoScroll ] = useState(true);
    const [ isTestModalOpen, setIsTestModalOpen ] = useState(false);
    const [ isTestDialogOpen, setIsTestDialogOpen ] = useState(false);
    const [ currentTest, setCurrentTest ] = useState<any>(null);
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ snackbarMessage, setSnackbarMessage ] = useState('');
    const [ snackbarSeverity, setSnackbarSeverity ] = useState<'success' | 'error' | 'info'>('success');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    const {
        isChatOpen,
        setIsChatOpen,
        messages,
        setMessages,
        sendMessage: sendMsg,
        handleSendMessage
    } = useChatContext();

    const isAdmin = session?.user && campaign.admin?.includes(session.user.id);
    const userCharsheetId = campaign.players?.find(p => p.userId === session?.user?.id)?.charsheetId;

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
        sendMsg(newMessage, scrollToBottom);
        try {
            const currentMessages = campaign?.session?.messages ?? [];
            const currentUsers = campaign?.session?.users ?? [];
            const toPersist: any = { ...newMessage };
            delete toPersist.isPending;
            delete toPersist.tempId;
            if (toPersist.timestamp instanceof Date) {
                toPersist.timestamp = toPersist.timestamp.toISOString();
            }
            await updateCampaign({
                session: {
                    users: currentUsers,
                    messages: [ ...currentMessages, toPersist ]
                } as any
            });
        } catch (e) {
            console.error('[SessionChat] Falha ao persistir mensagem no Firestore:', e);
        }
    };

    const handleTestConfirm = (data: any) => {
        if (!session?.user) return;

        const testRequest: any = {
            ...data,
            requestedBy: {
                id: session.user.id,
                name: session.user.name
            }
        };

        channel?.trigger(PusherEvent.TEST_REQUEST, testRequest);

        if (!data.isVisible) {
            setSnackbarMessage('Teste solicitado. Aguardando respostas...');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    };

    const handleTestRollComplete = async (success: boolean, roll: { dice: string, result: number[] }) => {
        setIsTestDialogOpen(false);

        if (!currentTest || !session?.user) return;

        let expertiseBonus = 0;
        let expertiseResult = null;
        let baseAttribute = null;
        let baseAttributeValue = 0;

        if (currentTest.expertise) {
            const player = campaign.players.find(p => p.userId === session.user.id);
            if (player) {
                try {
                    const charsheet = await charsheetService.getById(player.charsheetId);
                    if (charsheet) {
                        const expertise = charsheet.expertises[currentTest.expertise as keyof Expertises];
                        expertiseBonus = expertise.value;
                        baseAttribute = expertise.defaultAttribute?.toLowerCase();
                        baseAttributeValue = baseAttribute ? ((charsheet.attributes as any)?.[baseAttribute] ?? 0) : 0;

                        let numDice = 1;
                        let useWorst = false;

                        if (baseAttributeValue === -1) {
                            numDice = 2;
                            useWorst = true;
                        } else if (baseAttributeValue >= 3) {
                            numDice = 2;
                        } else if (baseAttributeValue >= 5) {
                            numDice = 3;
                        }

                        const rolls: number[] = [];
                        for (let i = 0; i < numDice; i++) {
                            rolls.push(Math.floor(Math.random() * 20) + 1);
                        }

                        let finalRoll = rolls[0];
                        if (numDice > 1) {
                            finalRoll = useWorst ? Math.min(...rolls) : Math.max(...rolls);
                        }

                        expertiseResult = {
                            rolls,
                            finalRoll,
                            total: finalRoll + expertiseBonus
                        };
                    }
                } catch (error) {
                    console.error('Erro ao buscar charsheet:', error);
                }
            }
        }

        const rollMessage: Message = {
            id: crypto.randomUUID(),
            text: expertiseResult ? 
                ` ${currentTest.expertise.toUpperCase()} - 1d20${expertiseBonus >= 0 ? '+' : ''}${expertiseBonus}: [${expertiseResult.rolls.join(', ')}${expertiseResult.rolls.length > 1 ? ': ' + expertiseResult.finalRoll : ''}] = ${expertiseResult.total}` :
                ` ${roll.dice}: [${roll.result.join(', ')}] = ${roll.result.reduce((a, b) => a + b, 0)}`,
            by: {
                id: session.user.id,
                name: session.user.name,
                image: session.user.image ?? '/assets/default-avatar.png'
            },
            timestamp: new Date().toISOString(),
            type: expertiseResult ? MessageType.EXPERTISE : MessageType.ROLL
        };

        const resultMessage: Message | null = currentTest.showResult ? {
            id: crypto.randomUUID(),
            text: `${success ? ' ' : ' '} ${session.user.name} ${success ? 'passou' : 'não passou'} no teste!`,
            type: MessageType.ROLL,
            by: {
                id: 'dice-roller-bot',
                image: '/assets/dice-roller-bot.jpg',
                name: 'Dice Roller',
                isBot: true
            },
            timestamp: new Date().toISOString()
        } : null;

        if (currentTest.isVisible) {
            await sendMessage(rollMessage);
            if (resultMessage) {
                await sendMessage(resultMessage);
            }
        } else {
            setSnackbarMessage(rollMessage.text);
            setSnackbarSeverity('info');
            setSnackbarOpen(true);

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
        if (!isAdmin) return;

        const rollText = ` ${data.playerName} rolou ${data.roll.dice}: [${data.roll.result.join(', ')}] = ${data.roll.result.reduce((a, b) => a + b, 0)}`;
        const resultText = data.showResult ? 
            `\n${data.success ? ' ' : ' '} ${data.playerName} ${data.success ? 'passou' : 'não passou'} no teste!` : 
            '';

        setSnackbarMessage(rollText + resultText);
        setSnackbarSeverity(data.showResult ? (data.success ? 'success' : 'error') : 'info');
        setSnackbarOpen(true);
    };

    // Sincroniza mensagens do Firestore
    useEffect(() => {
        const list = campaign?.session?.messages ?? [];
        if (Array.isArray(list)) {
            const unique: any[] = [];
            const seen = new Set<string>();
            for (const m of list) {
                const key = (m as any).id || `${(m as any).timestamp}-${(m as any).by?.id}-${(m as any).text}`;
                if (seen.has(key)) continue;
                seen.add(key);
                unique.push({ ...m, isPending: false });
            }
            setMessages(unique);
        } else {
            setMessages([]);
        }
    }, [ campaign?.session?.messages ]);

    // Scroll to bottom quando mensagens carregam
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [ messages ]);

    // Adiciona evento de scroll
    useEffect(() => {
        const chatBox = chatBoxRef.current;
        if (chatBox) {
            chatBox.addEventListener('scroll', handleScroll);
            return () => chatBox.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Configura eventos do Pusher
    useEffect(() => {
        if (!channel || !session?.user) return;

        const handleTestRequest = (data: any) => {
            const isSelected = data.isGroupTest || data.selectedPlayers.includes(session.user.id);
            
            if (isSelected && !campaign.admin.includes(session.user.id)) {
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

        // Handler para atualização de combate em tempo real
        const handleCombatUpdated = (data: { combat: any, action: string }) => {
            console.log('[SessionChat] Combate atualizado via Pusher:', data.action);
            updateCampaign({
                ...campaign,
                session: {
                    ...campaign.session,
                    combat: data.combat
                }
            });
        };

        channel.bind(PusherEvent.TEST_REQUEST, handleTestRequest);
        channel.bind(PusherEvent.TEST_RESULT, handleTestResultPusher);
        channel.bind(PusherEvent.COMBAT_UPDATED, handleCombatUpdated);

        return () => {
            channel.unbind(PusherEvent.TEST_REQUEST, handleTestRequest);
            channel.unbind(PusherEvent.TEST_RESULT, handleTestResultPusher);
            channel.unbind(PusherEvent.COMBAT_UPDATED, handleCombatUpdated);
        };
    }, [ channel, session?.user?.id, campaign, updateCampaign ]);

    return (
        <ChatWrapper 
            isChatOpen={isChatOpen} 
            setIsChatOpen={setIsChatOpen}
            messageCount={messages.length}
        >
            <Paper 
                elevation={0}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'transparent',
                    borderRadius: 0
                }}
            >
                <ChatHeader 
                    messageCount={messages.length}
                    isAdmin={!!isAdmin}
                    combat={campaign.session?.combat as any}
                    campaignId={campaign.id}
                    onTestClick={() => setIsTestModalOpen(true)}
                />

                <MessageList
                    ref={chatBoxRef}
                    messages={messages}
                    currentUserId={session?.user?.id}
                    adminIds={campaign.admin || []}
                    onScroll={handleScroll}
                />
                
                <div ref={messagesEndRef} style={{ height: 0 }} />

                <MessageInput onSendMessage={handleSendMessage} />

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

                {/* Status de Combate para Jogadores */}
                <CombatStatus
                    campaignId={campaign.id}
                    combat={campaign.session?.combat as any}
                    userCharsheetId={userCharsheetId}
                />
            </Paper>
        </ChatWrapper>          
    );
}
