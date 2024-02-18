interface Message {
    message: string
    by: {
        id: string
        image: string
    }
}

interface TriggredByUser {
    name: string
    socketId: string
    _id: string
}

interface EventData<T = Record<string, any>> {
    channelName: string
    data: T
    eventName: string
    triggeredBy: TriggredByUser
}

export type {
    Message,
    EventData
}