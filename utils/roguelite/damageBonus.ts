/**
 * Utilitários para cálculo de bônus de dano e defesa baseado em raridade
 */

type RarityBonusMap = Record<string, number>

const WEAPON_DAMAGE_BONUS: RarityBonusMap = {
    'Incomum': 2,
    'Raro': 4,
    'Épico': 6,
    'Lendário': 8,
    'Único': 10,
    'Mágico': 5,
    'Amaldiçoado': 5,
    'Especial': 5
}

const ARMOR_DEFENSE_BONUS: RarityBonusMap = {
    'Incomum': 1,
    'Raro': 2,
    'Épico': 3,
    'Lendário': 4,
    'Único': 5,
    'Mágico': 3,
    'Amaldiçoado': 2,
    'Especial': 4
}

/**
 * Calcula bônus de dano para armas baseado na raridade
 */
export function getWeaponDamageBonus(rarity: string): number {
    return WEAPON_DAMAGE_BONUS[rarity] ?? 0
}

/**
 * Calcula bônus de defesa para armaduras baseado na raridade
 */
export function getArmorDefenseBonus(rarity: string): number {
    return ARMOR_DEFENSE_BONUS[rarity] ?? 0
}

/**
 * Adiciona bônus de dano ao valor de dano da arma
 * Formatos suportados: "2d6", "3d8+2", "1d12", "5", etc.
 */
export function addDamageBonus(currentDamage: string, bonus: number): string {
    if (bonus <= 0) return currentDamage
    
    if (currentDamage.includes('+')) {
        const [baseDamage, existingBonusStr] = currentDamage.split('+')
        const existingBonus = parseInt(existingBonusStr) || 0
        return `${baseDamage}+${existingBonus + bonus}`
    }
    
    return `${currentDamage}+${bonus}`
}

/**
 * Formata o dano com bônus coloridos para exibição
 */
export function formatDamageWithBonus(
    baseDamage: string,
    bonus: number,
    isCritical: boolean = false
): string {
    if (bonus <= 0) return baseDamage
    
    const color = isCritical ? 'yellow' : 'green'
    return `${baseDamage} <span style="color: ${color}">(+${bonus})</span>`
}

/**
 * Formata o dano completo com bônus coloridos
 */
export function formatCompleteDamageWithBonus(
    damageString: string,
    isCritical: boolean = false
): string {
    if (!damageString.includes('+')) return damageString
    
    const [baseDamage, bonusStr] = damageString.split('+')
    const bonus = parseInt(bonusStr) || 0
    
    return formatDamageWithBonus(baseDamage, bonus, isCritical)
}
