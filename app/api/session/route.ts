import Session from '@models/session'
import { connectToDb } from '@utils/database'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb()
        let response

        const sessionCode = req.nextUrl.searchParams.get('code')

        if (sessionCode) {
            response = await Session.findOne({ sessionCode })
        } else {
            response = await Session.find()
        }
        
        return Response.json(response)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb()
        
        const sessionBody: { sessionCode: string, admin: string[] } = await req.json()
        const session = await Session.create(sessionBody)

        return Response.json(session)
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}   