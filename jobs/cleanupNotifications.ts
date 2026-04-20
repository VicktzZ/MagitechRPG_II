import { notificationRepository, campaignRepository } from '@repositories'
import cron from 'node-cron'
import { initializeJob, withJobLogging } from './jobLogger'

const JOB_ID = 'cleanup-notifications'
const JOB_CONFIG = {
    id: JOB_ID,
    name: 'Limpeza de Notificações e Mensagens',
    description: 'Remove notificações antigas (>15 dias) e limita mensagens de campanha a 999',
    cronExpression: '0 3 * * *' // Todo dia às 3h da manhã
}

const MAX_MESSAGES_PER_CAMPAIGN = 999

interface CleanupResult {
    notificationsDeleted: number
    campaignsProcessed: number
    messagesDeleted: number
}

async function performCleanup(): Promise<CleanupResult> {
    let notificationsDeleted = 0
    let campaignsProcessed = 0
    let messagesDeleted = 0

    // 1. Limpar notificações antigas (mais de 15 dias)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const fifteenDaysAgoISO = fifteenDaysAgo.toISOString()

    try {
        // Busca todas as notificações
        const allNotifications = await notificationRepository.find()
        
        for (const notification of allNotifications) {
            const notificationDate = notification.timestamp
            
            // Deleta se for mais antiga que 15 dias
            if (notificationDate < fifteenDaysAgoISO) {
                await notificationRepository.delete(notification.id)
                notificationsDeleted++
            }
            // Deleta se for lida e mais antiga que 1 dia
            else if (notification.read) {
                const oneDayAgo = new Date()
                oneDayAgo.setDate(oneDayAgo.getDate() - 1)
                if (notificationDate < oneDayAgo.toISOString()) {
                    await notificationRepository.delete(notification.id)
                    notificationsDeleted++
                }
            }
        }
    } catch (error) {
        console.error('[Cleanup] Erro ao limpar notificações:', error)
    }

    // 2. Limpar mensagens de campanhas que excedem 999
    try {
        const campaigns = await campaignRepository.find()
        
        for (const campaign of campaigns) {
            if (campaign.session?.messages && campaign.session.messages.length > MAX_MESSAGES_PER_CAMPAIGN) {
                const originalCount = campaign.session.messages.length
                
                // Ordena por timestamp (mais recentes primeiro) e mantém apenas as 999 mais recentes
                const sortedMessages = [ ...campaign.session.messages ]
                    .sort((a, b) => {
                        const dateA = new Date(a.timestamp || 0).getTime()
                        const dateB = new Date(b.timestamp || 0).getTime()
                        return dateB - dateA // Mais recente primeiro
                    })
                    .slice(0, MAX_MESSAGES_PER_CAMPAIGN)

                campaign.session.messages = sortedMessages
                
                await campaignRepository.update(campaign)
                
                const deletedCount = originalCount - MAX_MESSAGES_PER_CAMPAIGN
                messagesDeleted += deletedCount
                campaignsProcessed++
                
                console.log(`[Cleanup] Campanha "${campaign.title}": removidas ${deletedCount} mensagens antigas`)
            }
        }
    } catch (error) {
        console.error('[Cleanup] Erro ao limpar mensagens:', error)
    }

    return { notificationsDeleted, campaignsProcessed, messagesDeleted }
}

export async function cleanupNotifications(): Promise<void> {
    await withJobLogging(
        JOB_ID,
        performCleanup,
        (result) => `Limpeza concluída: ${result.notificationsDeleted} notificações, ${result.messagesDeleted} mensagens de ${result.campaignsProcessed} campanhas`,
        (result) => result
    )
}

// Inicializa o job no banco de dados e agenda a execução
// Roda todo dia às 3h da manhã (horário de Brasília)
export const notificationCleanupJob = cron.schedule(JOB_CONFIG.cronExpression, cleanupNotifications, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
})

// Inicializa o registro do job no banco
export async function initNotificationCleanupJob(): Promise<void> {
    try {
        await initializeJob(JOB_CONFIG)
    } catch (error) {
        console.error('[Cleanup] Erro ao inicializar job:', error)
    }
}
