import type { Message } from '@models';
import { Service } from '@utils/apiRequest';

class MessageService extends Service<Message | Message[]> {
    /** Página de mensagens anteriores a `beforeId` (das mais antigas para as mais novas) */
    async getOlderMessages(campaignId: string, beforeId: string, limit?: number) {
        const query = `beforeId=${encodeURIComponent(beforeId)}${limit ? `&limit=${limit}` : ''}`
        return (await this.get({ param: `${campaignId}/messages?${query}` })).data as unknown as { messages: Message[], hasMore: boolean }
    }

    async sendMessage(campaignCode: string, message: Message) { return await this.create(message, { param: `${campaignCode}/messages` }) }
}

export const messageService = new MessageService('/campaign');