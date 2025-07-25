import type { Dice } from './dices'
import type { Magia } from './models'

export interface Ficha {
    _id?: string
    playerName: string
    mode: 'Apocalypse' | 'Classic'
    userId: string
    name: string
    age: number
    class: Class | Classes
    race: Race | Race['name']
    lineage: Lineage
    ORMLevel: number
    inventory: Inventory
    displacement: number
    magics: Magia[]
    anotacoes?: string
    magicsSpace: number
    mpLimit: number
    overall: number
    gender: Gender
    elementalMastery: Element
    level: number
    subclass: Subclass | string
    financialCondition: FinancialCondition
    expertises: Expertises
    traits: Trait[]
    session?: SessionInfo[]
    passives: Passive[]
    status: Status[]
    dices: Dice[]

    capacity: {
        cargo: number
        max: number
    }

    skills: {
        lineage: Skill[]
        class: Skill[]
        subclass: Skill[]
        bonus: Skill[]
        powers: MagicPowerSkill[]
        race: Skill[]
    }

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
        maxLp: number
        maxMp: number
        maxAp: number
    }

    ammoCounter: {
        current: number
        max: number
    }

    mods: {
        attributes: {
            des: number
            vig: number
            log: number
            sab: number
            foc: number
            car: number
        }
        discount: number
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
        expertises: number
        skills?: number
    }

    skills: Skill[]
}

export interface Lineage {
    name: LineageNames
    description: string
    effects: number[]
    item: Item
}

export interface MagicPowerSkill extends Skill {
    _id?: string
    mastery?: string
    element?: Element
}
export interface Occupation {
    name: OccupationNames
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

export interface SessionAttributes {
    maxLp: number
    maxMp: number
}

export interface SessionInfo {
    campaignCode: string
    attributes: SessionAttributes
}

export interface Inventory {
    items: Item[]
    weapons: Array<Weapon<'Leve' | 'Pesada'>>
    armors: Armor[]
    money: number
}

export interface Expertises {
    'Agilidade': Expertise<'des'>
    'Atletismo': Expertise<'vig'>
    'Competência': Expertise<'log'>
    'Comunicação': Expertise<'car'>
    'Condução': Expertise<'des'>
    'Conhecimento': Expertise<'sab'>
    'Controle': Expertise<'vig'>
    'Criatividade': Expertise<'log'>
    'Culinária': Expertise<'des'>
    'Diplomacia': Expertise<'car'>
    'Enganação': Expertise<'car'>
    'Engenharia': Expertise<'log'>
    'Força': Expertise<'vig'>
    'Furtividade': Expertise<'des'>
    'Intimidação': Expertise<'car'>
    'Intuição': Expertise<'sab'>
    'Interrogação': Expertise<'car'>
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
    'RES Mental': Expertise<'sab'>
    'Sorte': Expertise<'sab'>
    'Sobrevivência': Expertise<'sab'>
    'Tática': Expertise<'log'>
    'Tecnologia': Expertise<'log'>
    'Vontade': Expertise<'foc'>
}

export interface Expertise<T extends Attributes | null> {
    value: number
    defaultAttribute?: T
}

export interface Trait {
    name: string
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
    rarity: RarityType
    kind: ItemType
    weight: number
    effects?: number[] | string[]
    level?: number
}

export interface Weapon<T extends 'Leve' | 'Pesada' = any> {
    name: string
    description: string
    rarity: RarityType
    kind: WeaponType | WeaponType[]
    categ: WeaponCategory<T>
    range: RangeType
    weight: number
    hit: Attributes
    ammo: AmmoType | 'Não consome'
    magazineSize?: number
    quantity?: number
    accessories?: WeaponAccesoriesType[]
    bonus: 'Luta' | 'Agilidade' | 'Furtividade' | 'Pontaria' | 'Magia' | 'Tecnologia' | 'Controle'
    effect: {
        value: string
        critValue: string
        critChance: number
        effectType: DamageType
    }
}

export interface Armor {
    name: string
    description: string
    rarity: RarityType
    kind: ArmorType
    categ: 'Leve' | 'Média' | 'Pesada'
    quantity?: number
    weight: number
    value: number
    displacementPenalty: number
    accessories?: ArmorAccessoriesType[]
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
    hit: Attributes
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
    type: 'Poder Mágico' | 'Classe' | 'Linhagem' | 'Subclasse' | 'Bônus' | 'Profissão' | 'Exclusivo' | 'Raça'
    origin: string
    effects?: number[]
    level?: number
}

export interface Subclass {
    name: Subclasses
    description: string
    skills: Skill[]
}

export interface MagicPower {
    _id?: string
    elemento: Element
    nome: string
    'descrição': string
    maestria: string
    'pré-requisito'?: string
}

export interface Status {
    name: string
    type: 'buff' | 'debuff' | 'normal'
}

export type FinancialCondition = 'Miserável' | 'Pobre' | 'Estável' | 'Rico'
export type Gender = 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido'
export type Attributes = 'des' | 'vig' | 'log' | 'sab' | 'foc' | 'car'
export type UpperCaseAttributes = 'DES' | 'VIG' | 'LOG' | 'SAB' | 'FOC' | 'CAR'
export type ItemType = 'Especial' | 'Utilidade' | 'Consumível' | 'Item Chave' | 'Munição' | 'Capacidade' | 'Padrão'
export type RarityType = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário' | 'Único' | 'Mágico' | 'Especial' | 'Amaldiçoado'
export type WeaponType = `Arremessável (${ThrowableRangeType})` | 'Duas mãos' | 'Padrão' | 'Automática' | 'Semi-automática'
export type ArmorType = 'Padrão' | DamageType
export type DamageType = 'Cortante' | 'Impactante' | 'Perfurante' | 'Explosivo' | Element
export type Classes =
    'Combatente' |
    'Especialista' |
    'Feiticeiro' |
    'Bruxo' |
    'Monge' |
    'Druida' |
    'Arcano' |
    'Ladino' 

export type Subclasses = 
    'Polimorfo' |
    'Comandante' |
    'Forasteiro' |
    'Errante' |
    'Conjurador' |
    'Elementalista' |
    'Necromante' |
    'Espiritista' |
    'Discípulo da Fúria' |
    'Protetor da Alma' |
    'Animante' |
    'Naturomante' |
    'Arquimago' |
    'Metamágico' |
    'Espectro' |
    'Estrategista'
    
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
    'Investigador'

export type OccupationNames =
    'Artista' |
    'Médico' |
    'Militar' |
    'Mafioso' |
    'Cozinheiro' |
    'Inventor' |
    'Jardineiro' |
    'Programador' |
    'Cientista' |
    'Pesquisador' |
    'Empresário' |
    'Professor' |
    'Político' | 
    'Criminoso' |
    'Engenheiro' |
    'Mecânico' | 
    'Autônomo' |
    'Atleta' | 
    'Detetive' |
    'Sucateiro' |
    'Caçador' |
    'Clérigo' |
    'Desempregado'

export type AmmoType = 
    '9mm' |
    'Calibre .50' |
    'Calibre 12' |
    'Calibre 22' | 
    'Bateria de lítio' |
    'Amplificador de partículas' |
    'Cartucho de fusão' |
    'Servomotor iônico' |
    'Flecha' |
    'Combustível' | 
    'Foguete' | 
    'Granada' |
    'Serra de metal' |
    'Bateria de Cádmio com Óxido de Grafeno'

export type RangeType = 
    'Corpo-a-corpo' |
    'Curto (3m)' |
    'Padrão (9m)' |
    'Médio (18m)' |
    'Longo (30m)' |
    'Ampliado (90m)' |
    'Visível' |
    'Ilimitado'

export type ThrowableRangeType = 
    '3m' |
    '9m' |
    '18m' |
    '30m' |
    '90m' |
    'Visível' |
    'Ilimitado'

export type ExpertisesNames = keyof Expertises

export interface Passive {
    id: string
    title: string
    description: string
    occasion: PassiveOccasion
    custom?: boolean
}

export type PassiveOccasion = 
    'Início do turno' |
    'Final do turno' |
    'Ao ser atacado' |
    'Ao atacar' |
    'Ao usar magia' |
    'Ao sofrer dano' |
    'Ao causar dano' |
    'Sempre ativo' |
    'Quando curar' |
    'Ao se deslocar' |
    'Condição específica' |
    'Personalizado'

export type WeaponCategory<T extends 'Leve' | 'Pesada'> = 
    `Arma Branca (${T})` |
    `Arma de Longo Alcance (${T})` |
    `Arma de Fogo (${T})` |
    `Arma de Energia (${T})` |
    `Arma Mágica (${T})` |
    `Arma Especial (${T})`

export type WeaponAccesoriesType = WeaponScientificAccesoriesType | WeaponMagicalAccesoriesType
export type ArmorAccessoriesType = ArmorScientificAccesoriesType | ArmorMagicalAccesoriesType

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
    'Lanterna' |
    'Espinhos/Lâmina de Tungstênio' |
    'Cano/Lâmina Estriada' 

export type WeaponMagicalAccesoriesType = 
    'Switch Elemental' |
    'CNT' |
    'Chip mágico' |
    'Correntes mágicas' |
    'Repetidor' |
    'Paralisante' |
    'Espaços adicionais'

export type ArmorScientificAccesoriesType = 
    'Revestimento de Tungstênio' |
    'Polímero de Estireno' |
    'Exoesqueleto mecânico' |
    'DCA' |
    'Sistema de Temperamento' |
    'Compartimentos Extras' |
    'Visão noturna' |
    'Sistema de Auto-Reparo' |
    'SSC'

export type ArmorMagicalAccesoriesType = 
    'Switch Elemental' |
    'Espaços Adicionais' |
    'Restauração Mágica' |
    'DSD' |
    'Reservatório de Mana' |
    'SAM'

export type Element = 
    'Fogo' |
    'Água' |
    'Terra' |
    'Ar' |
    'Eletricidade' |
    'Trevas' |
    'Luz' |
    'Não-elemental'