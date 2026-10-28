import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { spellRepository } from '@repositories'
import { getSpellExecution } from '@utils/spellCategory'
import type { ProcessorFilters, ProcessedItem } from './types'

export async function processSpells(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    const spells = await spellRepository.find()
    
    // Adicionar rogueliteRarity e perkType
    let processedSpells = spells.map(spell => {
        const spellObj = spell as any
        return {
            ...spellObj,
            rogueliteRarity: spellObj.rogueliteRarity || spellObj.rarity || 'Comum',
            perkType: PerkTypeEnum.SPELL
        }
    })
    
    // Filtro por múltiplas raridades (multi-select)
    if (filters.rarities && filters.rarities.length > 0) {
        processedSpells = processedSpells.filter(spell => filters.rarities!.includes(spell.rogueliteRarity))
    } else if (filters.rarity) {
        processedSpells = processedSpells.filter(spell => spell.rogueliteRarity === filters.rarity)
    }
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedSpells = processedSpells.filter(spell => 
                spell.levelRequired === undefined || spell.levelRequired === level
            )
        }
    }
    
    // Filtro por elemento
    if (filters.element) {
        const elementNormalized = filters.element.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        processedSpells = processedSpells.filter(spell => {
            const spellElement = (spell.element ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            return spellElement === elementNormalized
        })
    }
    
    // Filtro por nível da magia
    if (filters.spellLevel !== null && filters.spellLevel !== undefined) {
        processedSpells = processedSpells.filter(spell => {
            const level = Number(spell.level)
            return level === filters.spellLevel
        })
    }
    
    // Filtro por tipo de execução
    if (filters.execution) {
        // "Livre" é o nome antigo de "Bônus": getSpellExecution trata os dois como a mesma execução
        const wanted = getSpellExecution(filters.execution)[0]
        processedSpells = processedSpells.filter(spell => getSpellExecution(spell.execution)[0] === wanted)
    }
    
    return processedSpells as ProcessedItem[]
}
