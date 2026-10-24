/**
 * Qual ficha o usuário usa nesta campanha, na ordem em que cada fonte passa a valer:
 * 1. a que a campanha já registra para ele (`campaign.players`): quem já entrou;
 * 2. a que ele acabou de escolher no modal de entrada (ainda não está em `players`: é a entrada que a registra,
 *    então sem isto a primeira entrada seguia com ficha vazia e o servidor a recusava);
 * 3. uma ficha dele que já esteja entre as da campanha.
 * Vazio quando não há nenhuma (o mestre não usa ficha).
 */
export function resolveViewerCharsheetId(input: {
    players?: Array<{ userId: string, charsheetId: string }>
    userId: string
    selectedCharsheetId?: string
    charsheets?: Array<{ id: string, userId?: string }>
}): string {
    const { players, userId, selectedCharsheetId, charsheets } = input;

    return players?.find(player => player.userId === userId)?.charsheetId
        || selectedCharsheetId
        || charsheets?.find(sheet => sheet.userId === userId)?.id
        || '';
}
