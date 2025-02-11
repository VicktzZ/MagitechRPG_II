import type { Message } from '@types';
import { apiRequest } from '@utils/apiRequest';

const { url: messageApi } = apiRequest<Message | Message[]>('campaign');

export const messageService = {
    async getMessages(campaignCode: string) {
        return await messageApi(`${campaignCode}/messages`).get() as Message[];
    },

    async sendMessage(campaignCode: string, message: Message) {
        return await messageApi(`${campaignCode}/messages`).post(message) as Message;
    }
};
