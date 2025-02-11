import type { Member, Ficha } from '@types'

export const pusherService = {
    async authorizeChannel(socketId: string, channelName: string, session: Member, ficha: Ficha): Promise<any> {
        const params = new URLSearchParams()
        params.append('session', JSON.stringify({ user: session }))
        params.append('ficha', JSON.stringify(ficha))

        const body = new URLSearchParams()
        body.append('socket_id', socketId)
        body.append('channel_name', channelName)

        const response = await fetch(`/api/pusher/auth?${params.toString()}`, {
            method: 'POST',
            body: body.toString()
        }).then(async r => await r.json())

        return response
    },

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
