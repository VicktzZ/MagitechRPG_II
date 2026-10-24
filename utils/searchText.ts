/** Texto para comparar em buscas: sem acento, sem caixa e sem espaço sobrando ("Atlétismo " acha "atletismo") */
export function normalizeSearchText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/** O texto contém a busca? Busca vazia acha tudo; cada palavra da busca precisa aparecer (em qualquer ordem) */
export function matchesSearch(text: unknown, query: string): boolean {
    const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    const haystack = normalizeSearchText(text);
    return words.every(word => haystack.includes(word));
}
