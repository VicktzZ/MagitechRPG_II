import Notification from '@models/notification'
import { connectToDb } from '@utils/database'

interface Params {
    userId: string
}

export async function GET(_: Request, { params }: { params: Params }): Promise<Response> {
    try {
        await connectToDb()
        const notifications = await Notification.find({ userId: params.userId }).sort({ timestamp: -1 })

        return Response.json(notifications)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request, { params }: { params: Params }): Promise<Response> {
    try {
        await connectToDb()
        const body = await req.json()
        const notification = await Notification.create({ ...body, userId: params.userId })
        return Response.json(notification)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}