/* eslint-disable max-len */
'use client'

import { Box, Paper, IconButton, Typography, Stack, Avatar, Snackbar, Alert, TextField } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useEffect, useState, useRef, type ReactElement, memo } from 'react'
import { useCampaignContext } from '@contexts/campaignContext'
import { useSession } from 'next-auth/react'
import { useChannel } from '@contexts/channelContext'
import type { Attributes, Message, TempMessage, Expertises } from '@types'
import { MessageType, PusherEvent } from '@enums'
import TestModal from './TestModal'
import TestDialog from './TestDialog'
import { Button } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { messageService, fichaService } from '@services'
import { DiceMessage } from '@components/misc'
import { useChatContext } from '@contexts/chatContext'

// Componente do campo de mensagem
const MessageInput = memo(function MessageInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
    const [ message, setMessage ] = useState('')

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message)
            setMessage('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <Box sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'flex-start'
        }}>
            <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Digite sua mensagem, XdY para dados, ou #XdY para dados separados..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
    )
})

// Componente do wrapper do chat
const ChatWrapper = memo(function ChatWrapper({ 
    children, 
    isChatOpen, 
    setIsChatOpen 
}: { 
    children: ReactElement, 
    isChatOpen: boolean, 
    setIsChatOpen: (value: boolean) => void 
}) {
    return (
        <Box sx={{
            position: 'fixed',
            right: isChatOpen ? 0 : -300,
            top: 0,
            height: '100vh',
            width: '300px',
            bgcolor: 'background.paper',
            transition: 'right 0.3s ease-in-out',
            borderLeft: '1px solid',
            borderColor: 'divider',
            zIndex: 1200,
            display: 'flex'
        }}>
            <IconButton
                onClick={() => setIsChatOpen(!isChatOpen)}
                sx={{
                    position: 'absolute',
                    left: -25,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    zIndex: 1200,
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                {isChatOpen ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
            {children}
        </Box>
    );
});

export default function SessionChat() {
    const { campaign } = useCampaignContext()
    const { data: session } = useSession()
    const { channel } = useChannel()

    const [ isLoading, setIsLoading ] = useState(true)
    const [ shouldAutoScroll, setShouldAutoScroll ] = useState(true)
    const [ isTestModalOpen, setIsTestModalOpen ] = useState(false)
    const [ isTestDialogOpen, setIsTestDialogOpen ] = useState(false)
    const [ currentTest, setCurrentTest ] = useState<any>(null)
    const [ snackbarOpen, setSnackbarOpen ] = useState(false)
    const [ snackbarMessage, setSnackbarMessage ] = useState('')
    const [ snackbarSeverity, setSnackbarSeverity ] = useState<'success' | 'error' | 'info'>('success')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatBoxRef = useRef<HTMLDivElement>(null)

    const {
        isChatOpen,
        setIsChatOpen,
        messages,
        setMessages,
        sendMessage: sendMsg,
        handleSendMessage
    } = useChatContext()

    const isAdmin = session?.user && campaign.admin.includes(session.user._id)

    const scrollToBottom = () => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleScroll = () => {
        if (chatBoxRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50
            setShouldAutoScroll(isAtBottom)
        }
    }
    
    const sendMessage = async (newMessage: Message) => {
        sendMsg(newMessage, scrollToBottom)
    }

    const handleTestConfirm = (data: any) => {
        if (!session?.user) return

        const testRequest: any = {
            ...data,
            requestedBy: {
                id: session.user._id,
                name: session.user.name
            }
        }

        channel?.trigger(PusherEvent.TEST_REQUEST, testRequest)

        // Se o teste não for visível, mostra apenas para os admins
        if (!data.isVisible) {
            setSnackbarMessage('Teste solicitado. Aguardando respostas...')
            setSnackbarSeverity('success')
            setSnackbarOpen(true)
        }
    }

    const handleTestRollComplete = async (success: boolean, roll: { dice: string, result: number[] }) => {
        setIsTestDialogOpen(false)

        if (!currentTest || !session?.user) return

        // Se for um teste de perícia, busca o bônus da perícia na ficha do jogador
        let expertiseBonus = 0
        let expertiseResult = null
        let baseAttribute = null
        let baseAttributeValue = 0

        if (currentTest.expertise) {
            const player = campaign.players.find(p => p.userId === session.user._id)
            if (player) {
                try {
                    const ficha = await fichaService.getById(player.fichaId)
                    if (ficha) {
                        const expertise = ficha.expertises[currentTest.expertise as keyof Expertises]
                        expertiseBonus = expertise.value
                        baseAttribute = expertise.defaultAttribute?.toLowerCase()
                        baseAttributeValue = ficha.attributes[baseAttribute as Attributes]

                        console.log({
                            currentTest,
                            ficha,
                            expertise,
                            expertiseBonus,
                            baseAttribute,
                            baseAttributeValue
                        })

                        // Determina quantos d20s rolar baseado no valor do atributo base
                        let numDice = 1
                        let useWorst = false

                        if (baseAttributeValue === -1) {
                            numDice = 2
                            useWorst = true
                        } else if (baseAttributeValue === 3) {
                            numDice = 2
                        } else if (baseAttributeValue === 5) {
                            numDice = 3
                        }

                        // Rola os dados
                        const rolls: number[] = []
                        for (let i = 0; i < numDice; i++) {
                            rolls.push(Math.floor(Math.random() * 20) + 1)
                        }

                        // Determina qual resultado usar
                        let finalRoll = rolls[0]
                        if (numDice > 1) {
                            finalRoll = useWorst ? Math.min(...rolls) : Math.max(...rolls)
                        }

                        expertiseResult = {
                            rolls,
                            finalRoll,
                            total: finalRoll + expertiseBonus
                        }
                    }
                } catch (error) {
                    console.error('Erro ao buscar ficha:', error)
                }
            }
        }

        // Cria a mensagem do resultado da rolagem
        const rollMessage: Message = {
            id: crypto.randomUUID(),
            text: expertiseResult ? 
                `🎲 ${currentTest.expertise.toUpperCase()} - 1d20${expertiseBonus >= 0 ? '+' : ''}${expertiseBonus}: [${expertiseResult.rolls.join(', ')}${expertiseResult.rolls.length > 1 ? ': ' + expertiseResult.finalRoll : ''}] = ${expertiseResult.total}` :
                `🎲 ${roll.dice}: [${roll.result.join(', ')}] = ${roll.result.reduce((a, b) => a + b, 0)}`,
            by: {
                id: session.user._id,
                name: session.user.name,
                image: session.user.image ?? '/assets/default-avatar.png'
            },
            timestamp: new Date(),
            type: expertiseResult ? MessageType.EXPERTISE : MessageType.ROLL
        }

        // Cria a mensagem do resultado do teste (apenas se showResult estiver ativo)
        const resultMessage: Message | null = currentTest.showResult ? {
            id: crypto.randomUUID(),
            text: `${success ? '✅' : '❌'} ${session.user.name} ${success ? 'passou' : 'não passou'} no teste!`,
            type: MessageType.ROLL,
            by: {
                id: 'dice-roller-bot',
                image: '/assets/dice-roller-bot.jpg',
                name: 'Dice Roller',
                isBot: true
            },
            timestamp: new Date()
        } : null

        if (currentTest.isVisible) {
            // Se o teste é visível, envia a rolagem para o chat
            await sendMessage(rollMessage)
            // Se showResult está ativo, envia o resultado também
            if (resultMessage) {
                await sendMessage(resultMessage)
            }
        } else {
            // Se o teste é privado
            // Mostra apenas a rolagem em toast para o jogador
            setSnackbarMessage(rollMessage.text)
            setSnackbarSeverity('info')
            setSnackbarOpen(true)

            // Envia a rolagem e o resultado (se showResult ativo) para os mestres via Pusher
            channel?.trigger(PusherEvent.TEST_RESULT, {
                success,
                playerName: session.user.name,
                roll: {
                    dice: roll.dice,
                    result: roll.result
                },
                showResult: currentTest.showResult
            })
        }
    }

    const handleTestResult = (data: { 
        success: boolean, 
        playerName: string, 
        roll: { dice: string, result: number[] },
        showResult: boolean 
    }) => {
        // Só mostra o resultado para os mestres
        if (!isAdmin) return

        const rollText = `🎲 ${data.playerName} rolou ${data.roll.dice}: [${data.roll.result.join(', ')}] = ${data.roll.result.reduce((a, b) => a + b, 0)}`
        const resultText = data.showResult ? 
            `\n${data.success ? '✅' : '❌'} ${data.playerName} ${data.success ? 'passou' : 'não passou'} no teste!` : 
            ''

        setSnackbarMessage(rollText + resultText)
        setSnackbarSeverity(data.showResult ? (data.success ? 'success' : 'error') : 'info')
        setSnackbarOpen(true)
    }

    // Carrega mensagens iniciais
    useEffect(() => {
        const fetchMessages = async () => {
            if (!campaign?._id) return

            try {
                const response = await messageService.getMessages(campaign.campaignCode)
  
                if (response) {
                    setMessages(response)
                }
            } catch (error) {
                console.error('Erro ao carregar mensagens:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMessages()
    }, [ campaign?._id ])

    // Scroll to bottom quando as mensagens são carregadas inicialmente
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom()
        }
    }, [ messages ])

    // Adiciona o evento de scroll
    useEffect(() => {
        const chatBox = chatBoxRef.current
        if (chatBox) {
            chatBox.addEventListener('scroll', handleScroll)
            return () => chatBox.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Configura os eventos do Pusher
    useEffect(() => {
        if (!channel || !session?.user) return

        const handleNewMessage = (data: Message) => {
            setMessages(prev => {
                // Procura uma mensagem temporária correspondente
                const tempMessage = prev.find(
                    (m: TempMessage) => m.timestamp && data.timestamp && 
                    new Date(m.timestamp).getTime() === new Date(data.timestamp).getTime() &&
                    m.by.id === data.by.id &&
                    m.text === data.text &&
                    m.isPending
                )

                if (tempMessage) {
                    // Atualiza a mensagem temporária para não pendente
                    return prev.map(m => 
                        m.tempId === tempMessage.tempId
                            ? { ...m, isPending: false }
                            : m
                    )
                }

                // Se não encontrou mensagem temporária, adiciona a nova como uma mensagem confirmada
                const newMessage: TempMessage = {
                    ...data,
                    isPending: false,
                    tempId: Date.now().toString()
                }
                
                setTimeout(scrollToBottom, 100)
                return [ ...prev, newMessage ]
            })
        }

        const handleTestRequest = (data: any) => {
            // Se o usuário atual é um dos selecionados para o teste
            const isSelected = data.isGroupTest || data.selectedPlayers.includes(session.user._id)
            
            if (isSelected && !campaign.admin.includes(session.user._id)) {
                setCurrentTest(data)
                setIsTestDialogOpen(true)
            }
        }

        const handleTestResultPusher = (data: { 
            success: boolean, 
            playerName: string, 
            roll: { dice: string, result: number[] },
            showResult: boolean 
        }) => {
            handleTestResult(data)
        }

        channel.bind(PusherEvent.NEW_MESSAGE, handleNewMessage)
        channel.bind(PusherEvent.TEST_REQUEST, handleTestRequest)
        channel.bind(PusherEvent.TEST_RESULT, handleTestResultPusher)

        return () => {
            channel.unbind(PusherEvent.NEW_MESSAGE, handleNewMessage)
            channel.unbind(PusherEvent.TEST_REQUEST, handleTestRequest)
            channel.unbind(PusherEvent.TEST_RESULT, handleTestResultPusher)
        }
    }, [ channel, session?.user?._id ])

    return (
        <ChatWrapper isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen}>
            {isLoading ? (
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
            ) : (
                <Paper sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
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
                    {campaign.admin.includes(session?.user?._id ?? '') && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => setIsTestModalOpen(true)}
                            sx={{ m: 2 }}
                        >
                            Teste
                        </Button>
                    )}

                    <Box
                        ref={chatBoxRef}
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'background.paper3',
                            gap: 1,
                            p: 2
                        }}
                    >
                        {messages
                            .sort((a, b) => {
                                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                                return timeA - timeB
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
                                    <DiceMessage text={msg.text} type={msg.type} />
                                </Paper>
                            ))}
                        <div ref={messagesEndRef} />
                    </Box>

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
                </Paper>
            )}
        </ChatWrapper>          
    );
}