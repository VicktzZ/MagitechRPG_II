import Session from '@models/session'
import { connectToDb } from '@utils/database'

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