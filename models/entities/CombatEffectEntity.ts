import { v4 as uuidv4 } from 'uuid'
import { Collection } from 'fireorm'
import type {
    CombatEffect,
    CombatEffectCategory,
    CombatEffectCustomLabels,
    CombatEffectElement,
    CombatEffectLevel,
    CombatEffectScope
} from '../CombatEffect'

// Revalidação do tipo acontece automaticamente em CombatEffect; esta classe apenas
// implementa o shape para o fireorm persistir na collection `combatEffects`.

/**
 * Entidade persistida do efeito de combate.
 * Implementa a mesma shape de `CombatEffect` (model puro), mas sem herança —
 * fireorm tem limitações conhecidas quando `@Collection` é aplicado a classes
 * que herdam de outras com decorators de class-validator.
 */
@Collection('combatEffects')
export class CombatEffectEntity implements CombatEffect {
    id: string = uuidv4()
    name: string = ''
    description: string = ''
    category: CombatEffectCategory = 'damage'
    timing: 'turn' | 'round' = 'turn'
    element?: CombatEffectElement
    color: string = '#ff5722'
    icon: string = '💥'
    levels: CombatEffectLevel[] = []
    usesLevels?: boolean
    customLabels?: CombatEffectCustomLabels
    scope: CombatEffectScope = 'global'
    campaignId?: string
    createdBy?: string
    createdAt: string = new Date().toISOString()
    archived?: boolean

    constructor(effect?: Partial<CombatEffect>) {
        Object.assign(this, effect)
    }
}
