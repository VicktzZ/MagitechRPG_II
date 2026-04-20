import type { CombatEffect, CombatEffectCategory, CombatEffectModifier, CombatEffectTiming } from '@models'
import { Service } from '@utils/apiRequest'

export interface CreateCombatEffectPayload {
    name: string
    description?: string
    category?: CombatEffectCategory
    timing?: CombatEffectTiming
    element?: string
    color?: string
    icon?: string
    levels: Array<{
        level: number
        formula: string
        duration: number
        description?: string
        indefinite?: boolean
        modifiers?: CombatEffectModifier[]
    }>
    usesLevels?: boolean
    customLabels?: { damage?: string[]; heal?: string[]; info?: string[]; buff?: string[]; debuff?: string[] }
    scope?: 'global' | 'campaign'
    campaignId?: string
    createdBy?: string
}

class CombatEffectService extends Service<CombatEffect> {
    async list(params: { scope?: 'global' | 'campaign' | 'all'; campaignId?: string; category?: CombatEffectCategory } = {}) {
        const qs = new URLSearchParams()
        if (params.scope) qs.set('scope', params.scope)
        if (params.campaignId) qs.set('campaignId', params.campaignId)
        if (params.category) qs.set('category', params.category)
        const query = qs.toString()
        const res = await this.instance.get(`/${query ? `?${query}` : ''}`)
        return res.data as { success: boolean; effects: CombatEffect[]; count: number }
    }

    async createGlobal(payload: CreateCombatEffectPayload) {
        const res = await this.instance.post('/', { ...payload, scope: 'global' })
        return res.data as { success: boolean; effect: CombatEffect }
    }

    async updateEffect(id: string, patch: Partial<CreateCombatEffectPayload>) {
        const res = await this.instance.patch(`/${id}`, patch)
        return res.data as { success: boolean; effect: CombatEffect }
    }

    async deleteEffect(id: string) {
        const res = await this.instance.delete(`/${id}`)
        return res.data as { success: boolean }
    }
}

export const combatEffectService = new CombatEffectService('/combat-effects')
