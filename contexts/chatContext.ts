import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'
import type { Message, TempMessage } from '@types'
import { type MessageType } from '@enums'

interface ChatContextData {
    messages: TempMessage[]
    setMessages: Dispatch<SetStateAction<TempMessage[]>>
    isChatOpen: boolean
    setIsChatOpen: (open: boolean) => void
    sendMessage: (message: Message, scrollToBottom?: () => void) => Promise<boolean>
    handleSendMessage: (textOrMessage: string | Message, type?: MessageType) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const chatContext = createContext<ChatContextData>({} as ChatContextData)
export const useChatContext = () => useContext(chatContext)
