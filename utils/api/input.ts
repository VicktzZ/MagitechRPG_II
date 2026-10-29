import { badRequest, payloadTooLarge } from './errors';

/**
 * Limites padrão para corpos JSON. Calibrados a partir dos dados reais:
 * a maior campanha tem ~440KB, a maior ficha ~22KB, a string mais longa
 * ~5 mil caracteres e a profundidade máxima de objeto é 10. O teto de bytes
 * acompanha o limite de 1 MiB de um documento do Firestore — nada maior que
 * isso poderia ser salvo de qualquer forma.
 */
export const DEFAULT_BODY_LIMITS = {
    maxBytes: 1024 * 1024,
    maxDepth: 32,
    maxStringLength: 50_000,
    maxArrayLength: 5_000,
    maxObjectKeys: 1_000
};

export type BodyLimits = typeof DEFAULT_BODY_LIMITS;

/** Chaves que, via Object.assign/merge, poderiam alterar o prototype de objetos */
const FORBIDDEN_KEYS = new Set([ '__proto__', 'constructor', 'prototype' ]);

/**
 * Lê o corpo como texto respeitando um teto de bytes. O Content-Length é
 * conferido antes (rejeição barata) e a contagem também é feita durante a
 * leitura, porque requisições chunked não enviam Content-Length.
 */
export async function readTextBody(req: Request, maxBytes = DEFAULT_BODY_LIMITS.maxBytes): Promise<string> {
    const declared = Number(req.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > maxBytes) {
        throw payloadTooLarge();
    }

    if (!req.body) return '';

    const reader = req.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    let text = '';

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > maxBytes) {
            await reader.cancel();
            throw payloadTooLarge();
        }
        text += decoder.decode(value, { stream: true });
    }

    return text + decoder.decode();
}

function assertStructure(value: unknown, limits: BodyLimits, depth: number, path: string): void {
    if (depth > limits.maxDepth) {
        throw badRequest('Estrutura da requisição aninhada demais');
    }

    if (typeof value === 'string') {
        if (value.length > limits.maxStringLength) {
            throw badRequest(`O campo "${path || 'body'}" excede o limite de ${limits.maxStringLength} caracteres`);
        }
        return;
    }

    if (Array.isArray(value)) {
        if (value.length > limits.maxArrayLength) {
            throw badRequest(`A lista "${path || 'body'}" excede o limite de ${limits.maxArrayLength} itens`);
        }
        for (let i = 0; i < value.length; i++) {
            assertStructure(value[i], limits, depth + 1, `${path}[${i}]`);
        }
        return;
    }

    if (value !== null && typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length > limits.maxObjectKeys) {
            throw badRequest(`O objeto "${path || 'body'}" tem campos demais`);
        }
        for (const key of keys) {
            if (FORBIDDEN_KEYS.has(key)) {
                throw badRequest('A requisição contém campos não permitidos');
            }
            assertStructure((value as Record<string, unknown>)[key], limits, depth + 1, path ? `${path}.${key}` : key);
        }
    }
}

/**
 * Substitui `req.json()` nas rotas: lê o corpo com limite de tamanho, faz o
 * parse e valida a estrutura (profundidade, tamanho de strings/listas,
 * quantidade de campos e chaves perigosas). Lança ApiError 400/413.
 */
export async function readJsonBody<T = any>(
    req: Request,
    options: Partial<BodyLimits> & { optional?: boolean } = {}
): Promise<T> {
    const { optional, ...overrides } = options;
    const limits: BodyLimits = { ...DEFAULT_BODY_LIMITS, ...overrides };

    const text = await readTextBody(req, limits.maxBytes);

    if (!text.trim()) {
        if (optional) return {} as T;
        throw badRequest('Corpo da requisição vazio');
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw badRequest('JSON inválido no corpo da requisição');
    }

    assertStructure(parsed, limits, 0, '');
    return parsed as T;
}

// ─────────────────────────────────────────────
// Validadores pontuais de campos
// ─────────────────────────────────────────────

/** IDs de documento: auto-IDs do Firestore, UUIDs, códigos de campanha e slugs. Barra "/" nunca. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export function isValidId(value: unknown): value is string {
    return typeof value === 'string' && ID_PATTERN.test(value);
}

export function assertId(value: unknown, field = 'id'): string {
    if (!isValidId(value)) {
        throw badRequest(`"${field}" inválido`);
    }
    return value;
}

/** Lista de IDs com tamanho máximo (ex.: charsheetIds de ações em massa) */
export function assertIdList(value: unknown, field: string, maxItems = 100): string[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw badRequest(`"${field}" deve ser uma lista não vazia`);
    }
    if (value.length > maxItems) {
        throw badRequest(`"${field}" excede o limite de ${maxItems} itens`);
    }
    return value.map((v, i) => assertId(v, `${field}[${i}]`));
}

/** Garante que um campo de texto opcional não passe de `max` caracteres */
export function assertMaxLength(value: unknown, max: number, field: string): void {
    if (value === undefined || value === null) return;
    if (typeof value !== 'string') {
        throw badRequest(`"${field}" deve ser um texto`);
    }
    if (value.length > max) {
        throw badRequest(`"${field}" excede o limite de ${max} caracteres`);
    }
}

/** Texto obrigatório, não vazio, com limite de tamanho */
export function assertRequiredString(value: unknown, max: number, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw badRequest(`"${field}" é obrigatório`);
    }
    assertMaxLength(value, max, field);
    return value;
}

/** Inteiro de query string limitado a [min, max]; valores inválidos viram `fallback` */
export function clampInt(raw: string | null | undefined, min: number, max: number, fallback: number): number {
    const n = Number.parseInt(String(raw ?? ''), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

/** Texto de query string truncado em `max` caracteres */
export function limitQueryString(raw: string | null | undefined, max = 100): string | null {
    if (raw === null || raw === undefined) return null;
    return raw.slice(0, max);
}

/** Limites de texto para conteúdo exibido a outros usuários */
export const TEXT_LIMITS = {
    name: 120,
    title: 200,
    shortText: 500,
    description: 5_000,
    chatMessage: 10_000,
    note: 20_000
};
