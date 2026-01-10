import type { Collection } from '@utils/roguelite/collectionMapper'
import type { ProcessorFilters, ProcessedItem } from './types'
import { processPerks } from './perksProcessor'
import { processPowers } from './powersProcessor'
import { processSkills } from './skillsProcessor'
import { processItems } from './itemsProcessor'
import { processArmors } from './armorsProcessor'
import { processSpells } from './spellsProcessor'
import { processWeapons } from './weaponsProcessor'
import { processExpertise } from './expertiseProcessor'

export type { ProcessorFilters, ProcessedItem }

type ProcessorFn = (filters: ProcessorFilters) => Promise<ProcessedItem[]>

const COLLECTION_PROCESSORS: Record<Collection, ProcessorFn> = {
    perks: processPerks,
    powers: processPowers,
    skills: processSkills,
    items: processItems,
    armors: processArmors,
    spells: processSpells,
    weapons: processWeapons,
    expertise: processExpertise
}

/**
 * Processa múltiplas collections e retorna resultados agrupados
 */
export async function processCollections(
    collections: Collection[],
    filters: ProcessorFilters
): Promise<Record<string, ProcessedItem[]>> {
    console.log('[processCollections] Processando collections:', collections)
    console.log('[processCollections] Com filtros:', { skillTypes: filters.skillTypes, perkType: filters.perkType })
    
    const result: Record<string, ProcessedItem[]> = {}
    
    await Promise.all(
        collections.map(async (collection) => {
            const processor = COLLECTION_PROCESSORS[collection]
            if (processor) {
                result[collection] = await processor(filters)
                console.log(`[processCollections] ${collection} retornou ${result[collection].length} itens`)
            }
        })
    )
    
    const total = Object.values(result).flat().length
    console.log('[processCollections] Total de itens:', total)
    
    return result
}

/**
 * Processa múltiplas collections e retorna como array unificada
 */
export async function processCollectionsFlat(
    collections: Collection[],
    filters: ProcessorFilters
): Promise<ProcessedItem[]> {
    const grouped = await processCollections(collections, filters)
    return Object.values(grouped).flat()
}

export {
    processPerks,
    processPowers,
    processSkills,
    processItems,
    processArmors,
    processSpells,
    processWeapons,
    processExpertise
}
