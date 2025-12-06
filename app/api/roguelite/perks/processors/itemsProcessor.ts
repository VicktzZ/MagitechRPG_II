import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { itemRepository } from '@repositories'
import type { ProcessorFilters, ProcessedItem } from './types'

export async function processItems(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    const items = await itemRepository.find()
    
    console.log('[itemsProcessor] filters recebidos:', {
        rarities: filters.rarities,
        rarity: filters.rarity,
        itemKind: filters.itemKind
    })
    
    // Adicionar rogueliteRarity baseado na rarity original
    let processedItems = items.map(item => {
        const itemObj = item as any
        return {
            ...itemObj,
            rogueliteRarity: itemObj.rogueliteRarity || itemObj.rarity || 'Comum',
            perkType: PerkTypeEnum.ITEM
        }
    })
    
    console.log('[itemsProcessor] total antes de filtros:', processedItems.length)
    console.log('[itemsProcessor] raridades únicas:', [ ...new Set(processedItems.map(i => i.rogueliteRarity)) ])
    console.log('[itemsProcessor] kinds únicos:', [ ...new Set(processedItems.map(i => i.kind)) ])
    
    // Filtro por múltiplas raridades (multi-select)
    const hasRarities = filters.rarities && Array.isArray(filters.rarities) && filters.rarities.length > 0
    console.log('[itemsProcessor] hasRarities:', hasRarities, 'filters.rarities:', filters.rarities)
    
    if (hasRarities) {
        console.log('[itemsProcessor] filtrando por rarities:', filters.rarities)
        const beforeFilter = processedItems.length
        processedItems = processedItems.filter(item => {
            // Normalizar para comparação (remover espaços extras)
            const itemRarity = (item.rogueliteRarity || '').trim()
            const matches = filters.rarities!.some(r => r.trim() === itemRarity)
            return matches
        })
        console.log('[itemsProcessor] após filtro rarities:', processedItems.length, '(removidos:', beforeFilter - processedItems.length, ')')
        console.log('[itemsProcessor] itens finais:', processedItems.map(i => ({ name: i.name, rogueliteRarity: i.rogueliteRarity })))
    } else if (filters.rarity) {
        console.log('[itemsProcessor] filtrando por rarity única:', filters.rarity)
        processedItems = processedItems.filter(item => item.rogueliteRarity === filters.rarity)
        console.log('[itemsProcessor] após filtro rarity:', processedItems.length)
    }
    
    // Filtro por múltiplos tipos de item (multi-select)
    const hasItemKinds = filters.itemKinds && Array.isArray(filters.itemKinds) && filters.itemKinds.length > 0
    if (hasItemKinds) {
        console.log('[itemsProcessor] filtrando por itemKinds:', filters.itemKinds)
        const beforeFilter = processedItems.length
        processedItems = processedItems.filter(item => {
            // Normalizar para comparação (remover espaços extras)
            const itemKind = (item.kind || '').trim()
            return filters.itemKinds!.some(k => k.trim() === itemKind)
        })
        console.log('[itemsProcessor] após filtro itemKinds:', processedItems.length, '(removidos:', beforeFilter - processedItems.length, ')')
    } else if (filters.itemKind) {
        // Fallback para filtro único (compatibilidade)
        console.log('[itemsProcessor] filtrando por itemKind único:', filters.itemKind)
        processedItems = processedItems.filter(item => item.kind === filters.itemKind)
        console.log('[itemsProcessor] após filtro itemKind:', processedItems.length)
    }
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedItems = processedItems.filter(item => 
                item.levelRequired === undefined || item.levelRequired === level
            )
        }
    }
    
    return processedItems as ProcessedItem[]
}
