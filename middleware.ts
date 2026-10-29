import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Primeira barreira de segurança de toda a API (roda no Edge, antes das rotas):
 *  1. CORS com lista de origens permitidas (nada de "*")
 *  2. Bloqueio de requisições de escrita vindas de outros sites (CSRF)
 *  3. Rate limit por IP
 *  4. Limite de tamanho do corpo pelo Content-Length
 *  5. Sessão obrigatória (exceto rotas do próprio NextAuth)
 *
 * A autorização fina (dono da ficha, mestre da campanha, admin) e a validação
 * do conteúdo do corpo acontecem em cada rota, via utils/api.
 */

// ─────────────────────────────────────────────
// CORS / origens
// ─────────────────────────────────────────────

const PRODUCTION_ORIGIN = 'https://magitechrpg.vercel.app';

function toOrigin(value: string | undefined): string | null {
    if (!value) return null;
    try {
        return new URL(value.startsWith('http') ? value : `https://${value}`).origin;
    } catch {
        return null;
    }
}

function getAllowedOrigins(): Set<string> {
    const origins = new Set<string>([ PRODUCTION_ORIGIN ]);

    // Origens extras separadas por vírgula, ex.: "https://meudominio.com,https://staging.meudominio.com"
    for (const origin of (process.env.ALLOWED_ORIGINS ?? '').split(',')) {
        const parsed = toOrigin(origin.trim());
        if (parsed) origins.add(parsed);
    }

    for (const value of [ process.env.NEXTAUTH_URL, process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL ]) {
        const parsed = toOrigin(value);
        if (parsed) origins.add(parsed);
    }

    if (process.env.NODE_ENV === 'development') {
        origins.add('http://localhost:3000');
        origins.add('http://127.0.0.1:3000');
    }

    return origins;
}

function isAllowedOrigin(origin: string, request: NextRequest): boolean {
    return origin === request.nextUrl.origin || getAllowedOrigins().has(origin);
}

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-API-Key',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin'
    };
}

// ─────────────────────────────────────────────
// Rate limit (janela fixa, em memória)
// ─────────────────────────────────────────────
// Cada instância do Edge mantém seu próprio contador, então o limite é por
// instância — suficiente para conter abuso e loops de cliente. Para um limite
// global entre instâncias, troque o Map por um store compartilhado (ex.: Upstash Redis).

interface RateRule { limit: number; windowMs: number }

const RATE_RULES = {
    login: { limit: 10, windowMs: 60_000 },
    heavy: { limit: 10, windowMs: 60_000 },
    write: { limit: 120, windowMs: 60_000 },
    read: { limit: 300, windowMs: 60_000 }
} satisfies Record<string, RateRule>;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function hitRateLimit(key: string, rule: RateRule): { limited: boolean; retryAfter: number } {
    const now = Date.now();

    if (rateBuckets.size > 10_000) {
        for (const [ k, bucket ] of rateBuckets) {
            if (bucket.resetAt <= now) rateBuckets.delete(k);
        }
    }

    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        rateBuckets.set(key, { count: 1, resetAt: now + rule.windowMs });
        return { limited: false, retryAfter: 0 };
    }

    bucket.count++;
    return {
        limited: bucket.count > rule.limit,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
    };
}

function getClientIp(request: NextRequest): string {
    return (
        request.ip ??
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
    );
}

function pickRateRule(pathname: string, method: string): [string, RateRule] {
    if (pathname.startsWith('/api/auth/callback/credentials') || pathname.startsWith('/api/auth/signin')) {
        return [ 'login', RATE_RULES.login ];
    }
    // Rotas que leem coleções inteiras ou geram arquivos
    if (pathname.startsWith('/grimoire/') || pathname.startsWith('/api/roguelite/perks/getAll')) {
        return [ 'heavy', RATE_RULES.heavy ];
    }
    if (method === 'GET' || method === 'HEAD') {
        return [ 'read', RATE_RULES.read ];
    }
    return [ 'write', RATE_RULES.write ];
}

// ─────────────────────────────────────────────
// Tamanho do corpo
// ─────────────────────────────────────────────

const ONE_MB = 1024 * 1024;

function maxBodyBytes(pathname: string): number {
    if (pathname.startsWith('/api/pusher/')) return 16 * 1024;
    if (/^\/api\/campaign\/[^/]+\/(messages|notes)$/.test(pathname)) return 64 * 1024;
    // Teto geral = limite de 1 MiB de um documento do Firestore
    return ONE_MB;
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

const UNSAFE_METHODS = new Set([ 'POST', 'PUT', 'PATCH', 'DELETE' ]);

function jsonError(status: number, code: string, message: string, headers: Record<string, string> = {}): NextResponse {
    return NextResponse.json(
        { success: false, code, message, error: message },
        { status, headers: { 'X-Content-Type-Options': 'nosniff', ...headers } }
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method.toUpperCase();
    const origin = request.headers.get('origin');
    const originAllowed = origin ? isAllowedOrigin(origin, request) : true;
    const cors = origin && originAllowed ? corsHeaders(origin) : {};

    // 1. Preflight CORS
    if (method === 'OPTIONS') {
        if (!origin || !originAllowed) {
            return new NextResponse(null, { status: 403 });
        }
        return new NextResponse(null, { status: 204, headers: cors });
    }

    // 2. CSRF: escrita só a partir de origens conhecidas. Requisições sem Origin
    //    (curl, servidor) seguem e dependem da sessão/API key como qualquer outra.
    if (UNSAFE_METHODS.has(method) && origin && !originAllowed) {
        return jsonError(403, 'FORBIDDEN_ORIGIN', 'Origem da requisição não permitida');
    }

    // 3. Rate limit por IP
    const [ bucketName, rule ] = pickRateRule(pathname, method);
    const { limited, retryAfter } = hitRateLimit(`${bucketName}:${getClientIp(request)}`, rule);
    if (limited) {
        return jsonError(429, 'RATE_LIMITED', 'Muitas requisições. Aguarde um pouco e tente novamente.', {
            ...cors,
            'Retry-After': String(retryAfter)
        });
    }

    // 4. Tamanho do corpo (rejeição barata; as rotas também contam os bytes durante a leitura)
    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxBodyBytes(pathname)) {
        return jsonError(413, 'PAYLOAD_TOO_LARGE', 'Conteúdo da requisição grande demais', cors);
    }

    // 5. Autenticação: tudo exige sessão, menos o próprio NextAuth.
    //    Rotas de admin também aceitam API key interna — validada na rota (comparação em tempo constante).
    const isPublic = pathname.startsWith('/api/auth/');
    const carriesApiKey = pathname.startsWith('/api/admin/') && request.headers.has('x-api-key');

    if (!isPublic && !carriesApiKey) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return jsonError(401, 'UNAUTHORIZED', 'Você precisa estar logado para fazer isso', cors);
        }
    }

    const response = NextResponse.next();
    for (const [ key, value ] of Object.entries(cors)) {
        response.headers.set(key, value);
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
}

export const config = {
    matcher: [ '/api/:path*', '/grimoire/:path*' ]
};
