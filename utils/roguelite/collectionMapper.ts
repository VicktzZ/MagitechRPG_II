/**
 * Mapeamento de collections do Firestore baseado no perkType
 */

import { PerkTypeEnum } from '@enums/rogueliteEnum'

const ALL_COLLECTIONS = [ 'perks', 'powers', 'skills', 'items', 'armors', 'spells', 'weapons' ] as const

type Collection = typeof ALL_COLLECTIONS[number]

const PERK_TYPE_COLLECTIONS: Record<string, Collection[]> = {
    [PerkTypeEnum.WEAPON]: [ 'weapons' ],
    [PerkTypeEnum.ITEM]: [ 'items' ],
    [PerkTypeEnum.ARMOR]: [ 'armors' ],
    [PerkTypeEnum.STATS]: [ 'perks' ],
    [PerkTypeEnum.ACCESSORY]: [ 'perks' ],
    [PerkTypeEnum.UPGRADE]: [ 'perks' ],
    [PerkTypeEnum.BONUS]: [ 'perks' ],
    [PerkTypeEnum.EXPERTISE]: [ 'perks' ],
    [PerkTypeEnum.SKILL]: [ 'perks', 'skills', 'powers' ],
    [PerkTypeEnum.SPELL]: [ 'spells' ]
}

/**
 * Determina quais collections buscar baseado no perkType
 */
export function getCollectionsForPerkType(perkType?: string): Collection[] {
    if (!perkType) {
        return [ ...ALL_COLLECTIONS ]
    }
    
    return PERK_TYPE_COLLECTIONS[perkType] ?? [ ...ALL_COLLECTIONS ]
}

/**
 * Parsea string de collections separadas por vírgula
 * Retorna array vazio se nenhuma collection válida for encontrada
 */
export function parseCollectionsParam(collectionsParam?: string | null): Collection[] {
    if (!collectionsParam) {
        return []
    }
    
    return collectionsParam
        .split(',')
        .map(c => c.trim() as Collection)
        .filter(c => ALL_COLLECTIONS.includes(c))
}

export { ALL_COLLECTIONS }
export type { Collection }
