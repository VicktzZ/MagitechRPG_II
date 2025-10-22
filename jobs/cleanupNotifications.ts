import { notificationCollection } from '@models/db/notification'
import { deleteDoc, query, where } from 'firebase/firestore'
import cron from 'node-cron'

export async function cleanupNotifications() {
    try {
        // Deleta notificações com mais de 15 dias
        const fifteenDaysAgo = new Date()
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

        // Deleta notificações lidas do dia anterior
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        await deleteDoc(query(notificationCollection,
            where('timestamp', '<', fifteenDaysAgo), 
            where('read', '==', true), 
            where('timestamp', '<', yesterday)
        ) as any)

        console.log('[Job] Notificações antigas removidas')
    } catch (error) {
        console.error('[Job] Erro ao limpar notificações:', error)
    }
}

// Roda todo dia à meia-noite
export const notificationCleanupJob = cron.schedule('0 0 * * *', cleanupNotifications, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
})
