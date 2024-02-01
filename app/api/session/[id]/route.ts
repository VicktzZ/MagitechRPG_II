import { pusherServer } from '@utils/pusher'

export async function POST(req: Request, { params: { id } }: { params: { id: string } }): Promise<Response> {
    try {
        const body = await req.json()
    
        if (!body) {
            return Response.json({ success: false, message: 'BAD REQUEST' })
        }
    
        await pusherServer.trigger(id, 'my-event', body)
    
        console.log({
            body,
            success: true,
            id
        });
        
        return Response.json({ success: true })
    } catch (error: any) {
        return Response.json({ success: false, message: error.message })
    }
}