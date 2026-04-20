import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { perkRepository } from '@repositories'
import type { ProcessorFilters, ProcessedItem } from './types'

export async function processPerks(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    let perks = await perkRepository.find()
    
    console.log('[perksProcessor] Total perks carregados:', perks.length)
    console.log('[perksProcessor] Filtros recebidos:', { skillTypes: filters.skillTypes, perkType: filters.perkType })
    
    // Filtro por tipos de habilidade - perks da collection "Perks" com perkType SKILL/HABILIDADE são considerados "Bônus"
    // Este filtro deve ser aplicado ANTES do filtro por perkType para garantir que só "Bônus" seja retornado
    if (filters.skillTypes && filters.skillTypes.length > 0) {
        const beforeFilter = perks.length
        // Filtra perks que são do tipo SKILL (habilidades genéricas/bônus)
        perks = perks.filter(perk => {
            // Se o perk não é do tipo SKILL/HABILIDADE, mantém (pode ser EXPERTISE, etc)
            const isSkillPerk = perk.perkType === PerkTypeEnum.SKILL || perk.perkType === 'HABILIDADE'
            if (!isSkillPerk) {
                return true
            }
            // Se é SKILL, só inclui se 'Bônus' estiver nos skillTypes
            return filters.skillTypes!.includes('Bônus')
        })
        console.log('[perksProcessor] Após filtro de skillTypes:', { antes: beforeFilter, depois: perks.length, incluiBônus: filters.skillTypes.includes('Bônus') })
    }
    
    if (filters.perkType) {
        perks = perks.filter(perk => perk.perkType === filters.perkType)
    }
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            perks = perks.filter(perk => 
                perk.levelRequired === undefined || perk.levelRequired === level
            )
        }
    }

    if (filters.rarity) {
        perks = perks.filter(perk => (perk as any).rarity === filters.rarity)
    }
    
    // Filtro por raridades (multi-select)
    if (filters.rarities && filters.rarities.length > 0) {
        perks = perks.filter(perk => filters.rarities!.includes((perk as any).rarity || (perk as any).rogueliteRarity))
    }
    
    return perks as ProcessedItem[]
}
