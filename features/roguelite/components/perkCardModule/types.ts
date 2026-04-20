import type { Element } from '@models/types/string'
import type { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { Weapon } from '@models/Weapon'
import type { Armor } from '@models/Armor'
import type { rarityColor } from '@/constants'

export type Rarity = keyof typeof rarityColor

export interface PerkAttribute {
    label: string
    value: string | number
}

export interface PerkCardProps {
    title: string
    subtitle?: string
    description: string
    rarity: Rarity
    perkType?: PerkTypeEnum
    element?: Element
    icon?: React.ReactNode
    bgImage?: string
    weapon?: Partial<Weapon>
    armor?: Partial<Armor>
    level?: number
    stages?: string[]
    mpCost?: number
    attributes?: PerkAttribute[]
    // Seleção
    isSelected?: boolean
    onClick?: () => void
}

export interface AttributeBoxProps {
    label: string
    value: React.ReactNode
    borderColor: string
}

export interface AttributeGridProps {
    borderColor: string
}

export interface WeaponAttributesProps extends AttributeGridProps {
    weapon: Partial<Weapon>
}

export interface ArmorAttributesProps extends AttributeGridProps {
    armor: Partial<Armor>
}

export interface SpellAttributesProps extends AttributeGridProps {
    attributes?: PerkAttribute[]
}

export interface GenericAttributesProps extends AttributeGridProps {
    attributes: PerkAttribute[]
}
