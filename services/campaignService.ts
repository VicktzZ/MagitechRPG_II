import type { Campaign, CampaignData, Ficha, Note, User, Weapon, Armor, Item } from '@types'
import { Service } from '@utils/apiRequest'

class CampaignService extends Service<Campaign, 'code' | 'userId'> {
    async getCampaignUsers(campaignId: string): Promise<User[]> { return await this.fetch({ param: `${campaignId}/users` }) as unknown as User[] }
    async createNote(campaignId: string, note: Note) { return (await this.post({ param: `${campaignId}/notes`, body: note })).data }
    async updateNote(campaignId: string, noteId: string, content: string) { return (await this.patch({ param: `${campaignId}/notes`, body: { noteId, content } })).data }
    async deleteNote(campaignId: string, noteId: string) { return (await this.delete({ param: `${campaignId}/notes`, body: { noteId } })).data }
    async removeUser(campaignId: string, userId: string) { return (await this.delete({ param: `${campaignId}/users`, body: { userId } })).data }
    async updateUserFicha(campaignId: string, ficha: Ficha) { return (await this.patch({ param: `${campaignId}/update-user-ficha`, body: ficha })).data }
    async getFichas(campaignId: string) { return await this.fetch({ param: `${campaignId}/fichas` }) as unknown as Ficha[] }
    async getAllData(campaignId: string, userId: string) { return (await this.get({ param: `${campaignId}/get-all-data?userId=${userId}` })).data as unknown as CampaignData }
    
    // Custom campaign
    async addCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', item: Weapon | Armor | Item) {
        return (await this.post({ param: `${campaignId}/custom/items`, body: { type, item } })).data
    }

    async deleteCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', itemId: string) {
        return (await this.delete({ param: `${campaignId}/custom/items/${itemId}`, body: type })).data
    }
}

export const campaignService = new CampaignService('/campaign')