import PusherServer from 'pusher'

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
})

/**
 * Avisa os clientes por Pusher. O aviso é um extra: quando a rota chega aqui a gravação já foi feita,
 * então uma falha do Pusher (fora do ar, cota, chave errada) só é registrada e não derruba a requisição.
 */
export async function triggerPusher(channel: string, event: string, data: unknown): Promise<void> {
    try {
        await pusherServer.trigger(channel, event, data)
    } catch (error) {
        console.error(`[Pusher] Falha ao enviar "${event}" para ${channel}:`, error)
    }
}
