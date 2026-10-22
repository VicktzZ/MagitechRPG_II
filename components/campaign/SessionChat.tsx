'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Paper, Snackbar } from '@mui/material';
import { useCampaignContext } from '@contexts';
import { useCampaignChat, useCampaignMessages } from '@contexts/campaignContext';
import { useChatContext, useChatMessages } from '@contexts/chatContext';
import { useCampaignTest, type TestNoticeSeverity } from '@hooks/useCampaignTest';
import { useSession } from 'next-auth/react';
import TestDialog from './TestDialog';
import TestModal from './TestModal';
import type { Message } from '@models';

import { 
    MessageInput, 
    ChatWrapper, 
    ChatHeader, 
    MessageList 
} from './chatComponents';
import { useUnreadMessages } from './chatComponents/useUnreadMessages';

export default function SessionChat() {
    const { campaign } = useCampaignContext();
    const persistedMessages = useCampaignMessages();
    const { hasMore, loadingOlder, loadOlder, error: chatError } = useCampaignChat();
    const { data: session } = useSession();

    const [ shouldAutoScroll, setShouldAutoScroll ] = useState(true);
    const [ isTestModalOpen, setIsTestModalOpen ] = useState(false);
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ snackbarMessage, setSnackbarMessage ] = useState('');
    const [ snackbarSeverity, setSnackbarSeverity ] = useState<TestNoticeSeverity>('success');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    const {
        isChatOpen,
        setIsChatOpen,
        sendMessage: sendMsg,
        handleSendMessage
    } = useChatContext();
    const { messages, setMessages } = useChatMessages();

    const isAdmin = session?.user && campaign.admin?.includes(session.user.id);
    const unreadCount = useUnreadMessages(messages, isChatOpen, session?.user?.id);

    // Ref para não precisar de `shouldAutoScroll` nas deps de callbacks
    // estáveis (handleScroll/scrollToBottom são passados como props para
    // filhos memoizados — reconstruir a cada mudança de estado quebraria o memo).
    const shouldAutoScrollRef = useRef(shouldAutoScroll);
    shouldAutoScrollRef.current = shouldAutoScroll;

    const scrollToBottom = useCallback(() => {
        if (shouldAutoScrollRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleScroll = useCallback(() => {
        if (chatBoxRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
            setShouldAutoScroll(isAtBottom);
        }
    }, []);

    // "Carregar anteriores" põe mensagens ACIMA do que está na tela: guarda a posição antes e,
    // quando a lista nova entrar, devolve o scroll para que o texto lido não saia do lugar.
    const scrollRestoreRef = useRef<{ height: number, top: number } | null>(null);

    const handleLoadOlder = useCallback(() => {
        const box = chatBoxRef.current;
        if (box) scrollRestoreRef.current = { height: box.scrollHeight, top: box.scrollTop };
        void loadOlder().finally(() => {
            // Se nada entrou (erro, ou já estava tudo carregado), não há o que restaurar
            window.setTimeout(() => { scrollRestoreRef.current = null; }, 0);
        });
    }, [ loadOlder ]);

    // A persistência acontece dentro de sendMsg (ChatProvider → API), que já
    // faz o append no servidor. O updateCampaign extra que existia aqui
    // gravava a mensagem uma SEGUNDA vez (por isso a deduplicação abaixo) e
    // sobrescrevia mensagens concorrentes de outros jogadores.
    const sendMessage = useCallback(async (newMessage: Message) => {
        await sendMsg(newMessage, scrollToBottom);
    }, [ sendMsg, scrollToBottom ]);

    const notify = useCallback((message: string, severity: TestNoticeSeverity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    }, []);

    // Testes pedidos pelo mestre: o pedido chega pelo listener da campanha (não pelo Pusher)
    const { requestTest, pendingTest, rolling, rollPending, dismissPending } = useCampaignTest({ notify, sendMessage });

    // Sincroniza mensagens do Firestore (contexto dedicado — não re-renderiza
    // o resto da página da campanha a cada mensagem)
    useEffect(() => {
        const list = persistedMessages ?? [];
        if (Array.isArray(list)) {
            const unique: Array<Message & { isPending: boolean }> = [];
            const seen = new Set<string>();
            for (const m of list) {
                const key = m.id || `${m.timestamp}-${m.by?.id}-${m.text}`;
                if (seen.has(key)) continue;
                seen.add(key);
                unique.push({ ...m, isPending: false });
            }
            setMessages(unique);
        } else {
            setMessages([]);
        }
    }, [ persistedMessages ]);

    // Mensagens anteriores entraram acima: mantém o que o jogador estava lendo no mesmo lugar
    useLayoutEffect(() => {
        const box = chatBoxRef.current;
        const saved = scrollRestoreRef.current;
        if (!box || !saved || box.scrollHeight === saved.height) return;
        box.scrollTop = saved.top + (box.scrollHeight - saved.height);
        scrollRestoreRef.current = null;
    }, [ messages ]);

    // Scroll to bottom quando mensagens carregam
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [ messages ]);

    // Adiciona evento de scroll
    useEffect(() => {
        const chatBox = chatBoxRef.current;
        if (chatBox) {
            chatBox.addEventListener('scroll', handleScroll);
            return () => chatBox.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Handlers estáveis para os modais — evita recriar props de componentes
    // memoizados (TestModal/TestDialog) a cada render do SessionChat.
    const openTestModal = useCallback(() => setIsTestModalOpen(true), []);
    const closeTestModal = useCallback(() => setIsTestModalOpen(false), []);
    const closeSnackbar = useCallback(() => setSnackbarOpen(false), []);

    return (
        <ChatWrapper 
            isChatOpen={isChatOpen} 
            setIsChatOpen={setIsChatOpen}
            unreadCount={unreadCount}
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
                <ChatHeader
                    messageCount={messages.length}
                    isAdmin={!!isAdmin}
                    combat={campaign.session?.combat}
                    campaignId={campaign.id}
                    onTestClick={openTestModal}
                />

                <MessageList
                    ref={chatBoxRef}
                    messages={messages}
                    currentUserId={session?.user?.id}
                    adminIds={campaign.admin || []}
                    onScroll={handleScroll}
                    hasMore={hasMore}
                    loadingOlder={loadingOlder}
                    onLoadOlder={handleLoadOlder}
                    loadError={!!chatError}
                />

                <div ref={messagesEndRef} style={{ height: 0 }} />

                <MessageInput onSendMessage={handleSendMessage} />

                {/* Modais e Snackbar */}
                <TestModal
                    open={isTestModalOpen}
                    onClose={closeTestModal}
                    onConfirm={(data) => { void requestTest(data); }}
                    campaign={campaign}
                />

                <TestDialog
                    open={!!pendingTest}
                    expertise={pendingTest?.expertise}
                    rolling={rolling}
                    onRoll={() => { void rollPending(); }}
                    onClose={dismissPending}
                />

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={closeSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={closeSnackbar}
                        severity={snackbarSeverity}
                        sx={{ width: '100%', whiteSpace: 'pre-line' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

            </Paper>
        </ChatWrapper>          
    );
}
