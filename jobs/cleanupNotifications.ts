import cron from 'node-cron'
import { connectToDb } from '@utils/database'
import Notification from '@models/db/notification'

export async function cleanupNotifications() {
    try {
        await connectToDb()

        // Deleta notificações com mais de 15 dias
        const fifteenDaysAgo = new Date()
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

        // Deleta notificações lidas do dia anterior
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const result = await Notification.deleteMany({
            $or: [
                { timestamp: { $lt: fifteenDaysAgo } },
                { read: true, timestamp: { $lt: yesterday } }
            ]
        })

        console.log(`[Job] Notificações antigas removidas: ${result.deletedCount}`)
    } catch (error) {
        console.error('[Job] Erro ao limpar notificações:', error)
    }
}

// Roda todo dia à meia-noite
export const notificationCleanupJob = cron.schedule('0 0 * * *', cleanupNotifications, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
})
