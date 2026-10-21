'use client';

import type { Message } from '@models';
import { messageService } from '@services';
import { CHAT_PAGE_SIZE, mergeChatMessages, oldestMessageId } from '@utils/chatMessages';
import { db } from '@utils/database';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface CampaignChat {
    /** Há mensagens mais antigas que as carregadas */
    hasMore: boolean;
    loadingOlder: boolean;
    loadOlder: () => Promise<void>;
    /** Falha ao ler o histórico do chat (ex.: sem permissão ou sem conexão) */
    error: Error | null;
}

interface UseCampaignChatFeedOptions {
    /** Sem ID (ou `enabled` falso) não abre listener */
    campaignId: string | undefined;
    enabled: boolean;
    /** Mensagens antigas que ainda estão na lista `session.messages` da campanha */
    legacyMessages: Message[];
}

/**
 * Mensagens do chat da campanha.
 *
 * As novas ficam em campaigns/{id}/messages: um listener acompanha as últimas
 * CHAT_PAGE_SIZE em tempo real e `loadOlder` busca páginas anteriores pela API. As antigas
 * (lista dentro da campanha, até serem migradas) entram na mesma lista, sem repetir.
 */
export function useCampaignChatFeed({ campaignId, enabled, legacyMessages }: UseCampaignChatFeedOptions) {
    const { ready: authReady, uid } = useFirebaseAuth();

    // Tudo o que o listener já entregou. Acumula: quando chega mensagem nova, a mais velha da
    // janela sai do resultado da consulta (um 'removed' que NÃO é exclusão) mas continua na tela.
    const [ live, setLive ] = useState<Message[]>([]);
    const [ older, setOlder ] = useState<Message[]>([]);
    // O primeiro resultado veio cheio? Se não, a subcoleção toda cabe na janela e não há o que carregar.
    const [ startedFull, setStartedFull ] = useState<boolean | null>(null);
    const [ exhausted, setExhausted ] = useState(false);
    const [ loadingOlder, setLoadingOlder ] = useState(false);
    const [ error, setError ] = useState<Error | null>(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        setLive([]);
        setOlder([]);
        setStartedFull(null);
        setExhausted(false);
        setError(null);
    }, [ campaignId ]);

    useEffect(() => {
        if (!campaignId || !enabled || !authReady) return;

        const recent = query(
            collection(db, 'campaigns', campaignId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(CHAT_PAGE_SIZE)
        );

        return onSnapshot(
            recent,
            (snapshot) => {
                setError(null);
                setStartedFull(current => current ?? snapshot.size >= CHAT_PAGE_SIZE);
                setLive(current => mergeChatMessages(current, snapshot.docs.map(doc => doc.data() as Message)));
            },
            (snapshotError) => {
                console.error('[Chat] Erro ao ler as mensagens da campanha:', snapshotError);
                setError(snapshotError);
            }
        );
    }, [ campaignId, enabled, authReady, uid ]);

    const loadOlder = useCallback(async () => {
        if (!campaignId || loadingRef.current) return;

        // O ponto de partida é a mais antiga já carregada da subcoleção (as antigas da campanha não contam)
        const cursor = oldestMessageId(mergeChatMessages(older, live));
        if (!cursor) {
            setExhausted(true);
            return;
        }

        loadingRef.current = true;
        setLoadingOlder(true);
        try {
            const page = await messageService.getOlderMessages(campaignId, cursor, CHAT_PAGE_SIZE);
            setOlder(current => mergeChatMessages(current, page.messages));
            setExhausted(!page.hasMore);
            setError(null);
        } catch (loadError) {
            console.error('[Chat] Erro ao carregar mensagens anteriores:', loadError);
            setError(loadError instanceof Error ? loadError : new Error('Erro ao carregar mensagens anteriores'));
        } finally {
            loadingRef.current = false;
            setLoadingOlder(false);
        }
    }, [ campaignId, older, live ]);

    const messages = useMemo(
        () => mergeChatMessages(legacyMessages, older, live),
        [ legacyMessages, older, live ]
    );

    const chat: CampaignChat = useMemo(() => ({
        hasMore: startedFull === true && !exhausted,
        loadingOlder,
        loadOlder,
        error
    }), [ startedFull, exhausted, loadingOlder, loadOlder, error ]);

    return { messages, chat };
}
