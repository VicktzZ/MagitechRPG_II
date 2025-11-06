import { messageService } from '@services'
import { useCampaignContext } from './campaignContext'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { createDiceMessage, rollDice, rollSeparateDice } from '@utils/diceRoller'
import { MessageType } from '@enums'
import { enqueueSnackbar } from 'notistack'
import { chatContext } from './chatContext'
import { useMediaQuery, type Theme } from '@mui/material'
import type { TempMessage } from '@models/types/session'
import type { Message } from '@models'

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const { campaign } = useCampaignContext()
    const { data: session } = useSession()
    const [ isChatOpen, setIsChatOpen ] = useState(!isMobile)
    const [ messages, setMessages ] = useState<TempMessage[]>([])

    const sendMessage = async (newMessage: Message, scrollToBottom: () => void = () => {}) => {
        const messageWithTimestamp = {
            ...newMessage,
            timestamp: new Date().toISOString(),
            tempId: Date.now().toString(),
            isPending: true
        }

        setMessages(prev => [ ...prev, messageWithTimestamp ])
        setTimeout(scrollToBottom, 100)

        try {
            const response = await messageService.sendMessage(campaign.campaignCode, messageWithTimestamp)

            if (!response) {
                console.error('Erro ao enviar mensagem')
                setMessages(prev => prev.filter(m => m.tempId !== messageWithTimestamp.tempId))
                return false
            }

            // Atualiza a mensagem para não pendente
            setMessages(prev =>
                prev.map(m => (m.tempId === messageWithTimestamp.tempId ? { ...m, isPending: false } : m))
            )

            return true
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error)
            setMessages(prev => prev.filter(m => m.tempId !== messageWithTimestamp.tempId))
            return false
        }
    }

    const handleSendMessage = async (textOrMessage: string | Message, type?: MessageType) => {
        if (!textOrMessage) return

        let success = true

        // Se for uma mensagem completa, envia diretamente
        if (typeof textOrMessage === 'object') {
            success = await sendMessage(textOrMessage)
            if (!success) {
                enqueueSnackbar('Erro ao enviar mensagem', { variant: 'error' })
            }
            return
        }

        // Se for uma string, processa normalmente
        const text = textOrMessage.trim()
        if (!text) return

        const user = {
            id: session?.user?.id ?? '',
            name: session?.user?.name ?? '',
            image: session?.user?.image ?? ''
        }

        if (text.startsWith('#')) {
            const separateResults = rollSeparateDice(text, user)
            if (separateResults) {
                for (const diceMessage of separateResults) {
                    success = await sendMessage({
                        ...diceMessage,
                        type: type ?? MessageType.ROLL
                    })

                    if (!success) break
                }
            }
        } else {
            const diceResult = rollDice(text)
            if (diceResult) {
                const diceMessage = createDiceMessage(diceResult, user)
                if (diceMessage) {
                    success = await sendMessage({
                        ...diceMessage,
                        type: type ?? MessageType.ROLL
                    })
                }
            } else {
                success = await sendMessage({
                    text,
                    type: type ?? MessageType.TEXT,
                    by: user
                })
            }
        }

        if (!success) {
            enqueueSnackbar('Erro ao enviar mensagem', { variant: 'error' })
        }
    }

    return (
        <chatContext.Provider
            value={{
                isChatOpen,
                setIsChatOpen,
                messages,
                setMessages,
                sendMessage,
                handleSendMessage
            }}
        >
            {children}
        </chatContext.Provider>
    )
}
