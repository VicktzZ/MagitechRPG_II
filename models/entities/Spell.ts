import type { RangeType, Element } from '@models/types/string'
import { Collection } from 'fireorm'

@Collection('spells')
export class Spell {
    id: string
    element: Element
    name: string
    level: number = 1
    mpCost: number = 0
    type: string
    execution: string
    range: RangeType
    stages: string[]

    constructor(spell?: Partial<Spell>) {
        Object.assign(this, spell)
    }
}