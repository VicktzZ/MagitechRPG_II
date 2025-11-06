/* eslint-disable max-len */
'use client'

import { DiceMessage } from '@components/misc';
import { useCampaignContext } from '@contexts';
import { useChannel } from '@contexts/channelContext';
import { useChatContext } from '@contexts/chatContext';
import { MessageType, PusherEvent } from '@enums';
import { 
    ChevronRight,
    Send,
    Chat,
    SmartToy,
    AdminPanelSettings,
    Casino
} from '@mui/icons-material';
import { 
    Alert, 
    Avatar, 
    Box, 
    Button, 
    IconButton, 
    Paper, 
    Snackbar, 
    Stack, 
    TextField, 
    Typography,
    Chip,
    Tooltip,
    Badge,
    useTheme
} from '@mui/material';
import { charsheetService } from '@services';
import { useSession } from 'next-auth/react';
import { memo, useEffect, useRef, useState, type ReactElement } from 'react';
import TestDialog from './TestDialog';
import TestModal from './TestModal';
import { blue, green, orange, purple, grey } from '@mui/material/colors';
import type { Attributes, Expertises, Message } from '@models';
import type { TempMessage } from '@models/types/session';

// TODO: RESOLVER BUG DE DUPLICIDADE DE MENSAGENS   
const MessageInput = memo(function MessageInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
    const [ message, setMessage ] = useState('')
    const theme = useTheme();

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
        <Paper 
            elevation={3}
            sx={{
                p: 2,
                borderTop: '2px solid',
                borderColor: 'primary.main',
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder=" Digite sua mensagem...\n\nXdY para dados\n#XdY para dados separados"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                        borderRadius: 2,
                        '& fieldset': {
                            borderColor: blue[300],
                            borderWidth: 2
                        },
                        '&:hover fieldset': {
                            borderColor: blue[500]
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: blue[600],
                            borderWidth: 2
                        }
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '0.95rem',
                        lineHeight: 1.4
                    }
                }}
            />
            <Tooltip title={message.trim() ? 'Enviar mensagem (Enter)' : 'Digite uma mensagem'}>
                <span>
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        size="large"
                        sx={{
                            bgcolor: blue[600],
                            color: 'white',
                            '&:hover': {
                                bgcolor: blue[700],
                                transform: 'scale(1.05)'
                            },
                            '&:disabled': {
                                bgcolor: grey[300],
                                color: grey[500]
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Send />
                    </IconButton>
                </span>
            </Tooltip>
        </Paper>
    )
})

// Componente do wrapper do chat
const ChatWrapper = memo(function ChatWrapper({ 
    children, 
    isChatOpen, 
    setIsChatOpen,
    messageCount = 0
}: { 
    children: ReactElement, 
    isChatOpen: boolean, 
    setIsChatOpen: (value: boolean) => void,
    messageCount?: number
}) {
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

export default function SessionChat() {
    const { campaign, updateCampaign } = useCampaignContext()
    const { data: session } = useSession()
    const { channel } = useChannel()
    const theme = useTheme();

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

    const isAdmin = session?.user && campaign.admin?.includes(session.user.id)

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
        // Atualiza UI localmente (pendente) e persiste no Firestore
        sendMsg(newMessage, scrollToBottom)
        try {
            const currentMessages = campaign?.session?.messages ?? []
            const currentUsers = campaign?.session?.users ?? []
            // Normaliza a mensagem antes de persistir (remove flags temporárias)
            const toPersist: any = { ...newMessage }
            delete toPersist.isPending
            delete toPersist.tempId
            if (toPersist.timestamp instanceof Date) {
                toPersist.timestamp = toPersist.timestamp.toISOString()
            }
            await updateCampaign({
                session: {
                    users: currentUsers,
                    messages: [ ...currentMessages, toPersist ]
                } as any
            })
        } catch (e) {
            console.error('[SessionChat] Falha ao persistir mensagem no Firestore:', e)
        }
    }

    const handleTestConfirm = (data: any) => {
        if (!session?.user) return

        const testRequest: any = {
            ...data,
            requestedBy: {
                id: session.user.id,
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

        // Se for um teste de perícia, busca o bônus da perícia na charsheet do jogador
        let expertiseBonus = 0
        let expertiseResult = null
        let baseAttribute = null
        let baseAttributeValue = 0

        if (currentTest.expertise) {
            const player = campaign.players.find(p => p.userId === session.user.id)
            if (player) {
                try {
                    const charsheet = await charsheetService.getById(player.charsheetId)
                    if (charsheet) {
                        const expertise = charsheet.expertises[currentTest.expertise as keyof Expertises]
                        expertiseBonus = expertise.value
                        baseAttribute = expertise.defaultAttribute?.toLowerCase()
                        baseAttributeValue = charsheet.stats[baseAttribute as keyof Attributes]

                        console.log({
                            currentTest,
                            charsheet,
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
                        } else if (baseAttributeValue >= 3) {
                            numDice = 2
                        } else if (baseAttributeValue >= 5) {
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
                    console.error('Erro ao buscar charsheet:', error)
                }
            }
        }

        // Cria a mensagem do resultado da rolagem
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
        }

        // Cria a mensagem do resultado do teste (apenas se showResult estiver ativo)
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

        const rollText = ` ${data.playerName} rolou ${data.roll.dice}: [${data.roll.result.join(', ')}] = ${data.roll.result.reduce((a, b) => a + b, 0)}`
        const resultText = data.showResult ? 
            `\n${data.success ? ' ' : ' '} ${data.playerName} ${data.success ? 'passou' : 'não passou'} no teste!` : 
            ''

        setSnackbarMessage(rollText + resultText)
        setSnackbarSeverity(data.showResult ? (data.success ? 'success' : 'error') : 'info')
        setSnackbarOpen(true)
    }

    // Sincroniza mensagens do Firestore (tempo real) e remove estado pendente
    useEffect(() => {
        const list = campaign?.session?.messages ?? []
        if (Array.isArray(list)) {
            const unique: any[] = []
            const seen = new Set<string>()
            for (const m of list) {
                const key = (m as any).id || `${(m as any).timestamp}-${(m as any).by?.id}-${(m as any).text}`
                if (seen.has(key)) continue
                seen.add(key)
                unique.push({ ...m, isPending: false })
            }
            setMessages(unique)
        } else {
            setMessages([])
        }
    }, [ campaign?.session?.messages ])

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

    // Configura os eventos do Pusher (apenas testes, mensagens via Firestore)
    useEffect(() => {
        if (!channel || !session?.user) return


        const handleTestRequest = (data: any) => {
            // Se o usuário atual é um dos selecionados para o teste
            const isSelected = data.isGroupTest || data.selectedPlayers.includes(session.user.id)
            
            if (isSelected && !campaign.admin.includes(session.user.id)) {
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

        channel.bind(PusherEvent.TEST_REQUEST, handleTestRequest)
        channel.bind(PusherEvent.TEST_RESULT, handleTestResultPusher)

        return () => {
            channel.unbind(PusherEvent.TEST_REQUEST, handleTestRequest)
            channel.unbind(PusherEvent.TEST_RESULT, handleTestResultPusher)
        }
    }, [ channel, session?.user?.id ])

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
                {/* Header do Chat */}
                <Paper 
                    elevation={2}
                    sx={{
                        p: 3,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #1a2332 0%, #2d3748 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '0 0 16px 0',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                        }
                    }}
                >
                    <Box position="relative" zIndex={1}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                            <Box 
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            >
                                <Chat sx={{ fontSize: '1.5rem' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Chat da Sessão
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip 
                                        label={`${messages.length} mensagem${messages.length !== 1 ? 's' : ''}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                    <Chip 
                                        label="Ao vivo"
                                        size="small"
                                        sx={{
                                            bgcolor: green[500],
                                            color: 'white',
                                            fontWeight: 600,
                                            animation: 'pulse 2s infinite'
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                        
                        {/* Botão de Teste para GMs */}
                        {campaign.admin?.includes(session?.user?.id ?? '') && (
                            <Box sx={{ mt: 2 }}>
                                <Tooltip title="Solicitar teste de atributo ou perícia">
                                    <Button 
                                        variant="contained" 
                                        startIcon={<Casino />}
                                        onClick={() => setIsTestModalOpen(true)}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            fontWeight: 600,
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.3)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: 3
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        Solicitar Teste
                                    </Button>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Lista de Mensagens */}
                <Box 
                    ref={chatBoxRef}
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
                    onScroll={handleScroll}
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
                                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                                return timeA - timeB
                            })
                            .map((msg, index) => {
                                const isOwnMessage = msg.by.id === session?.user?.id;
                                const isGM = campaign.admin?.includes(msg.by.id);
                                const isBot = msg.by.isBot;
                                const isDiceMessage = msg.type === MessageType.DICE || msg.type === MessageType.EXPERTISE;
                                    
                                return (
                                    <Box
                                        key={msg.tempId ?? index}
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
                                                bgcolor: isOwnMessage 
                                                    ? blue[900]
                                                    : isBot 
                                                        ? green[100]
                                                        : isGM 
                                                            ? purple[900]
                                                            : 'background.paper',
                                                color: isOwnMessage 
                                                    ? 'white'
                                                    : 'text.primary',
                                                borderRadius: isOwnMessage 
                                                    ? '16px 4px 16px 16px'
                                                    : '4px 16px 16px 16px',
                                                border: isDiceMessage 
                                                    ? `2px solid ${orange[400]}`
                                                    : '1px solid',
                                                borderColor: isDiceMessage 
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
                                                        color: isOwnMessage 
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
                                                            color: isOwnMessage 
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
                                                <DiceMessage text={msg.text} type={msg.type} />
                                            </Box>
                                        </Paper>
                                    </Box>
                                );
                            })
                    )}
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
        </ChatWrapper>          
    );
}