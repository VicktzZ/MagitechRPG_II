import type { Armor, Item, Note, Weapon, PerkFilters, CombatEffect } from '@models'
import type { Campaign, Charsheet, User } from '@models/entities'
import type { CampaignData } from '@models/types/session'
import { Service } from '@utils/apiRequest'
import type { CreateCombatEffectPayload } from './combatEffectService'

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

    // --- Combat Effects (catalogo + aplicação em combate) ---
    async listEffects(campaignId: string, includeGlobal = true) {
        const qs = includeGlobal ? '?includeGlobal=true' : ''
        const res = (await this.get({ param: `${campaignId}/custom/effects${qs}` })).data as {
            success: boolean
            campaignEffects: CombatEffect[]
            globalEffects: CombatEffect[]
            effects: CombatEffect[]
        }
        return res
    }

    async createCampaignEffect(campaignId: string, payload: CreateCombatEffectPayload & { cloneFromId?: string }) {
        return (await this.post({ param: `${campaignId}/custom/effects`, body: payload })).data as {
            success: boolean
            effect: CombatEffect
        }
    }

    async updateCampaignEffect(campaignId: string, effectId: string, patch: Partial<CreateCombatEffectPayload>) {
        return (await this.patch({ param: `${campaignId}/custom/effects/${effectId}`, body: patch })).data as {
            success: boolean
            effect: CombatEffect
        }
    }

    async deleteCampaignEffect(campaignId: string, effectId: string) {
        return (await this.delete({ param: `${campaignId}/custom/effects/${effectId}` })).data as {
            success: boolean
        }
    }

    async applyCombatEffect(campaignId: string, payload: {
        targetId: string
        effectId: string
        level: number
        appliedByName?: string
        appliedById?: string
        /** Sobrescreve o timing default do efeito (sem afetar o catálogo) */
        timingOverride?: 'turn' | 'round'
        /** Sobrescreve a duração default do nível (sem afetar o catálogo) */
        durationOverride?: number
        /** Aplica o efeito como indefinido (só expira ao ser removido manualmente) */
        indefiniteOverride?: boolean
    }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'apply_effect', ...payload }
        })).data
    }

    async removeCombatEffect(campaignId: string, payload: { targetId: string; appliedEffectId: string }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'remove_effect', ...payload }
        })).data
    }
}

export const campaignService = new CampaignService('/campaign')