/**
 * Erro de uma requisição como o axios devolve: `response` só existe quando o servidor respondeu.
 * Todo `catch` recebe `unknown`; estes helpers evitam `catch (error: any)` para ler a mensagem.
 */
export interface RequestErrorLike {
    message?: string
    isAxiosError?: boolean
    response?: {
        status?: number
        data?: { error?: string, code?: string, spent?: number, limit?: number, conflicts?: string[] }
    }
}

export function asRequestError(error: unknown): RequestErrorLike {
    return typeof error === 'object' && error !== null ? error as RequestErrorLike : {};
}

/**
 * Texto para mostrar ao usuário: o `error` que a API devolveu, senão a mensagem de uma exceção comum
 * (ex.: `throw new Error('...')`), senão `fallback`. Erro de requisição sem corpo útil (rede caiu, 500 sem
 * JSON) usa `fallback`, porque "Request failed with status code 500" não ajuda quem está jogando.
 */
export function errorMessage(error: unknown, fallback: string): string {
    const e = asRequestError(error);
    if (e.response?.data?.error) return e.response.data.error;
    if (e.response !== undefined || e.isAxiosError) return fallback;
    return e.message || fallback;
}
