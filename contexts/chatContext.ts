import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'
import { type MessageType } from '@enums'
import type { TempMessage } from '@models/types/session'
import type { Message } from '@models'

interface ChatContextData {
    isChatOpen: boolean
    setIsChatOpen: (open: boolean) => void
    sendMessage: (message: Message, scrollToBottom?: () => void) => Promise<boolean>
    handleSendMessage: (textOrMessage: string | Message, type?: MessageType) => Promise<void>
}

interface ChatMessagesContextData {
    messages: TempMessage[]
    setMessages: Dispatch<SetStateAction<TempMessage[]>>
}

// Ações do chat (estáveis) separadas das mensagens (voláteis): a maioria dos
// consumidores só precisa de handleSendMessage/setIsChatOpen e não deve
// re-renderizar a cada mensagem recebida.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const chatContext = createContext<ChatContextData>({} as ChatContextData)
export const useChatContext = () => useContext(chatContext)

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const chatMessagesContext = createContext<ChatMessagesContextData>({} as ChatMessagesContextData)
export const useChatMessages = () => useContext(chatMessagesContext)
