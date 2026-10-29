/**
 * Presença na campanha: quem está na sessão (`session.users`) e quem joga (`players`).
 * Funções puras, usadas dentro de transação pelas rotas de conectar/desconectar: só os campos
 * que mudam são devolvidos, então entrar ou sair nunca reescreve (nem desfaz) o resto da campanha.
 */

export interface PresenceSource {
    session?: { users?: string[] }
    players?: Array<{ userId: string, charsheetId: string }>
}

/** Campos a gravar quando `userId` entra na sessão; `player` só vem para quem não é mestre */
export function connectFields(
    data: PresenceSource | undefined,
    userId: string,
    player?: { charsheetId: string }
): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    const users = data?.session?.users ?? [];
    const players = data?.players ?? [];

    if (!users.includes(userId)) fields['session.users'] = [ ...users, userId ];
    if (player && !players.some(existing => existing.userId === userId)) {
        fields['players'] = [ ...players, { userId, charsheetId: player.charsheetId } ];
    }

    return fields;
}

/** Campos a gravar quando `userId` sai da sessão (vazio se já não estava) */
export function disconnectFields(data: PresenceSource | undefined, userId: string): Record<string, unknown> {
    const users = data?.session?.users ?? [];
    return users.includes(userId) ? { 'session.users': users.filter(id => id !== userId) } : {};
}
