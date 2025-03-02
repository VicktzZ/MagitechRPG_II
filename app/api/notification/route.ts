import Notification from '@models/notification'
import { connectToDb } from '@utils/database'

export async function DELETE(req: Request): Promise<Response> {
    try {
        await connectToDb()
        const body = await req.json()
        const notification = await Notification.deleteOne({ _id: body.id })
        return Response.json(notification)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}