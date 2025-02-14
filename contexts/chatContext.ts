import { createContext, useContext } from 'react'
import type { Message, TempMessage } from '@types'
import { MessageType } from '@enums'

interface ChatContextData {
    messages: TempMessage[]
    setMessages: (messages: TempMessage[]) => void
    isChatOpen: boolean
    setIsChatOpen: (open: boolean) => void
    sendMessage: (message: Message) => Promise<boolean>
    handleSendMessage: (textOrMessage: string | Message, type?: MessageType) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const chatContext = createContext<ChatContextData>({} as ChatContextData)
export const useChatContext = () => useContext(chatContext)
