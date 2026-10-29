/**
 * Erros de API com status HTTP. Lançados pelos helpers de segurança
 * (autenticação, autorização, leitura de body) e convertidos em resposta
 * por `handleRouteError` no catch de cada rota.
 */
export class ApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }

    toResponse(): Response {
        // `message` e `error` carregam o texto legível: o frontend lê um ou outro
        // dependendo da tela (result.error, err.response.data.error, data.message)
        return Response.json(
            { success: false, code: this.code, message: this.message, error: this.message },
            { status: this.status }
        );
    }
}

export const unauthorized = (message = 'Você precisa estar logado para fazer isso') =>
    new ApiError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Você não tem permissão para fazer isso') =>
    new ApiError(403, 'FORBIDDEN', message);

export const notFound = (message = 'Recurso não encontrado') =>
    new ApiError(404, 'NOT_FOUND', message);

export const badRequest = (message = 'Requisição inválida') =>
    new ApiError(400, 'BAD_REQUEST', message);

export const conflict = (message = 'O recurso mudou; tente de novo') =>
    new ApiError(409, 'CONFLICT', message);

export const payloadTooLarge = (message = 'Conteúdo da requisição grande demais') =>
    new ApiError(413, 'PAYLOAD_TOO_LARGE', message);

/**
 * Converte qualquer erro do handler em resposta.
 * - ApiError: devolve o status e a mensagem do próprio erro.
 * - Qualquer outro: loga no servidor e devolve uma mensagem genérica — detalhes
 *   internos (stack, mensagens do Firestore, caminhos) nunca vão para o cliente.
 */
export function handleRouteError(
    error: unknown,
    fallbackMessage = 'Erro interno do servidor',
    fallbackStatus = 500
): Response {
    if (error instanceof ApiError) {
        return error.toResponse();
    }

    console.error(`[API] ${fallbackMessage}:`, error);
    return Response.json(
        { success: false, code: 'INTERNAL_ERROR', message: fallbackMessage, error: fallbackMessage },
        { status: fallbackStatus }
    );
}
