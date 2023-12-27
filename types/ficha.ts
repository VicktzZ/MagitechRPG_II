export interface Ficha {
    _id?: string
    playerName: string
    name: string
    age: number
    class: Class | string
    race: Race | string
    lineage: Lineage | string
    inventory: Inventory
    displacement: number
    capacity: number
    magics: Magic[]
    gender: 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido'
    elementalMastery: Element
    level: number
    subclass: Subclass | string
    financialCondition: 'Miserável' | 'Pobre' | 'Classe Média' | 'Classe Média Alta' | 'Rico' | 'Muito Rico'
    skills: Skill[]
    expertises: Expertises
    perks: Perk[]
    penalties: Perk[]

    points: {
        attributes: number
        expertises: number
        skills: number
        magics: number
    }

    attributes: {
        lp: number
        mp: number
        ap: number
        des: number
        vig: number
        log: number
        sab: number
        foc: number
        car: number
    }
}

// Types

export interface Class {
    name: Classes
    description: string

    effects: {
        lp: number
        mp: number
        ap: number
    }

    restrictions: {
        vig: number
        des: number
        log: number
        sab: number
        foc: number
        car: number
    }
}

export interface Lineage {
    name: string
    description: string
    effects: number[]
    item: Item
}

export interface Race {
    name: 'Humano' | 'Ciborgue' | 'Autômato' | 'Humanoide' | 'Mutante' | 'Magia-viva'
    description: string
    effect: number
    skill?: Skill
}
export interface Inventory {
    items: Item[]
    weapons: Array<Weapon<'Leve' | 'Pesada'>>
    armors: Armor[]
    money: number
}

export interface Expertises {
    'Atletismo': Expertise<'vig'>
    'RES Física': Expertise<'vig'>
    'RES Mental': Expertise<'log'>
    'RES Mágica': Expertise<'foc'>
    'Crime': Expertise<'des'>
    'Agilidade': Expertise<'des'>
    'Sobrevivência': Expertise<'sab'>
    'Competência': Expertise<'log'>
    'Luta': Expertise<'vig'>
    'Conhecimento': Expertise<'sab'>
    'Criatividade': Expertise<'log'>
    'Furtividade': Expertise<'des'>
    'Pontaria': Expertise<'des'>
    'Reflexos': Expertise<'foc'>
    'Controle': Expertise<'foc'>
    'Condução': Expertise<'des'>
    'Sorte': Expertise<'sab'>
    'Enganação': Expertise<'car'>
    'Tecnologia': Expertise<'log'>
    'Magia': Expertise<'foc'>
    'Medicina': Expertise<'sab'>
    'Percepção': Expertise<'foc'>
    'Intuição': Expertise<'log'>
    'Investigação': Expertise<'log'>
    'Argumentação': Expertise<'sab'>
    'Intimidação': Expertise<'car'>
    'Comunicação': Expertise<'car'>
    'Persuasão': Expertise<'car'>
    'Liderança': Expertise<'car'>
}

export interface Expertise<T extends Attributes | null> {
    value: number
    defaultAttribute?: T
}

export interface Perk {
    name: string
    description: string
    level: number
    kind: string
}

export interface TradeOff {
    name: string
}

// Generic Types

export interface Item {
    name: string
    description: string
    kind: ItemType
    weight: number
    effects?: number[]
}

export interface Weapon<T extends 'Leve' | 'Pesada'> {
    name: string
    description: string
    kind?: WeaponType
    categ: WeaponCategory<T>
    range: RangeType
    weight: number
    hit: Attributes
    bonus: 'Luta' | 'Agilidade' | 'Furtividade' | 'Pontaria' | 'Magia' | 'Tecnologia'
    effect: {
        value: string
        critValue: string
        critChance: number
        kind: 'damage' | 'heal'
        effectType: DamageType | 'Cura'
    }
}

export interface Armor {
    name: string
    description: string
    categ: 'Leve' | 'Média' | 'Pesada'
    weight: number
    value: number
    displacementPenalty: number
}

export interface Magic {
    name: string
    description: string
    kind: Element
    manaCost: number
    level: number
    levelRequired: number
}

export interface Skill {
    name: string
    description: string
    effects?: number[]
}

export interface Subclass {
    name: SubclassesNames
    description: string
    skills: Skill[]
}

export type Classes = 'Marcial' | 'Explorador' | 'Feiticeiro' | 'Bruxo' | 'Monge' | 'Druida' | 'Arcano' | 'Ladino'
export type Attributes = 'des' | 'vig' | 'log' | 'sab' | 'foc' | 'car'
export type ItemType = 'Especial' | 'Utilidade' | 'Consumível' | 'Item Chave' | 'Munição' | 'Capacidade'
export type WeaponType = 'Arremessável' | 'Duas mãos'
export type DamageType = 'Cortante' | 'Impactante' | 'Perfurante' | Element

export type RangeType = 
    'Corpo-a-corpo' |
    'Curtíssimo (3m)' |
    'Curto (6m)' |
    'Reduzido (9m)' |
    'Normal (12m)' |
    'Médio (18m)' |
    'Longo (30m)' |
    'Distante (60m)' |
    'Ampliado (90m)' |
    'Visível' |
    'Ilimitado'

export type SubclassesNames = 
    'Armipotente' |
    'Polimorfo' |
    'Comandante' |
    'Harmonizador' |
    'Numeromante' |
    'Transcendentalista' |
    'Conjurador' |
    'Elementalista' |
    'Alquimista' |
    'Necromante' |
    'Espiritista' |
    'Pocionista' |
    'Guardião das Energias' |
    'Protetor da Alma' |
    'Andarilho' |
    'Animante' |
    'Naturomante' |
    'Shapeshifter' |
    'Dimensionalista' |
    'Arquimago' |
    'Metamágico' |
    'Espectro' |
    'Metafísico' |
    'Supernaturalista'

export type WeaponCategory<T extends 'Leve' | 'Pesada'> = 
    `Arma Branca (${T})` |
    `Arma de Longo Alcance (${T})` |
    `Arma de Fogo (${T})` |
    `Arma de Energia (${T})` |
    `Arma Mágica (${T})`

export type Element = 
    'Fogo' |
    'Agua' |
    'Terra' |
    'Ar' |
    'Planta' |
    'Eletricidade' |
    'Gelo' |
    'Metal' |
    'Trevas' |
    'Luz' |
    'Toxina' |
    'Não-elemental'