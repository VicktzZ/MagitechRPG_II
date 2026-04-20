import type { Armor } from '@models'

export const defaultArmors: Record<'leve' | 'pesada', Array<Partial<Armor>>> = {
    leve: [
        {
            name: 'Colete balístico (leve)',
            description: '',
            rarity: 'Comum',
            kind: 'Perfurante',
            categ: 'Leve',
            weight: 2,
            value: 3,
            displacementPenalty: 0,
            quantity: 1
        },
        {
            name: 'Colete cinético',
            description: '',
            rarity: 'Comum',
            kind: 'Impactante',
            categ: 'Leve',
            weight: 1,
            value: 2,
            displacementPenalty: 0,
            quantity: 1
        },
        {
            name: 'Colete holográfico',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Leve',
            weight: 0.5,
            value: 2,
            displacementPenalty: 1,
            quantity: 1
        },
        {
            name: 'Armadura simples de couro',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Leve',
            weight: 1.5,
            value: 3,
            displacementPenalty: 0,
            quantity: 1
        },
        {
            name: 'Armadura simples de couro',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Leve',
            weight: 1.5,
            value: 3,
            displacementPenalty: 0,
            quantity: 1
        },
        {
            name: 'Armadura de malha',
            description: '',
            rarity: 'Comum',
            kind: 'Cortante',
            categ: 'Leve',
            weight: 2.5,
            value: 4,
            displacementPenalty: 0,
            quantity: 1
        },
        {
            name: 'Traje de forças especiais',
            description: '',
            rarity: 'Comum',
            kind: 'Perfurante',
            categ: 'Leve',
            weight: 3.5,
            value: 6,
            displacementPenalty: 1,
            quantity: 1
        }
    ],
    pesada: [
        {
            name: 'Colete balístico (pesado)',
            description: '',
            rarity: 'Comum',
            kind: 'Perfurante',
            categ: 'Pesada',
            weight: 4,
            value: 5,
            displacementPenalty: 2,
            quantity: 1
        },
        {
            name: 'Colete eletromagnético',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Pesada',
            weight: 6,
            value: 7,
            displacementPenalty: 3,
            quantity: 1
        },
        {
            name: 'Armadura medieval',
            description: '',
            rarity: 'Comum',
            kind: 'Cortante',
            categ: 'Pesada',
            weight: 10,
            value: 10,
            displacementPenalty: 7,
            quantity: 1
        },
        {
            name: 'Armadura antibomba',
            description: '',
            rarity: 'Comum',
            kind: 'Perfurante',
            categ: 'Pesada',
            weight: 16,
            value: 12,
            displacementPenalty: 8,
            quantity: 1
        },
        {
            name: 'Mecha',
            description: '',
            rarity: 'Comum',
            kind: 'Total',
            categ: 'Pesada',
            weight: 25,
            value: 15,
            displacementPenalty: 12,
            quantity: 1
        }
    ]
}

export const defaultArmor = {
    name: '',
    description: '',
    rarity: 'Comum',
    kind: 'Padrão',
    categ: '',
    weight: 0,
    value: 0,
    displacementPenalty: 0,
    accessories: [ 'Não possui acessórios' ],
    quantity: 1
}