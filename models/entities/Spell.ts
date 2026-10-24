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
    /** Opcional: acréscimo de MP do estágio 2 e do estágio 3, nesta ordem, somado ao `mpCost` (sem o campo vale o padrão do código por nível) */
    mpCostIncrease?: number[]

    constructor(spell?: Partial<Spell>) {
        Object.assign(this, spell)
    }
}