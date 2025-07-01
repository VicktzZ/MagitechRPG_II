import type { Notification } from '@types'
import { Service } from '@utils/apiRequest'

class NotificationService extends Service<Notification> {}

export const notificationService = new NotificationService('/notification')