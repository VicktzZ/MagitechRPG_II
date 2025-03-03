import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        const origin = request.headers.get('origin')

        if (origin === 'https://magitechrpg.vercel.app') {
            return NextResponse.next({
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true'
                }
            })
        }

        return new NextResponse(null, { status: 403 })
    }

    return NextResponse.next({
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        }
    })
}

export const config = {
    matcher: '/api/:path*'
}
