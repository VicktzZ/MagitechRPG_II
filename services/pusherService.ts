import type { Charsheet } from '@models/entities'
import type { Member } from '@models/types/misc'
import { Service } from '@utils/apiRequest'

class PusherService extends Service<any> {
    async authorizeChannel(socketId: string, channelName: string, session: Member, charsheet: Charsheet): Promise<any> {
        const params = new URLSearchParams()
        params.append('session', JSON.stringify({ user: session }))
        params.append('charsheet', JSON.stringify(charsheet))

        const body = new URLSearchParams()
        body.append('socketid', socketId)
        body.append('channel_name', channelName)

        const response = await fetch(`/api/pusher/auth?${params.toString()}`, {
            method: 'POST',
            body: body.toString()
        }).then(async r => await r.json())

        return response
    }

    async triggerEvent(channelName: string, eventName: string, data: any): Promise<any> {
        const eventData = {
            channelName,
            eventName,
            data
        }

        const response = await fetch('/api/pusher/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        }).then(async r => await r.json())

        return response
    }
}

export const pusherService = new PusherService('/pusher')