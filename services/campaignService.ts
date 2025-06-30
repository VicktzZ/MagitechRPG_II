import type { Campaign, Ficha, Note, User } from '@types'
import { Service } from '@utils/apiRequest'

class CampaignService extends Service<Campaign, 'code' | 'userId'> {
    async getCampaignUsers(campaignId: string): Promise<User[]> { return await this.fetch({ param: `${campaignId}/users` }) as unknown as User[] }
    async createNote(campaignId: string, note: Note) { return await this.post({ param: `${campaignId}/notes`, body: note }) }
    async updateNote(campaignId: string, noteId: string, content: string) { return await this.patch({ param: `${campaignId}/notes`, body: { noteId, content } }) }
    async deleteNote(campaignId: string, noteId: string) { return await this.delete({ param: `${campaignId}/notes`, body: { noteId } }) }
    async removeUser(campaignId: string, userId: string) { return await this.delete({ param: `${campaignId}/users`, body: { userId } }) }
    async updateUserFicha(campaignId: string, ficha: Ficha) { return await this.patch({ param: `${campaignId}/update-user-ficha`, body: ficha }) }
}

export const campaignService = new CampaignService('/campaign')