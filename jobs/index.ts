import { notificationCleanupJob } from './cleanupNotifications'

export function startJobs() {
    console.log('[Jobs] Iniciando jobs...')
    notificationCleanupJob.start()
}
