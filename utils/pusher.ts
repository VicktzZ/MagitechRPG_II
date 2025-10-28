import PusherServer from 'pusher'

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APPid,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
})