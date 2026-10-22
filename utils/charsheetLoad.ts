/**
 * A carga de uma ficha conta como "inicial" até a ficha pedida terminar de carregar
 * uma vez. Depois disso, recarregar as magias e poderes por id (a lista mudou) é
 * trabalho em segundo plano: a tela continua no ar, só a lista se completa.
 */
export function isInitialCharsheetLoad(stillLoading: boolean, loadedId: string | undefined, wantedId: string): boolean {
    return stillLoading && loadedId !== wantedId;
}
