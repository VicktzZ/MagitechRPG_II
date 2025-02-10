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

interface Roll {
    name: string
    dice: number
    diceQuantity: number
    visibleDices: boolean
    visibleBaseAttribute: boolean
    bonus?: number[]
    sum?: boolean
}

export type {
    EventData,
    Roll
}