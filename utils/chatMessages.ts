/**
 * Chat da campanha: as mensagens novas ficam em campaigns/{id}/messages (uma por
 * documento). Mensagens antigas ainda podem estar na lista `session.messages` do
 * documento da campanha — o chat mostra as duas até elas serem migradas.
 */

/** Quantas mensagens o chat carrega de uma vez (e por "carregar anteriores") */
export const CHAT_PAGE_SIZE = 100;
export const CHAT_MAX_PAGE_SIZE = 200;

interface TimedMessage {
    id?: string;
    timestamp?: string;
    text?: string;
    by?: { id?: string };
}

/** Ordem do chat: horário e, no empate, ID — a mesma ordem das consultas do Firestore */
export function compareChatMessages(a: TimedMessage, b: TimedMessage): number {
    const timeA = a.timestamp ?? '';
    const timeB = b.timestamp ?? '';
    if (timeA !== timeB) return timeA < timeB ? -1 : 1;

    const idA = a.id ?? '';
    const idB = b.id ?? '';
    return idA === idB ? 0 : (idA < idB ? -1 : 1);
}

/** Mensagens antigas sem `id` ainda existem: identifica pelo conteúdo */
const messageKey = (message: TimedMessage): string =>
    message.id || `${message.timestamp ?? ''}|${message.by?.id ?? ''}|${message.text ?? ''}`;

/**
 * Junta listas de mensagens sem repetir (a última lista vence quando o ID se repete)
 * e ordena da mais antiga para a mais nova.
 */
export function mergeChatMessages<T extends TimedMessage>(...lists: ReadonlyArray<readonly T[]>): T[] {
    const byKey = new Map<string, T>();
    for (const list of lists) {
        for (const message of list) byKey.set(messageKey(message), message);
    }
    return [ ...byKey.values() ].sort(compareChatMessages);
}

/** ID da mensagem mais antiga da lista: o ponto de partida de "carregar anteriores" */
export function oldestMessageId(messages: readonly TimedMessage[]): string | undefined {
    let oldest: TimedMessage | undefined;
    for (const message of messages) {
        if (message.id && (!oldest || compareChatMessages(message, oldest) < 0)) oldest = message;
    }
    return oldest?.id;
}

/** Tamanho de página vindo da query string: inteiro entre 1 e o máximo (senão, o padrão) */
export function parseChatPageSize(raw: string | null | undefined): number {
    const parsed = Number.parseInt(String(raw ?? ''), 10);
    if (!Number.isFinite(parsed) || parsed < 1) return CHAT_PAGE_SIZE;
    return Math.min(parsed, CHAT_MAX_PAGE_SIZE);
}

/** Horário da mensagem mais recente (texto ISO), ou undefined sem mensagens */
export function latestMessageTimestamp(messages: readonly TimedMessage[]): string | undefined {
    let latest: string | undefined;
    for (const message of messages) {
        if (message.timestamp && (!latest || message.timestamp > latest)) latest = message.timestamp;
    }
    return latest;
}

/** Mensagens de OUTRAS pessoas mais novas que `since` (o selo de "não lidas" do botão do chat) */
export function countUnreadMessages(messages: readonly TimedMessage[], since: string, myId?: string): number {
    return messages.filter(message => (message.timestamp ?? '') > since && message.by?.id !== myId).length;
}
