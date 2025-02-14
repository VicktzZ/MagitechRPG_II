import { messageService } from '@services'
import { useCampaignContext } from './campaignContext'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { createDiceMessage, rollDice, rollSeparateDice } from '@utils/diceRoller'
import { MessageType } from '@enums'
import { enqueueSnackbar } from 'notistack'
import type { Message, TempMessage } from '@types'
import { chatContext } from './chatContext'
import { useMediaQuery, type Theme } from '@mui/material'

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const { campaign } = useCampaignContext()
    const { data: session } = useSession()
    const [ isChatOpen, setIsChatOpen ] = useState(!isMobile)
    const [ messages, setMessages ] = useState<TempMessage[]>([])

    const sendMessage = async (newMessage: Message, scrollToBottom: () => void = () => {}) => {
        const messageWithTimestamp = {
            ...newMessage,
            timestamp: new Date(),
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

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        const user = {
            id: session?.user?._id ?? '',
            name: session?.user?.name ?? '',
            image: session?.user?.image ?? ''
        }

        let success = true

        if (text.startsWith('#')) {
            const separateResults = rollSeparateDice(text.trim(), user)
            if (separateResults) {
                for (const diceMessage of separateResults) {
                    success = await sendMessage({
                        ...diceMessage,
                        type: MessageType.ROLL
                    })

                    if (!success) break
                }
            }
        } else {
            const diceResult = rollDice(text.trim())
            if (diceResult) {
                const diceMessage = createDiceMessage(diceResult, user)
                if (diceMessage) {
                    success = await sendMessage({
                        ...diceMessage,
                        type: MessageType.ROLL
                    })
                }
            } else {
                success = await sendMessage({
                    text,
                    type: MessageType.TEXT,
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
