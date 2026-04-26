import type { CombatEffect, CombatEffectCategory, CombatEffectCustomLabels } from '@models'

const DAMAGE_BASE = [ 'Simples', 'Grave', 'Mortal' ]
const HEAL_BASE = [ 'Simples', 'Aprimorado', 'Superior' ]
const INFO_BASE = [ 'Simples', 'Aprimorado', 'Superior' ]
// Buffs seguem a mesma escala de cura — evoluindo para "melhor"
const BUFF_BASE = [ 'Simples', 'Aprimorado', 'Superior' ]
// Debuffs seguem a mesma escala de dano — evoluindo para "mais severo"
const DEBUFF_BASE = [ 'Simples', 'Grave', 'Mortal' ]

function pickBaseList(category: CombatEffectCategory, custom?: CombatEffectCustomLabels): string[] {
    const overridden = (custom as any)?.[category] as string[] | undefined
    if (overridden && overridden.length > 0) return overridden

    switch (category) {
    case 'damage':  return DAMAGE_BASE
    case 'heal':    return HEAL_BASE
    case 'info':    return INFO_BASE
    case 'buff':    return BUFF_BASE
    case 'debuff':  return DEBUFF_BASE
    default:        return INFO_BASE
    }
}

/**
 * Retorna o rótulo textual de um nível, considerando a extrapolação
 * quando o nível passa do tamanho da lista base (adiciona "+" no último).
 *
 *  level=1 -> "Simples"
 *  level=2 -> "Grave" (damage/debuff) ou "Aprimorado" (heal/buff/info)
 *  level=3 -> "Mortal" / "Superior"
 *  level=4 -> "Mortal+" / "Superior+"
 *  level=5 -> "Mortal++" / "Superior++"
 */
export function getLevelLabel(
    category: CombatEffectCategory,
    level: number,
    customLabels?: CombatEffectCustomLabels
): string {
    const list = pickBaseList(category, customLabels)
    if (list.length === 0) return `Nível ${level}`

    const safeLevel = Math.max(1, Math.floor(level))
    if (safeLevel <= list.length) return list[safeLevel - 1]

    const last = list[list.length - 1]
    const pluses = '+'.repeat(safeLevel - list.length)
    return `${last}${pluses}`
}

export function getEffectDisplayName(effect: CombatEffect, level: number): string {
    const label = getLevelLabel(effect.category, level, effect.customLabels)
    return `${effect.name} ${label}`.trim()
}

export function getCategoryLabel(category: CombatEffectCategory): string {
    switch (category) {
    case 'damage':  return 'Dano'
    case 'heal':    return 'Cura'
    case 'info':    return 'Informativo'
    case 'buff':    return 'Buff'
    case 'debuff':  return 'Debuff'
    default:        return String(category)
    }
}

export const combatEffectLabelBases = {
    damage: DAMAGE_BASE,
    heal: HEAL_BASE,
    info: INFO_BASE,
    buff: BUFF_BASE,
    debuff: DEBUFF_BASE
}
