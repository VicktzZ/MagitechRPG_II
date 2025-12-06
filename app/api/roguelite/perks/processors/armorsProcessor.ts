import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { armorRepository } from '@repositories'
import { getRarityWeights } from '@features/roguelite/utils/perkRarityRoller'
import { getArmorDefenseBonus, createSeededRng } from '@utils/roguelite'
import type { ProcessorFilters, ProcessedItem } from './types'

function upgradeArmorRarity(armor: any, newRarity: string): any {
    const defenseBonus = getArmorDefenseBonus(newRarity)
    
    const upgradedArmor = {
        ...armor,
        rarity: newRarity,
        rogueliteRarity: newRarity,
        upgradedFromCommon: true
    }
    
    if (upgradedArmor.value !== undefined) {
        upgradedArmor.originalValue = armor.value
        upgradedArmor.value = armor.value + defenseBonus
    }
    
    if (upgradedArmor.defense !== undefined) {
        upgradedArmor.originalDefense = armor.defense
        upgradedArmor.defense = armor.defense + defenseBonus
    }
    
    return upgradedArmor
}

export async function processArmors(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    let armors = await armorRepository.find()
    
    // Verificar se o GM especificou raridades específicas
    const hasSpecificRarities = (filters.rarities && filters.rarities.length > 0) || filters.rarity
    const targetRarities = filters.rarities || (filters.rarity ? [filters.rarity] : null)
    
    // Se o GM especificou raridades, aplicar a raridade desejada a TODAS as armaduras
    if (hasSpecificRarities && targetRarities) {
        const armorSeed = filters.seed ? `${filters.seed}-armors-rarity` : 'default-armors-rarity'
        const armorRng = createSeededRng(armorSeed)
        
        armors = armors.map(armor => {
            const armorObj = armor as any
            
            // Escolher uma raridade aleatória dentre as selecionadas
            const randomIndex = Math.floor(armorRng.random() * targetRarities.length)
            const targetRarity = targetRarities[randomIndex]
            
            // Aplicar a raridade desejada (com bônus de defesa)
            return upgradeArmorRarity(armorObj, targetRarity)
        })
    } else {
        // Comportamento padrão: ajustar raridade de armaduras comuns baseado no nível do usuário
        if (filters.userLevel !== undefined) {
            const rarityWeights = getRarityWeights(filters.userLevel)
            const armorSeed = filters.seed ? `${filters.seed}-armors` : 'default-armors'
            const armorRng = createSeededRng(armorSeed)
            
            armors = armors.map(armor => {
                const armorObj = armor as any
                
                // Se não tem rogueliteRarity, usar rarity como base
                if (!armorObj.rogueliteRarity && armorObj.rarity) {
                    armorObj.rogueliteRarity = armorObj.rarity
                }
                
                // Apenas ajustar armaduras com raridade "Comum"
                const hasCommonRarity = armorObj.rogueliteRarity === 'Comum' || armorObj.rarity === 'Comum'
                
                if (hasCommonRarity) {
                    const roll = armorRng.random() * 100
                    let cumulative = 0
                    
                    for (const [rarity, weight] of Object.entries(rarityWeights)) {
                        if (rarity !== 'Comum') {
                            cumulative += weight
                            
                            if (roll <= cumulative) {
                                return upgradeArmorRarity(armorObj, rarity)
                            }
                        }
                    }
                }
                
                return armorObj
            })
        }
    }
    
    // Adicionar perkType e garantir rogueliteRarity
    let processedArmors = armors.map(armor => {
        const armorObj = armor as any
        return {
            ...armorObj,
            rogueliteRarity: armorObj.rogueliteRarity || armorObj.rarity || 'Comum',
            perkType: PerkTypeEnum.ARMOR
        }
    })
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedArmors = processedArmors.filter(armor => 
                armor.levelRequired === undefined || armor.levelRequired === level
            )
        }
    }
    
    return processedArmors as ProcessedItem[]
}
