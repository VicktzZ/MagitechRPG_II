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
    'Fogo',
    'Água',
    'Terra',
    'Ar',
    'Planta',
    'Eletricidade',
    'Gelo',
    'Metal',
    'Trevas',
    'Luz',
    'Toxina',
    'Não-elemental'
]

const weaponKind = [
    'Arremessável',
    'Duas mãos',
    'Padrão'
] 

const armorKind: Array<Armor['kind']> = [
    'Padrão',
    ...damages
]

const itemKind: Array<Item['kind']> = [
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
    'Relíquia',
    'Mágico'
]

const ranges: RangeType[] = [
    'Corpo-a-corpo',
    'Curtíssimo (3m)',
    'Curto (6m)',
    'Reduzido (9m)',
    'Normal (12m)',
    'Médio (18m)',
    'Longo (30m)',
    'Distante (60m)',
    'Ampliado (90m)',
    'Visível',
    'Ilimitado'
]

const weaponCateg = [
    'Arma Branca',
    'Arma de Longo Alcance',
    'Arma de Fogo',
    'Arma de Energia',
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
    'Tecnologia'
]

const weaponDamageType: DamageType[] = [
    'Cortante',
    'Impactante',
    'Perfurante',
    'Fogo',
    'Água',
    'Ar',
    'Terra',
    'Planta',
    'Eletricidade',
    'Gelo',
    'Metal',
    'Luz',
    'Trevas',
    'Psíquico',
    'Toxina',
    'Não-elemental'
]

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
    armorMagicalAccessories,
    armorScientificAccessories,
    weaponMagicalAccessories,
    weaponBonuses,
    weaponDamageType,
    weaponScientificAccessories,
    armorCateg,
    rarities
}