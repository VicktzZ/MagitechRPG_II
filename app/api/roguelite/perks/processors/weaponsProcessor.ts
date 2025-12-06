import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { weaponRepository } from '@repositories'
import { getRarityWeights } from '@features/roguelite/utils/perkRarityRoller'
import { 
    getWeaponDamageBonus, 
    addDamageBonus, 
    formatCompleteDamageWithBonus,
    createSeededRng 
} from '@utils/roguelite'
import { uniqueItemSkills } from '@constants/uniqueItemSkills'
import type { ProcessorFilters, ProcessedItem } from './types'

// Raridades que requerem nível mínimo 10
const HIGH_TIER_RARITIES = [ 'Mágico', 'Amaldiçoado', 'Especial' ]
const MIN_LEVEL_FOR_HIGH_TIER = 10
const MIN_DAMAGE_WEIGHT = 16
const LEVEL_DAMAGE_MULTIPLIER = 3

// Categorias de armas mágicas (requerem nível 10+)
const MAGICAL_WEAPON_CATEGORIES = ['Arma Mágica (Leve)', 'Arma Mágica (Pesada)']

/**
 * Seleciona uma habilidade aleatória para armas com raridade "Único"
 */
function getRandomUniqueWeaponSkill(rng: { random: () => number }): typeof uniqueItemSkills.weapon[0] | null {
    const skills = uniqueItemSkills.weapon
    if (!skills || skills.length === 0) return null
    
    const randomIndex = Math.floor(rng.random() * skills.length)
    return skills[randomIndex]
}

/**
 * Adiciona habilidade única à arma com raridade "Único"
 */
function addUniqueSkillToWeapon(weapon: any, rng: { random: () => number }): any {
    const uniqueSkill = getRandomUniqueWeaponSkill(rng)
    if (!uniqueSkill) return weapon
    
    const skillDescription = `\n\n🔮 **${uniqueSkill.nome}** (${uniqueSkill.raridade}): ${uniqueSkill.descricao}`
    
    return {
        ...weapon,
        description: (weapon.description || '') + skillDescription,
        uniqueSkill: uniqueSkill // Armazena a habilidade separadamente para fácil acesso
    }
}

/**
 * Verifica se a arma é uma arma mágica (baseado na categoria)
 */
function isMagicalWeapon(weapon: any): boolean {
    return MAGICAL_WEAPON_CATEGORIES.includes(weapon.categ)
}

/**
 * Calcula o dano máximo e o número de dados de uma string de dano (ex: "3d4" -> {maxDamage: 12, diceCount: 3})
 */
function calculateDamageInfo(damageStr: string): { maxDamage: number; diceCount: number } {
    if (!damageStr || typeof damageStr !== 'string') return { maxDamage: 0, diceCount: 1 }
    
    let totalDamage = 0
    let totalDice = 0
    
    // Extrair partes de dados (ex: "3d4", "2d6") e modificadores
    const normalized = damageStr.toLowerCase().replace(/\s/g, '')
    
    // Match padrão de dados: XdY
    const diceRegex = /(\d+)d(\d+)/g
    let match
    
    while ((match = diceRegex.exec(normalized)) !== null) {
        const numDice = parseInt(match[1]) || 1
        const dieSize = parseInt(match[2]) || 0
        totalDamage += numDice * dieSize
        totalDice += numDice
    }
    
    // Match modificadores (+N ou -N)
    const modRegex = /([+-])(\d+)(?![d\d])/g
    while ((match = modRegex.exec(normalized)) !== null) {
        const sign = match[1] === '+' ? 1 : -1
        const value = parseInt(match[2]) || 0
        totalDamage += sign * value
    }
    
    // Se não encontrou dados, assume 1 dado
    if (totalDice === 0) totalDice = 1
    
    return { maxDamage: totalDamage, diceCount: totalDice }
}

/**
 * Verifica se o jogador pode receber uma arma baseado no nível e dano máximo
 * Fórmula: max(16, userLevel * diceCount) >= maxDamage
 */
function canPlayerReceiveWeapon(userLevel: number, damageInfo: { maxDamage: number; diceCount: number }): boolean {
    const levelWeight = Math.max(MIN_DAMAGE_WEIGHT, userLevel * damageInfo.diceCount)
    return levelWeight >= damageInfo.maxDamage
}

/**
 * Verifica se o jogador pode receber armas de alta raridade
 */
function canPlayerReceiveHighTierRarity(userLevel: number, rarity: string): boolean {
    if (!HIGH_TIER_RARITIES.includes(rarity)) return true
    return userLevel >= MIN_LEVEL_FOR_HIGH_TIER
}

function upgradeWeaponRarity(weapon: any, newRarity: string): any {
    const damageBonus = getWeaponDamageBonus(newRarity)
    
    const upgradedWeapon = {
        ...weapon,
        rarity: newRarity,
        rogueliteRarity: newRarity,
        upgradedFromCommon: true
    }
    
    // Adicionar bônus de dano ao efeito da arma
    if (upgradedWeapon.effect?.value) {
        const originalValue = weapon.effect.value
        const newValue = addDamageBonus(originalValue, damageBonus)
        
        upgradedWeapon.effect = {
            ...upgradedWeapon.effect,
            value: newValue,
            originalValue,
            displayValue: formatCompleteDamageWithBonus(newValue, false),
            displayCritValue: null
        }
        
        // Também adicionar bônus ao dano crítico proporcionalmente
        if (upgradedWeapon.effect.critValue) {
            const originalCritValue = weapon.effect.critValue
            const newCritValue = addDamageBonus(originalCritValue, damageBonus * 2)
            
            upgradedWeapon.effect.critValue = newCritValue
            upgradedWeapon.effect.originalCritValue = originalCritValue
            upgradedWeapon.effect.displayCritValue = formatCompleteDamageWithBonus(newCritValue, true)
        }
    }
    
    return upgradedWeapon
}

export async function processWeapons(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    let weapons = await weaponRepository.find()
    
    // Verificar se o GM especificou raridades específicas
    const hasSpecificRarities = (filters.rarities && filters.rarities.length > 0) || filters.rarity
    const targetRarities = filters.rarities || (filters.rarity ? [filters.rarity] : null)
    
    // Aplicar restrições de nível/dano PRIMEIRO (antes de alterar raridades)
    // O bônus de dano da raridade NÃO interfere no peso de dano inicial (max 16)
    if (filters.userLevel !== undefined && !filters.ignoreWeaponLevelWeight) {
        const userLevel = filters.userLevel
        
        weapons = weapons.filter(weapon => {
            const weaponObj = weapon as any
            
            // Armas mágicas (categoria) requerem nível 10+
            if (isMagicalWeapon(weaponObj) && userLevel < MIN_LEVEL_FOR_HIGH_TIER) {
                return false
            }
            
            // Verificar restrição de dano máximo baseado no nível (usa dano BASE, sem bônus de raridade)
            const damageStr = weaponObj.effect?.value || weaponObj.damage || ''
            const damageInfo = calculateDamageInfo(damageStr)
            
            // Se não conseguiu calcular o dano, permite a arma
            if (damageInfo.maxDamage === 0) return true
            
            return canPlayerReceiveWeapon(userLevel, damageInfo)
        })
    }
    
    // Se o GM especificou raridades, aplicar a raridade desejada a TODAS as armas válidas
    if (hasSpecificRarities && targetRarities) {
        const weaponSeed = filters.seed ? `${filters.seed}-weapons-rarity` : 'default-weapons-rarity'
        const weaponRng = createSeededRng(weaponSeed)
        
        weapons = weapons.map(weapon => {
            const weaponObj = weapon as any
            
            // Escolher uma raridade aleatória dentre as selecionadas
            const randomIndex = Math.floor(weaponRng.random() * targetRarities.length)
            const targetRarity = targetRarities[randomIndex]
            
            // Aplicar a raridade desejada (com bônus de dano)
            return upgradeWeaponRarity(weaponObj, targetRarity)
        })
    } else {
        // Comportamento padrão: ajustar raridade de armas comuns baseado no nível do usuário
        if (filters.userLevel !== undefined) {
            const rarityWeights = getRarityWeights(filters.userLevel)
            const weaponSeed = filters.seed ? `${filters.seed}-weapons` : 'default-weapons'
            const weaponRng = createSeededRng(weaponSeed)
            
            weapons = weapons.map(weapon => {
                const weaponObj = weapon as any
                
                // Se não tem rogueliteRarity, usar rarity como base
                if (!weaponObj.rogueliteRarity && weaponObj.rarity) {
                    weaponObj.rogueliteRarity = weaponObj.rarity
                }
                
                // Apenas ajustar armas com raridade "Comum"
                const hasCommonRarity = weaponObj.rogueliteRarity === 'Comum' || weaponObj.rarity === 'Comum'
                
                if (hasCommonRarity) {
                    const roll = weaponRng.random() * 100
                    let cumulative = 0
                    
                    for (const [ rarity, weight ] of Object.entries(rarityWeights)) {
                        if (rarity !== 'Comum') {
                            cumulative += weight
                            
                            if (roll <= cumulative) {
                                return upgradeWeaponRarity(weaponObj, rarity)
                            }
                        }
                    }
                }
                
                return weaponObj
            })
        }
        
        // Verificar restrições de raridade alta apenas no modo automático
        if (filters.userLevel !== undefined) {
            weapons = weapons.filter(weapon => {
                const weaponObj = weapon as any
                const rarity = weaponObj.rogueliteRarity || weaponObj.rarity || 'Comum'
                return canPlayerReceiveHighTierRarity(filters.userLevel!, rarity)
            })
        }
    }
    
    // Criar RNG para habilidades únicas
    const uniqueSkillSeed = filters.seed ? `${filters.seed}-unique-skills` : 'default-unique-skills'
    const uniqueSkillRng = createSeededRng(uniqueSkillSeed)
    
    // Adicionar perkType, garantir rogueliteRarity e aplicar habilidades únicas
    let processedWeapons = weapons.map(weapon => {
        const weaponObj = weapon as any
        const rarity = weaponObj.rogueliteRarity || weaponObj.rarity || 'Comum'
        
        let processedWeapon = {
            ...weaponObj,
            rogueliteRarity: rarity,
            perkType: PerkTypeEnum.WEAPON
        }
        
        // Adicionar habilidade única para armas com raridade "Único"
        if (rarity === 'Único') {
            processedWeapon = addUniqueSkillToWeapon(processedWeapon, uniqueSkillRng)
        }
        
        return processedWeapon
    })
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedWeapons = processedWeapons.filter(weapon => 
                weapon.levelRequired === undefined || weapon.levelRequired === level
            )
        }
    }
    
    return processedWeapons as ProcessedItem[]
}
