import type { Message } from '@types';
import { Service } from '@utils/apiRequest';

class MessageService extends Service<Message | Message[]> {
    async getMessages(campaignCode: string) { return await this.fetch({ param: `${campaignCode}/messages` }) }
    async sendMessage(campaignCode: string, message: Message) { return await this.create(message, { param: `${campaignCode}/messages` }) }
}

export const messageService = new MessageService('/campaign');