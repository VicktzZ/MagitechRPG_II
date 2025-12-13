import { notificationCleanupJob, initNotificationCleanupJob } from './cleanupNotifications'

export async function startJobs() {
    console.log('[Jobs] Iniciando jobs...')
    
    // Inicializa os registros no banco de dados
    await initNotificationCleanupJob()
    
    // Inicia os agendamentos
    notificationCleanupJob.start()
    
    console.log('[Jobs] Jobs iniciados com sucesso!')
}

// Re-exporta funções de logging
export { initializeJob, logJobStart, logJobSuccess, logJobError, withJobLogging } from './jobLogger'
