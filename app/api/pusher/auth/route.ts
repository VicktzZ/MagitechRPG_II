import { pusherServer } from '@utils/pusher';
import type { NextRequest } from 'next/server';
import type { Member } from '@types';

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.text()
        const sessionParams: Member = JSON.parse(req.nextUrl.searchParams.get('session') ?? '{}')?.user

        console.log(sessionParams);

        const socketId = body.split('=')[1].split('&')[0]
        const channelName = body?.split('&')[1]?.split('=')[1]

        pusherServer.authenticateUser(socketId, {
            id: socketId
        })

        const channelAuthResponse = pusherServer.authorizeChannel(socketId, channelName, {
            user_id: socketId,
            user_info: sessionParams
        })

        return Response.json(channelAuthResponse)
    } catch (error: any) {
        console.log(error.message);
        return Response.json({ message: 'ERROR', error: error.message }, { status: 400 })
    }
    
} 