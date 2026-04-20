import type { PerkTypeEnum } from '@enums/rogueliteEnum'

export interface ProcessorFilters {
    perkType?: string | null
    levelRequired?: string | null
    rarity?: string | null
    rarities?: string[] | null
    userLevel?: number
    seed?: string
    // Filtros específicos para magias
    element?: string | null
    spellLevel?: number | null
    execution?: string | null
    // Filtros específicos para armas
    ignoreWeaponLevelWeight?: boolean
    // Filtros específicos para itens
    itemKind?: string | null
    itemKinds?: string[] | null
    // Filtros específicos para habilidades
    skillTypes?: string[] | null
}

export interface ProcessedItem {
    perkType: PerkTypeEnum
    rogueliteRarity?: string
    [key: string]: any
}

export type CollectionProcessor<T = any> = (
    filters: ProcessorFilters
) => Promise<ProcessedItem[]>
