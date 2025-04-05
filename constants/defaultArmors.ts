import type { Armor } from '@types'

export const deafultArmors: Record<'leve' | 'pesada', Armor[]> = {
    'leve': [ {
        name: '',
        description: '',
        rarity: 'Comum',
        kind: 'Leve',
        categ: 'Leve',
        price: 0,
        weight: 0,
        attributes: {
            def: 0,
            res: 0,
            mag: 0,
            mov: 0
        }
    } ],
    'pesada': [ {
        name: '',
        description: '',
        rarity: 'Comum',
        kind: 'Pesada',
        categ: 'Pesada',
        price: 0,
        weight: 0,
        attributes: {
            def: 0,
            res: 0,
            mag: 0,
            mov: 0
        }
    } ]
}