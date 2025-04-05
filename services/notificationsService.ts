import { apiRequest } from '@utils/apiRequest'
import type { Notification } from '@types'

const { delete: del, url: notificationApi } = apiRequest<Notification>('notification')

export const notificationService = {
    async getUserNotifications(userId: string) { return await notificationApi(userId).get() as unknown as Notification[] },
    async sendNotification(userId: string, notification: Notification) { return await notificationApi(userId).post(notification) },
    async deleteNotification(notificationId: string) { return await del(notificationId) }
}
