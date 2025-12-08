import type { Armor, Item, Note, Weapon, PerkFilters } from '@models'
import type { Campaign, Charsheet, User } from '@models/entities'
import type { CampaignData } from '@models/types/session'
import { Service } from '@utils/apiRequest'

class CampaignService extends Service<Campaign, 'code' | 'userId'> {
    async listByUser(userId: string) {
        return (await this.get({ param: `?userId=${encodeURIComponent(userId)}` })).data as unknown as { asGm: Array<{ id: string, code: string }>, asPlayer: Array<{ id: string, code: string }> };
    }

    async getCampaignUsers(campaignId: string): Promise<User[]> { return await this.fetch({ param: `${campaignId}/users` }) as unknown as User[] }
    async createNote(campaignId: string, note: Note) { return (await this.post({ param: `${campaignId}/notes`, body: note })).data }
    async updateNote(campaignId: string, noteId: string, content: string) { return (await this.patch({ param: `${campaignId}/notes`, body: { noteId, content } })).data }
    async deleteNote(campaignId: string, noteId: string) { return (await this.delete({ param: `${campaignId}/notes`, body: { noteId } })).data }
    async removeUser(campaignId: string, userId: string) { return (await this.delete({ param: `${campaignId}/users`, body: { userId } })).data }
    async updateUserCharsheet(campaignId: string, charsheet: Charsheet) { return (await this.patch({ param: `${campaignId}/update-user-charsheet`, body: charsheet })).data }
    async getCharsheets(campaignId: string) { return await this.fetch({ param: `${campaignId}/charsheets` }) as unknown as Charsheet[] }
    async getAllData(campaignId: string, userId: string) { return (await this.get({ param: `${campaignId}/get-all-data?userId=${userId}` })).data as unknown as CampaignData }
    
    // Custom campaign
    async addCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', item: Weapon | Armor | Item) {
        return (await this.post({ param: `${campaignId}/custom/items`, body: { type, item } })).data
    }

    async deleteCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', itemId: string) {
        return (await this.delete({ param: `${campaignId}/custom/items/${itemId}`, body: type })).data
    }

    // Perk offering
    async offerPerks(campaignId: string, userIds: string[], filters: PerkFilters, sharedSeed?: string) {
        return (await this.post({ param: `${campaignId}/session/offer-perks`, body: { userIds, filters, sharedSeed } })).data
    }

    async removePendingPerkUser(campaignId: string, userId: string) {
        return (await this.post({ param: `${campaignId}/session/pending-perk-user`, body: { userId } })).data
    }
}

export const campaignService = new CampaignService('/campaign')