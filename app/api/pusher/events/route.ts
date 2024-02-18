import { pusherServer } from '@utils/pusher';
import type { NextRequest } from 'next/server'
import type { EventData } from '@types';

const handler = async (req: NextRequest, res: Response): Promise<Response> => {
    try {
        const eventData: EventData = await req.json()    
    
        const trigger = await pusherServer.trigger(eventData.channelName, 'server-' + eventData.eventName, eventData.data)
        
        return Response.json({
            status: 200,
            message: 'OK',
            trigger
        })
    } catch (error: any) {
        return Response.json({
            status: 400,
            message: 'ERROR',
            error: error.message
        })        
    }
}

export { handler as POST }