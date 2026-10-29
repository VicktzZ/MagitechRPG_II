/**
 * A carga de uma ficha conta como "inicial" até a ficha pedida terminar de carregar
 * uma vez. Depois disso, recarregar as magias e poderes por id (a lista mudou) é
 * trabalho em segundo plano: a tela continua no ar, só a lista se completa.
 */
export function isInitialCharsheetLoad(stillLoading: boolean, loadedId: string | undefined, wantedId: string): boolean {
    return stillLoading && loadedId !== wantedId;
}

/**
 * Uma busca de documentos por id (magias, poderes) está em andamento?
 *
 * Calculado a cada render a partir da lista de ids pedida e da lista de ids já entregue, e não de um `useState`
 * que só vira `true` dentro de um efeito: no render em que os ids aparecem (a ficha acabou de chegar) esse estado
 * ainda valia `false`, a tela concluía que não havia nada a esperar e montava o formulário sem as magias. Como
 * o formulário guarda uma foto da ficha na primeira vez, as magias sumiam da tela mesmo estando no banco.
 */
export function isFetchByIdsPending(enabled: boolean, idsKey: string, loadedKey: string | null, failed: boolean): boolean {
    if (!enabled || idsKey === '' || failed) return false;
    return loadedKey !== idsKey;
}
