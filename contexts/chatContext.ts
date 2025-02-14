import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import type { Message, TempMessage } from '@types'

interface ChatContextData {
    messages: TempMessage[]
    setMessages: Dispatch<SetStateAction<TempMessage[]>>
    isChatOpen: boolean
    setIsChatOpen: (isOpen: boolean) => void
    sendMessage: (text: Message, scrollToBottom: () => void) => Promise<boolean>
    handleSendMessage: (text: string) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const chatContext = createContext<ChatContextData>({} as ChatContextData)
export const useChatContext = () => useContext(chatContext)
