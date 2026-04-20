import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Configuração dos headers CORS
    const headers = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
            ? 'https://magitechrpg.vercel.app'
            : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        'Access-Control-Allow-Credentials': 'true'
    }

    // Responder imediatamente para requisições OPTIONS
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers })
    }

    // Para outras requisições, adicionar os headers CORS
    return NextResponse.next({
        headers
    })
}

export const config = {
    matcher: '/api/:path*'
}
