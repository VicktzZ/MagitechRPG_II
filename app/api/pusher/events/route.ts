import { pusherServer } from '@utils/pusher';
import type { EventData } from '@models/types/misc';
import type { NextRequest } from 'next/server'

const handler = async (req: NextRequest ): Promise<Response> => {
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