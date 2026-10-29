import { countUnreadMessages, latestMessageTimestamp } from '@utils/chatMessages'
import { useEffect, useState } from 'react'

interface ChatMessage {
    id?: string
    timestamp?: string
    by?: { id?: string }
}

/**
 * Quantas mensagens de outras pessoas chegaram desde a última vez que o chat esteve aberto (o selo do botão).
 * Ao abrir a página o histórico não conta: só o que chega depois dela.
 */
export function useUnreadMessages(messages: readonly ChatMessage[], isChatOpen: boolean, myId?: string): number {
    const [ since, setSince ] = useState(() => new Date().toISOString())

    // Com o chat aberto, tudo o que existe foi visto
    useEffect(() => {
        if (!isChatOpen) return
        const latest = latestMessageTimestamp(messages)
        if (latest && latest > since) setSince(latest)
    }, [ messages, isChatOpen, since ])

    return isChatOpen ? 0 : countUnreadMessages(messages, since, myId)
}
