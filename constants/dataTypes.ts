import type { 
    Armor,
    AmmoType,
    ArmorAccessoriesType,
    Attributes,
    DamageType,
    Item,
    RangeType,
    RarityType, 
    WeaponAccesoriesType,
    Weapon
} from '@types'

const damages: DamageType[] = [
    'Cortante',
    'Impactante',
    'Perfurante',
    'Explosivo',
    'Fogo',
    'Água',
    'Ar',
    'Terra',
    'Eletricidade',
    'Trevas',
    'Luz',
    'Não-elemental'
]

const weaponKind = [
    'Arremessável',
    'Duas mãos',
    'Padrão',
    'Automática',
    'Semi-automática'
] 

const armorKind: Array<Armor['kind']> = [
    'Padrão',
    ...damages
]

const itemKind: Array<Item['kind']> = [
    'Padrão',
    'Especial',
    'Utilidade',
    'Consumível',
    'Item Chave',
    'Munição',
    'Capacidade'
]

const rarities: RarityType[] = [
    'Comum',
    'Incomum',
    'Raro',
    'Épico',
    'Lendário',
    'Único',
    'Mágico',
    'Amaldiçoado'
]

const ranges: RangeType[] = [
    'Corpo-a-corpo',
    'Curto (3m)',
    'Padrão (9m)',
    'Médio (18m)',
    'Longo (30m)',
    'Ampliado (90m)',
    'Visível',
    'Ilimitado'
]

const weaponCateg = [
    'Arma Branca',
    'Arma de Longo Alcance',
    'Arma de Fogo',
    'Arma de Energia',
    'Arma Especial',
    'Arma Mágica'
]

const armorCateg: Array<Armor['categ']> = [
    'Leve',
    'Média',
    'Pesada'
]

const weaponHit: Attributes[] = [
    'foc',
    'log',
    'sab',
    'des',
    'vig',
    'car'
]

const ballisticWeaponAmmo: AmmoType[] = [
    '9mm',
    'Calibre .50',
    'Calibre 12',
    'Calibre 22'
]

const energyWeaponAmmo: AmmoType[] = [
    'Bateria de lítio',
    'Amplificador de partículas',
    'Cartucho de fusão',
    'Servomotor iônico'
]

const otherWeaponAmmo: AmmoType[] = [
    'Foguete',
    'Serra de metal',
    'Combustível',
    'Ácido',
    'Dardo',
    'Flecha',
    'Bateria de Cádmio com Óxido de Grafeno',
    'Granada'    
]

const weaponScientificAccessories: WeaponAccesoriesType [] = [
    'Cano curto',
    'Cano/Lâmina Estriada',
    'Cabo de borracha',
    'Electrochip',
    'Empunhadura',
    'Espinhos/Lâmina de Tungstênio',
    'Gravitron',
    'Lanterna',
    'Lasering',
    'Mira',
    'Munição explosiva',
    'Munição perfurante',
    'Munição teleguiada',
    'Nanomáquinas',
    'Nióbio sônico',
    'Pente estendido',
    'Ponta de tungstênio',
    'Ponta oca',
    'Silenciador'
]

const weaponMagicalAccessories: WeaponAccesoriesType[] = [
    'CNT',
    'Chip mágico',
    'Correntes mágicas',
    'Switch Elemental',
    'Repetidor',
    'Paralisante',
    'Espaços adicionais'
]

const armorScientificAccessories: ArmorAccessoriesType[] = [
    'Revestimento de Tungstênio',
    'Polímero de Estireno',
    'Compartimentos Extras',
    'Sistema de Temperamento',
    'Sistema de Auto-Reparo',
    'DCA',
    'SSC',
    'Sistema de Auto-Reparo',
    'Exoesqueleto mecânico',
    'Visão noturna'
]

const armorMagicalAccessories: ArmorAccessoriesType[] = [
    'Switch Elemental',
    'Espaços Adicionais',
    'Restauração Mágica',
    'DSD',
    'Reservatório de Mana',
    'SAM'
]

const weaponBonuses: Array<Weapon<'Leve' | 'Pesada'>['bonus']> = [
    'Agilidade',
    'Controle',
    'Furtividade',
    'Luta',
    'Magia',
    'Pontaria',
    'Tecnologia',
    'Força'
]

const rarityWeaponBonuses: Record<RarityType, number> = {
    'Comum': 0,
    'Incomum': 1,
    'Raro': 2,
    'Épico': 3,
    'Lendário': 4,
    'Único': 5,
    'Mágico': 5,
    'Especial': 0,
    'Amaldiçoado': 0
}

const rarityArmorBonuses: Record<RarityType, number> = {
    'Comum': 0,
    'Incomum': 1,
    'Raro': 1,
    'Épico': 2,
    'Lendário': 2,
    'Único': 3,
    'Mágico': 3,
    'Especial': 0,
    'Amaldiçoado': 0
}

export {
    damages,
    weaponKind,
    armorKind,
    ranges,
    weaponHit,
    itemKind,
    weaponCateg,
    energyWeaponAmmo,
    ballisticWeaponAmmo,
    otherWeaponAmmo,
    armorMagicalAccessories,
    armorScientificAccessories,
    weaponMagicalAccessories,
    weaponBonuses,
    weaponScientificAccessories,
    armorCateg,
    rarities,
    rarityWeaponBonuses,
    rarityArmorBonuses
}