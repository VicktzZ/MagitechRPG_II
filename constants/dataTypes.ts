import type { Armor, DamageType, Item, RangeType, RarityType } from '@types'

const damages: DamageType[] = [
    'Cortante',
    'Impactante',
    'Perfurante',
    'Fogo',
    'Agua',
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

const range: RangeType[] = [
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

export {
    damages,
    weaponKind,
    armorKind,
    range,
    itemKind,
    weaponCateg,
    armorCateg,
    rarities
}