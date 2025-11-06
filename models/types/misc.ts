import type { Attributes } from '@models'
import type { AmmoType, ArmorType, DamageType, ItemType, RangeType, RarityType, WeaponAccesoriesType, WeaponCategory, WeaponType } from './string'
import type { Charsheet, User } from '@models/entities'

export interface TriggredByUser {
    name: string
    socketId: string
    id: string
}

export interface EventData<T = Record<string, any>> {
    channelName: string
    data: T
    eventName: string
    triggeredBy: TriggredByUser
}

export interface Roll {
    name: string
    dice: number
    diceQuantity: number
    visibleDices: boolean
    visibleBaseAttribute: boolean
    bonus?: number[]
    sum?: boolean
}

export interface SessionNextAuth {
    user: User
    token: string
}

export interface AmmoControl {
    type: string;
    current: number;
    max: number;
}

export interface Member {
    name: string,
    email: string,
    image: string,
    id: string,
    currentCharsheet: Charsheet
}

export type CollectionNames = 
    'campaigns' |
    'charsheets' |
    'spells' |
    'notifications' |
    'powers' |
    'users'

export type ItemTypes = 
    'item' |
    'weapon' |
    'armor'

export interface SessionAttributes {
    maxLp: number
    maxMp: number
    maxAp: number
    lp: number
    mp: number
    ap: number
}

export interface SessionInfo {
    campaignCode: string
    stats: SessionAttributes
}

export interface MergedItems<T extends 'Leve' | 'Pesada'> {
    name: string
    description: string
    rarity: RarityType
    kind: WeaponType | ArmorType | ItemType
    type?: 'weapon' | 'armor' | 'item'
    categ: WeaponCategory<T> | ('Leve' | 'Média' | 'Pesada')
    range: RangeType
    weight: number
    value: number
    displacementPenalty: number
    hit: keyof Attributes
    ammo: AmmoType | 'Não consome'
    quantity?: number
    accessories?: WeaponAccesoriesType[]
    effects?: number[] | string[]
    level?: number
    bonus: 'Luta' | 'Agilidade' | 'Furtividade' | 'Pontaria' | 'Magia' | 'Tecnologia' | 'Controle'
    effect: {
        value: string
        critValue: string
        critChance: number
        kind: 'damage' | 'heal'
        effectType: DamageType | 'Cura'
    }
}