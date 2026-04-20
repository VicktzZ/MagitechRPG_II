import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { powerRepository } from '@repositories'
import { calculatePowerRarity } from '@utils/calculatePerksRarity'
import type { ProcessorFilters, ProcessedItem } from './types'

export async function processPowers(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    const powers = await powerRepository.find()
    
    // Adicionar raridade calculada baseada nos pré-requisitos
    let processedPowers = powers.map(power => {
        const powerObj = power as any
        const rogueliteRarity = calculatePowerRarity(powerObj.preRequisite)
        return {
            ...powerObj,
            rogueliteRarity,
            perkType: PerkTypeEnum.SKILL
        }
    })
    
    if (filters.perkType) {
        processedPowers = processedPowers.filter(power => power.perkType === filters.perkType)
    }
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedPowers = processedPowers.filter(power => 
                power.levelRequired === undefined || power.levelRequired === level
            )
        }
    }
    
    // Filtro por múltiplas raridades (multi-select)
    if (filters.rarities && filters.rarities.length > 0) {
        processedPowers = processedPowers.filter(power => filters.rarities!.includes(power.rogueliteRarity))
    } else if (filters.rarity) {
        processedPowers = processedPowers.filter(power => power.rogueliteRarity === filters.rarity)
    }
    
    // Filtro por tipos de habilidade - só retorna powers se 'Poder Mágico' estiver incluído ou se não há filtro
    if (filters.skillTypes && filters.skillTypes.length > 0) {
        if (!filters.skillTypes.includes('Poder Mágico')) {
            // Se skillTypes está definido mas não inclui 'Poder Mágico', não retorna powers
            console.log('[powersProcessor] skillTypes não inclui Poder Mágico, retornando []')
            return []
        }
    }
    
    console.log('[powersProcessor] Retornando', processedPowers.length, 'powers')
    
    return processedPowers as ProcessedItem[]
}
