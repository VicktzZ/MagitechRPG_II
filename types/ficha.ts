export interface Ficha {
    _id?: string
    playerName: string
    name: string
    age: number
    class: Class | Classes
    race: Race | Race['name']
    lineage: Lineage
    inventory: Inventory
    displacement: number
    totalCapacity: number
    magics: Magic[]
    gender: Gender
    elementalMastery: Element
    level: number
    subclass: Subclass | string
    financialCondition: FinancialCondition
    expertises: Expertises
    traits: Trait[]

    capacity: {
        cargo: number
        max: number
    }

    skills: {
        lineage: Skill[]
        class: Skill[]
        subclass: Skill[]
        bonus: Skill[]
        powers: Skill[]
    }

    points: {
        attributes: number
        expertises: number
        diligence: number
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

    attributes: {
        lp: number
        mp: number
        ap: number
    }

    points: {
        diligence: number
        expertises: number
    }

    skills: Skill[]
}

export interface Lineage {
    name: LineageNames
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
    'Agilidade': Expertise<'des'>
    'Argumentação': Expertise<'sab'>
    'Atletismo': Expertise<'vig'>
    'Competência': Expertise<'log'>
    'Comunicação': Expertise<'car'>
    'Condução': Expertise<'des'>
    'Conhecimento': Expertise<'sab'>
    'Controle': Expertise<'foc'>
    'Criatividade': Expertise<'log'>
    'Enganação': Expertise<'car'>
    'Furtividade': Expertise<'des'>
    'Intimidação': Expertise<'car'>
    'Intuição': Expertise<'log'>
    'Investigação': Expertise<'log'>
    'Ladinagem': Expertise<'des'>
    'Liderança': Expertise<'car'>
    'Luta': Expertise<'vig'>
    'Magia': Expertise<'foc'>
    'Medicina': Expertise<'sab'>
    'Percepção': Expertise<'foc'>
    'Persuasão': Expertise<'car'>
    'Pontaria': Expertise<'des'>
    'Reflexos': Expertise<'foc'>
    'RES Física': Expertise<'vig'>
    'RES Mágica': Expertise<'foc'>
    'RES Mental': Expertise<'log'>
    'Sorte': Expertise<'sab'>
    'Sobrevivência': Expertise<'sab'>
    'Tecnologia': Expertise<'log'>
    'Vontade': Expertise<'foc'>
}

export interface Expertise<T extends Attributes | null> {
    value: number
    defaultAttribute?: T
}

export interface Trait {
    name: string
    description: string
    value: number
    target: {
        kind: 'attribute',
        name: Attributes | UpperCaseAttributes
    } | {
        kind: 'expertise',
        name: keyof Expertises
    }
}

export interface TradeOff {
    name: string
}

// Generic Types

export interface Item {
    name: string
    description: string
    quantity?: number
    rarity?: RarityType
    kind: ItemType
    weight: number
    effects?: number[] | string[]
    level?: number
}

export interface Weapon<T extends 'Leve' | 'Pesada'> {
    name: string
    description: string
    rarity?: RarityType
    kind: WeaponType
    categ: WeaponCategory<T>
    range: RangeType
    weight: number
    hit: Attributes
    ammo: AmmoType | 'Não consome'
    accesories?: WeaponAccesoriesType[]
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
    rarity?: RarityType
    kind: ArmorType
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
    type: 'Poder Mágico' | 'Classe' | 'Linhagem' | 'Subclasse' | 'Bônus'
    origin?: string
    effects?: number[]
    level?: number
}

export interface Subclass {
    name: SubclassesNames
    description: string
    skills: Skill[]
}

export type FinancialCondition = 'Miserável' | 'Pobre' | 'Estável' | 'Rico'
export type Gender = 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido'
export type Classes = 'Marcial' | 'Explorador' | 'Feiticeiro' | 'Bruxo' | 'Monge' | 'Druida' | 'Arcano' | 'Ladino'
export type Attributes = 'des' | 'vig' | 'log' | 'sab' | 'foc' | 'car'
export type UpperCaseAttributes = 'DES' | 'VIG' | 'LOG' | 'SAB' | 'FOC' | 'CAR'
export type ItemType = 'Especial' | 'Utilidade' | 'Consumível' | 'Item Chave' | 'Munição' | 'Capacidade'
export type RarityType = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário' | 'Relíquia' | 'Radiante'
export type WeaponType = `Arremessável (${ThrowableRangeType})` | 'Duas mãos' | 'Padrão'
export type ArmorType = 'Padrão' | DamageType
export type DamageType = 'Cortante' | 'Impactante' | 'Perfurante' | Element

export type LineageNames = 
    'Órfão' |
    'Órfão' |
    'Infiltrado' |
    'Estrangeiro' |
    'Camponês' |
    'Burguês' |
    'Artista' |
    'Ginasta' |
    'Herdeiro' |
    'Cobaia' |
    'Gangster' |
    'Hacker' |
    'Combatente' |
    'Clínico' |
    'Aventureiro' |
    'Trambiqueiro' |
    'Prodígio' |
    'Novato' |
    'Inventor' |
    'Idólatra' |
    'Cismático' |
    'Pesquisador' |
    'Exilado' |
    'Investigador'

export type AmmoType = 
    '9mm' |
    'Calibre .50' |
    'Calibre 12' |
    'Calibre 22' | 
    'Bateria de lítio' |
    'Amplificador de partículas' |
    'Cartucho de fusão' |
    'Servomotor iônico'

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

export type ThrowableRangeType = 
    '3m' |
    '6m' |
    '9m' |
    '12m' |
    '18m' |
    '30m' |
    '60m' |
    '90m' |
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

export type ExpertisesNames = keyof Expertises

export type WeaponCategory<T extends 'Leve' | 'Pesada'> = 
    `Arma Branca (${T})` |
    `Arma de Longo Alcance (${T})` |
    `Arma de Fogo (${T})` |
    `Arma de Energia (${T})` |
    `Arma Mágica (${T})`

export type WeaponAccesoriesType = WeaponScientificAccesoriesType | WeaponMagicalAccesoriesType

export type WeaponScientificAccesoriesType = 
    'Gravitron' |
    'Nanomáquinas' |
    'Electrochip' |
    'Lasering' |
    'Nióbio sônico' |
    'Silenciador' |
    'Pente estendido' |
    'Mira' |
    'Cano curto' |
    'Ponta de tungstênio' |
    'Munição explosiva' |
    'Munição perfurante' |
    'Ponta oca' | 
    'Empunhadura' |
    'Munição teleguiada' |
    'Cabo de borracha' |
    'Lanterna' 

export type WeaponMagicalAccesoriesType = 
    'Switch Elemental' |
    'CNT' |
    'Chip mágico' |
    'Correntes mágicas' |
    'Repetidor' |
    'Paralisante' |
    'Espaços adicionais'

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