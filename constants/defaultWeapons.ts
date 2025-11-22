/* eslint-disable max-len */
import type { Weapon } from '@models'

export const defaultWeapons: Record<'melee' | 'ranged' | 'magic' | 'ballistic' | 'energy' | 'special', Array<Partial<Weapon>>> = {
    melee: [
        {
            name: 'Faca',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 0.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Adaga',
            effect: {
                value: '1d4',
                critValue: '3d4',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Soco Inglês',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 0.2,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Soqueira',
            effect: {
                value: '1d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Agulha de tungstênio',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 0,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Furtividade',
            weaponKind: 'Adaga',
            effect: {
                value: '1d2',
                critValue: '6d2',
                critChance: 17,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Espada',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Espada',
            effect: {
                value: '2d6',
                critValue: '4d6',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Espada Longa',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 4,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Espada',
            effect: {
                value: '3d6',
                critValue: '6d6',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Machadinha',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 0.8,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Machado',
            effect: {
                value: '2d4',
                critValue: '4d4',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Soqueiras/Manoplas',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Soqueira',
            effect: {
                value: '2d8',
                critValue: '4d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Alabarda',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Pesada)',
            range: 'Curto (3m)',
            weight: 3,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Arma de Haste',
            effect: {
                value: '2d10',
                critValue: '4d10',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Katana',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Leve)',
            range: 'Curto (3m)',
            weight: 1.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Espada',
            effect: {
                value: '2d12',
                critValue: '4d12',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Porrete',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Arma de Concussão',
            effect: {
                value: '2d8',
                critValue: '4d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Marreta',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 6,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Martelo',
            effect: {
                value: '3d12',
                critValue: '4d12',
                critChance: 19,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Florete',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Curto (3m)',
            weight: 1,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Espada',
            effect: {
                value: '2d6',
                critValue: '8d6',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Facão/Machete',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (3m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1.3,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Espada',
            effect: {
                value: '4d4',
                critValue: '8d4',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Lança',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1.8,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Lança',
            effect: {
                value: '2d8',
                critValue: '6d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Arpão',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Lança',
            effect: {
                value: '2d8',
                critValue: '4d8',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Bastão/Cajado',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 0.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Arma de Concussão',
            effect: {
                value: '1d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Foice',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Curto (3m)',
            weight: 2.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Foice',
            effect: {
                value: '2d10',
                critValue: '4d10',
                critChance: 18,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Tridente',
            description: '',
            rarity: 'Comum',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Pesada)',
            range: 'Curto (3m)',
            weight: 3.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Lança',
            effect: {
                value: '2d12',
                critValue: '4d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Chicote',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Curto (3m)',
            weight: 1.2,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Arma de Concussão',
            effect: {
                value: '2d4',
                critValue: '4d4',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Maça',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Curto (3m)',
            weight: 1.4,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Arma de Concussão',
            effect: {
                value: '3d8',
                critValue: '6d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Mangual',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Pesada)',
            range: 'Curto (3m)',
            weight: 2.0,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Martelo',
            effect: {
                value: '2d12',
                critValue: '4d12',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Machado',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 5.0,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Machado',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Picareta',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 3.0,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Arma de Haste',
            effect: {
                value: '2d12',
                critValue: '6d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Montante',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Curto (3m)',
            weight: 7.0,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Espada',
            effect: {
                value: '3d12',
                critValue: '9d16',
                critChance: 17,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Escudo',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3.2,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Escudo',
            effect: {
                value: '2d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Escudo Tático',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 8.0,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            weaponKind: 'Escudo',
            effect: {
                value: '3d8',
                critValue: '6d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        }
    ],
    ranged: [
        {
            name: 'Arco curto',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Médio (18m)',
            weight: 1.0,
            hit: 'des',
            ammo: 'Flecha',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Agilidade',
            effect: {
                value: '1d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Arco Longo',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Pesada)',
            range: 'Longo (30m)',
            weight: 1.5,
            hit: 'des',
            ammo: 'Flecha',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Pontaria',
            effect: {
                value: '2d8',
                critValue: '4d8',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Balestra',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Médio (18m)',
            weight: 1.2,
            hit: 'des',
            ammo: 'Flecha',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Pontaria',
            effect: {
                value: '2d8',
                critValue: '6d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Zarabatana',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Padrão (9m)',
            weight: 0.1,
            hit: 'des',
            ammo: 'Dardo',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Agilidade',
            effect: {
                value: '1d6',
                critValue: '3d6',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Besta de mão',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Padrão (9m)',
            weight: 0.6,
            hit: 'des',
            ammo: 'Flecha',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Agilidade',
            effect: {
                value: '2d6',
                critValue: '4d6',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Arco composto',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Pesada)',
            range: 'Ampliado (90m)',
            weight: 2.5,
            hit: 'des',
            ammo: 'Flecha',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Pontaria',
            effect: {
                value: '3d10',
                critValue: '6d10',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Boleadeira',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Curto (3m)',
            weight: 0.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            effect: {
                value: '1d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Bumerangue',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Curto (3m)',
            weight: 0.3,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            effect: {
                value: '2d6x2',
                critValue: '4d6',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Dardo',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Curto (3m)',
            weight: 0.1,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            effect: {
                value: '2d4',
                critValue: '4d4',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Shuriken',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Padrão (9m)',
            weight: 0.2,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            effect: {
                value: '3d4',
                critValue: '6d4',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Glaive',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Longo Alcance (Pesada)',
            range: 'Padrão (9m)',
            weight: 1.9,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Arma de Haste',
            effect: {
                value: '1d10x2',
                critValue: '3d10',
                critChance: 19,
                effectType: 'Cortante'
            }
        }
    ],
    ballistic: [
        {
            name: 'Pistola',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Fogo (Leve)',
            range: 'Médio (18m)',
            weight: 1.0,
            hit: 'des',
            ammo: '9mm',
            magazineSize: 10,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola',
            effect: {
                value: '1d10',
                critValue: '2d10',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Revólver',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Fogo (Leve)',
            range: 'Médio (18m)',
            weight: 1.5,
            hit: 'des',
            ammo: '9mm',
            magazineSize: 6,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola',
            effect: {
                value: '3d4',
                critValue: '6d4',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Pistola tática',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Fogo (Leve)',
            range: 'Padrão (9m)',
            weight: 0.7,
            hit: 'des',
            ammo: '9mm',
            magazineSize: 12,
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Pistola',
            effect: {
                value: '4d4',
                critValue: '4d4',
                critChance: 16,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Canhão de mão',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Longo (30m)',
            weight: 3.0,
            hit: 'des',
            ammo: 'Calibre .50',
            magazineSize: 7,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola',
            effect: {
                value: '3d12',
                critValue: '9d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Espingarda',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Curto (3m)',
            weight: 4.0,
            hit: 'vig',
            ammo: 'Calibre 12',
            magazineSize: 5,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Espingarda',
            effect: {
                value: '6d8',
                critValue: '12d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Submetralhadora',
            description: '',
            rarity: 'Comum',
            kind: 'Automática',
            categ: 'Arma de Fogo (Leve)',
            range: 'Médio (18m)',
            weight: 3.0,
            hit: 'vig',
            ammo: '9mm',
            magazineSize: 32,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Submetralhadora',
            effect: {
                value: '1d8',
                critValue: '1d8',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Rifle de assalto',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Longo (30m)',
            weight: 5.0,
            hit: 'des',
            ammo: 'Calibre 22',
            magazineSize: 28,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Fuzil',
            effect: {
                value: '2d8',
                critValue: '4d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Metralhadora leve',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Longo (30m)',
            weight: 10.0,
            hit: 'des',
            ammo: 'Calibre 22',
            magazineSize: 60,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Metralhadora',
            effect: {
                value: '3d8',
                critValue: '6d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Rifle tático',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Médio (18m)',
            weight: 3.8,
            hit: 'des',
            ammo: 'Calibre 22',
            magazineSize: 32,
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Fuzil',
            effect: {
                value: '3d10',
                critValue: '3d10',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Fuzil de batedor',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Ampliado (90m)',
            weight: 6.0,
            hit: 'des',
            ammo: 'Calibre 22',
            magazineSize: 16,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador',
            effect: {
                value: '4d8',
                critValue: '8d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Fuzil de precisão',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Visível',
            weight: 12.0,
            hit: 'des',
            ammo: 'Calibre .50',
            magazineSize: 5,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador',
            effect: {
                value: '3d12',
                critValue: '6d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Carabina ou Rifle',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Leve)',
            range: 'Ampliado (90m)',
            weight: 4.0,
            hit: 'des',
            ammo: 'Calibre 22',
            magazineSize: 20,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador',
            effect: {
                value: '4d6',
                critValue: '8d6',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Espingarda automática',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Curto (3m)',
            weight: 8.0,
            hit: 'vig',
            ammo: 'Calibre 12',
            magazineSize: 8,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Espingarda',
            effect: {
                value: '6d8',
                critValue: '12d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Pistola automática',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Leve)',
            range: 'Padrão (9m)',
            weight: 1.3,
            hit: 'des',
            ammo: '9mm',
            magazineSize: 18,
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Pistola',
            effect: {
                value: '1d8',
                critValue: '1d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Metralhadora pesada',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Fogo (Pesada)',
            range: 'Ampliado (90m)',
            weight: 15.0,
            hit: 'vig',
            ammo: 'Calibre .50',
            magazineSize: 80,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Metralhadora',
            effect: {
                value: '1d20',
                critValue: '2d20',
                critChance: 20,
                effectType: 'Perfurante'
            }
        }
    ],
    energy: [
        {
            name: 'Pistola de energia',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Energia (Leve)',
            range: 'Médio (18m)',
            weight: 0.8,
            hit: 'des',
            ammo: 'Bateria de lítio',
            magazineSize: 0,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola de Energia',
            effect: {
                value: '1d8',
                critValue: '4d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Revólver de energia',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Energia (Leve)',
            range: 'Médio (18m)',
            weight: 1.2,
            hit: 'des',
            ammo: 'Bateria de lítio',
            magazineSize: 0,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola de Energia',
            effect: {
                value: '1d12',
                critValue: '2d12',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Pistola holográfica',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Energia (Leve)',
            range: 'Padrão (9m)',
            weight: 0.5,
            hit: 'des',
            ammo: 'Bateria de lítio',
            magazineSize: 0,
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Pistola de Energia',
            effect: {
                value: '1d4',
                critValue: '3d4',
                critChance: 17,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Canhão de plasma',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Energia (Pesada)',
            range: 'Médio (18m)',
            weight: 2.0,
            magazineSize: 0,
            hit: 'des',
            ammo: 'Amplificador de partículas',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Pistola de Energia',
            effect: {
                value: '2d12',
                critValue: '8d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Espingarda de fusão',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Pesada)',
            range: 'Curto (3m)',
            magazineSize: 0,
            weight: 3.5,
            hit: 'vig',
            ammo: 'Cartucho de fusão',
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Espingarda de Energia',
            effect: {
                value: '5d8',
                critValue: '10d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Submetralhadora a laser',
            description: '',
            rarity: 'Comum',
            kind: 'Automática',
            magazineSize: 0,
            categ: 'Arma de Energia (Leve)',
            range: 'Médio (18m)',
            weight: 2.5,
            hit: 'des',
            ammo: 'Bateria de lítio',
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Metralhadora de Energia',
            effect: {
                value: '1d8',
                critValue: '3d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Rifle de assalto ionizado',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Leve)',
            magazineSize: 0,
            range: 'Longo (30m)',
            weight: 4,
            hit: 'des',
            ammo: 'Servomotor iônico',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Fuzil de Energia',
            effect: {
                value: '1d8',
                critValue: '3d8',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Metralhadora a laser',
            description: '',
            rarity: 'Comum',
            magazineSize: 0,
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Pesada)',
            range: 'Longo (30m)',
            weight: 8,
            hit: 'des',
            ammo: 'Servomotor iônico',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Metralhadora de Energia',
            effect: {
                value: '2d8',
                critValue: '3d8',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Rifle holográfico',
            description: '',
            rarity: 'Comum',
            magazineSize: 0,
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Leve)',
            range: 'Médio (18m)',
            weight: 3,
            hit: 'des',
            ammo: 'Servomotor iônico',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Fuzil de Energia',
            effect: {
                value: '1d6',
                critValue: '3d6',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Fuzil desintegrador',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Pesada)',
            magazineSize: 0,
            range: 'Ampliado (90m)',
            weight: 5,
            hit: 'des',
            ammo: 'Servomotor iônico',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador de Energia',
            effect: {
                value: '5d6',
                critValue: '10d6',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Carabina/Rifle eletromagnético',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Leve)',
            magazineSize: 0,
            range: 'Ampliado (90m)',
            weight: 4,
            hit: 'des',
            ammo: 'Servomotor iônico',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador de Energia',
            effect: {
                value: '3d6',
                critValue: '6d6',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Fuzil de hidrogênio',
            description: '',
            magazineSize: 0,
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma de Energia (Pesada)',
            range: 'Visível',
            weight: 10,
            hit: 'des',
            ammo: 'Amplificador de partículas',
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Rifle de Atirador de Energia',
            effect: {
                value: '5d12',
                critValue: '15d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Espingarda de fusão automática',
            description: '',
            rarity: 'Comum',
            kind: 'Automática',
            magazineSize: 0,
            categ: 'Arma de Energia (Pesada)',
            range: 'Curto (3m)',
            weight: 6,
            hit: 'vig',
            ammo: 'Cartucho de fusão',
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Espingarda de Energia',
            effect: {
                value: '3d6',
                critValue: '6d6',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Pistola de energia auto.',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            magazineSize: 0,
            categ: 'Arma de Energia (Leve)',
            range: 'Padrão (9m)',
            weight: 1,
            hit: 'des',
            ammo: 'Bateria de lítio',
            quantity: 1,
            bonus: 'Agilidade',
            weaponKind: 'Pistola de Energia',
            effect: {
                value: '1d4',
                critValue: '2d4',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Metralhadora molecular',
            description: '',
            rarity: 'Comum',
            kind: 'Padrão',
            categ: 'Arma de Energia (Pesada)',
            range: 'Ampliado (90m)',
            weight: 12.5,
            hit: 'des',
            ammo: 'Amplificador de partículas',
            magazineSize: 0,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Metralhadora de Energia',
            effect: {
                value: '1d12',
                critValue: '2d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        }
    ],
    special: [
        {
            name: 'Lança-chamas',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Curto (3m)',
            weight: 15,
            hit: 'vig',
            ammo: 'Combustível',
            magazineSize: 10,
            quantity: 1,
            bonus: 'Controle',
            effect: {
                value: '3d10',
                critValue: '4d10',
                critChance: 20,
                effectType: 'Fogo'
            }
        },
        {
            name: 'Lança-granadas',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Padrão (9m)',
            weight: 8,
            hit: 'vig',
            ammo: 'Granada',
            magazineSize: 6,
            quantity: 1,
            bonus: 'Controle',
            weaponKind: 'Arma Explosiva',
            effect: {
                value: '1d20',
                critValue: '2d20',
                critChance: 20,
                effectType: 'Explosivo'
            }
        },
        {
            name: 'Lança-foguetes',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Longo (30m)',
            weight: 10,
            hit: 'vig',
            ammo: 'Foguete',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Arma Explosiva',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 20,
                effectType: 'Explosivo'
            }
        },
        {
            name: 'Lanca-serra',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Curto (3m)',
            weight: 10,
            hit: 'vig',
            ammo: 'Serra de metal',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Força',
            effect: {
                value: '5d8',
                critValue: '10d8',
                critChance: 20,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Minigun',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Médio (18m)',
            weight: 20,
            hit: 'vig',
            ammo: '9mm',
            magazineSize: 100,
            quantity: 1,
            bonus: 'Controle',
            effect: {
                value: '3d12',
                critValue: '4d12',
                critChance: 20,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Lança-foguetes guiado',
            description: '',
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Médio (18m)',
            weight: 12,
            hit: 'vig',
            ammo: 'Foguete',
            magazineSize: 4,
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Arma Explosiva',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 20,
                effectType: 'Explosivo'
            }
        },
        {
            name: 'Canhão Antiaéreo Eletromagnético',
            description: '',
            rarity: 'Especial',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Ampliado (90m)',
            weight: 30,
            hit: 'log',
            ammo: 'Bateria de Cádmio com Óxido de Grafeno',
            magazineSize: 3,
            quantity: 1,
            bonus: 'Tecnologia',
            weaponKind: 'Arma Explosiva',
            effect: {
                value: '10d20',
                critValue: '20d20',
                critChance: 20,
                effectType: 'Explosivo'
            }
        }
    ],
    magic: [
        {
            name: 'Sangravoz',
            description: 'Uma espada média, embebida em essência de Ira.\nSempre que causar dano, o portador pode escolher aumentar o dano em +10 à custa de sofrer 5 de dano mental por causa da energia hostil contida nela. Em crítico, o inimigo é obrigado a fazer um teste de Controle ou entrar em estado de Fúria Cega (ataca aleatoriamente em seu próximo turno).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Espada',
            effect: {
                value: '4d8',
                critValue: '8d8',
                critChance: 18,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Phoenix',
            description: 'Um martelo de guerra flamejante que pulsa com energia vital.\nPode gastar 10 PV para adicionar +15 de dano de fogo ao próximo ataque. Em crítico, causa explosão de fogo em 3m afetando todos os alvos (inclusive aliados) com 2d6 de dano. O portador ganha resistência a fogo por 1 minuto após cada ataque.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Martelo',
            effect: {
                value: '3d10',
                critValue: '6d10',
                critChance: 17,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Lágrimas de Ébano',
            description: 'Adagas sombrias que sugam a essência vital dos alvos.\nCausa 1d4 de dano de sombra adicional e cura o portador em metade do dano de sombra causado. Em crítico, o alvo sofre 2d4 de dano de sombra por turno por 3 turnos e o portador ganha visão no escuro por 5 minutos.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 2,
            bonus: 'Furtividade',
            accessories: [],
            weaponKind: 'Adagas Duplas',
            effect: {
                value: '2d6',
                critValue: '4d6',
                critChance: 19,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Nihil',
            description: 'Um arco longo feito de madeira petrificada e corda de energia estelar.\nFlechas não consomem munição e atravessam paredes finas. Pode gastar 5 MP para tornar a próxima flecha teletransportável (aparece a até 20m do alvo). Em crítico, o alvo é banido para um plano etéreo por 1 turno (invisível e intangível).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma de Longo Alcance (Leve)',
            range: 'Longo (30m)',
            weight: 2,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            accessories: [],
            weaponKind: 'Arco',
            effect: {
                value: '2d8',
                critValue: '6d8',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Mjonir',
            description: 'Um machado de batalha canalizador de raios.\nQuando chuvendo, causa o dobro de dano e ataques têm 50% de chance de acertar alvos adjacentes. Pode fazer chuver como ação livre por uma rodada gastando 10 MP. Em crítico, causa 2d6 de dano elétrico em todos os inimigos em 6m.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 4.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Machado',
            effect: {
                value: '3d8',
                critValue: '6d8',
                critChance: 16,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Hofund',
            description: 'Uma espada rúnica que absorve conhecimento dos combates.\nApós cada combate, ganha +1 de bônus permanente (máximo +10). Pode gastar 10 MP para copiar temporariamente uma habilidade do último inimigo derrotado por 1 minuto.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.5,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Espada',
            effect: {
                value: '2d8',
                critValue: '5d8',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Quasar',
            description: 'Um cetro que manipula a percepção da realidade.\nPode criar 2 ilusões de si mesmo por turno (gastando 8 MP). Ataques contra ilusões têm 50% de chance de revelar o atacante. Em crítico, o alvo fica confuso por 2 turnos (ataca alvos aleatórios, incluindo aliados).',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Arma de Haste',
            effect: {
                value: '2d6',
                critValue: '4d6',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Miasma',
            description: 'Uma lança infectada com parasitas mágicos.\nCausa 1d4 de dano de veneno adicional por turno por 3 turnos. O portador pode se infectar voluntariamente para ganhar +2 em Força e +5 de dano de ataque por 1 minuto (sofre 1d4 de dano). Em crítico, o alvo é infectado com praga que reduz seus atributos em -2 por 5 minutos.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Lança',
            effect: {
                value: '3d6',
                critValue: '6d6',
                critChance: 17,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Bioflame',
            description: 'Um lança chamas que contém um fogo vivo que persegue o seu alvo. (Você nunca erra um ataque com ele).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 8,
            hit: 'foc',
            ammo: 'Combustível',
            magazineSize: 5,
            quantity: 1,
            bonus: 'Magia',
            weaponKind: 'Arma de Fogo',
            effect: {
                value: '4d12',
                critValue: '8d12',
                critChance: 20,
                effectType: 'Fogo'
            }
        },
        {
            name: 'Canhão d\'água',
            description: 'Uma arma que atira mini-tsunamis. O alvo deve fazer um teste de RES Física (DT 15) para evitar ser empurrado. Se falhar, sofre 2d6 de dano de água e é empurrado para trás por 3 turnos.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Padrão (9m)',
            weight: 5,
            hit: 'des',
            ammo: 'Não consome',
            magazineSize: 3,
            quantity: 1,
            bonus: 'Pontaria',
            weaponKind: 'Arma de Fogo',
            effect: {
                value: '4d20',
                critValue: '8d20',
                critChance: 20,
                effectType: 'Água'
            }
        },
        {
            name: 'Biohammer',
            description: 'Um martelo que tem uma cabeça feita de material orgânico que pode se adaptar a diferentes formas e funções, como espinhos, garras ou tentáculos. (Você pode mudar a forma dele como ação livre. O Mestre deve usar a lógica para decidir o bônus de cada forma: Espinhos podem adicionar +1 dado do mesmo tipo, as garras podem ter 100% de chance de dar hemorragia em um alvo e os tentáculos podem agarrar oponentes durante 2 turnos, por exemplo).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 10,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Martelo',
            effect: {
                value: '5d20',
                critValue: '10d20',
                critChance: 17,
                effectType: 'Terra'
            }
        },
        {
            name: 'Freezegun',
            description: 'Uma arma que tem 100% de chance de congelamento ao atacar.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Padrão (9m)',
            weight: 5,
            hit: 'foc',
            ammo: 'Amplificador de partículas',
            quantity: 1,
            bonus: 'Magia',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 20,
                effectType: 'Água'
            }
        },
        {
            name: 'Railgun',
            description: 'Uma arma que espalha seu dano para todos os inimigos presentes no combate via eletricidade.',
            rarity: 'Mágico',
            kind: 'Automática',
            categ: 'Arma Mágica (Leve)',
            range: 'Padrão (9m)',
            weight: 5,
            hit: 'foc',
            ammo: 'Amplificador de partículas',
            quantity: 1,
            bonus: 'Magia',
            effect: {
                value: '1d100',
                critValue: '2d100',
                critChance: 20,
                effectType: 'Eletricidade'
            }
        },
        {
            name: 'Mega-marreta retrátil',
            description: 'Este é um martelo gigante e superpesado que consegue se reduzir a um tamanho de um bastão retrátil, apesar de não perder seu peso. Isto ajuda a levá-lo para qualquer lugar, além de poder sacá-lo como ação livre.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 12,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            weaponKind: 'Martelo',
            effect: {
                value: '5d20',
                critValue: '15d20',
                critChance: 19,
                effectType: 'Não-elemental'
            }
        },
        {
            name: 'Dreameater',
            description: 'Um livro que consegue invadir a mente das pessoas e fazê-las dormir e ter uma projeção de um sonho que você quiser. O alvo deve fazer um teste de RES Magia (DT 15) para evitar dormir e receber 4d6 de dano psíquico.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Longo (30m)',
            weight: 3,
            hit: 'foc',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            effect: {
                value: '10d6',
                critValue: '20d6',
                critChance: 20,
                effectType: 'Não-elemental'
            }
        },
        {
            name: 'Lança-ácido',
            description: 'Um lança-chamas só que de ácido que corrói tudo o que toca (pode atravessar qualquer estrutura ou obstáculo não-mágico (e até mesmo alguns mágicos)).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 8.5,
            hit: 'foc',
            ammo: 'Ácido',
            magazineSize: 1,
            quantity: 1,
            bonus: 'Magia',
            weaponKind: 'Arma de Fogo',
            effect: {
                value: '6d10',
                critValue: '12d10',
                critChance: 20,
                effectType: 'Não-elemental'
            }
        },
        {
            name: 'Sabre de luz',
            description: 'Uma espada de plasma que derrete tudo o que toca (penetra todos os obstáculos mágicos, diminuindo os AP do inimigo em -3)',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3,
            hit: 'foc',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            weaponKind: 'Espada',
            effect: {
                value: '6d12',
                critValue: '12d12',
                critChance: 17,
                effectType: 'Luz'
            }
        },
        {
            name: 'Soulreaver',
            description: 'Uma arma que devora a alma de todos que ataca. Cada ataque tem uma chance de 5% (20 em 1d20) de matar o alvo instantaneamente',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 4.5,
            hit: 'foc',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            weaponKind: 'Espada',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 19,
                effectType: 'Trevas'
            }
        },
        {
            name: 'Stasis',
            description: 'Uma foice que corta através do tempo e espaço.\nPode gastar 10 MP para atacar alvos em linha reta através de paredes e obstáculos. Em crítico, o alvo envelhece 10 anos instantaneamente e sofre -2 em todos os atributos por 5 minutos.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            accessories: [],
            weaponKind: 'Foice',
            effect: {
                value: '6d6',
                critValue: '12d6',
                critChance: 18,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Poseidon',
            description: 'Um cajado coralino que pulsa com energia dos oceanos.\nCria ondas de cura que restauram 1d8 PV para todos aliados em 5m a cada 2 turnos. Pode gastar 15 MP para criar tsunami que empurra todos inimigos em 10m e causa 2d8 de dano aquático.',
            rarity: 'Mágico',
            kind: 'Arremessável (18m)',
            categ: 'Arma Mágica (Leve)',
            range: 'Longo (30m)',
            weight: 2.5,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            accessories: [],
            weaponKind: 'Arma de Haste',
            effect: {
                value: '5d8',
                critValue: '10d8',
                critChance: 19,
                effectType: 'Água'
            }
        },
        {
            name: 'Gnosis',
            description: 'Uma arma que canaliza energia pura do caos.\nCada ataque tem 50% de chance de causar efeito aleatório: dano extra em área, teletransporte aleatório do alvo, ou transformação temporária em animal. Em crítico, causa todos os efeitos simultaneamente.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 6,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Arma de Haste',
            effect: {
                value: '3d10',
                critValue: '9d10',
                critChance: 16,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Arco de Éter',
            description: 'Um arco feito de luz estelar e corda de aurora.\nFlechas atravessam objetos e criaturas, atingindo todos alvos em linha reta. Pode gastar 5 MP para flecha se dividir em 3 projéteis que atingem alvos diferentes. Em crítico, cega todos alvos atingidos por 2 turnos.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Longo (30m)',
            weight: 1.8,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Pontaria',
            accessories: [],
            weaponKind: 'Arco',
            effect: {
                value: '6d8',
                critValue: '12d8',
                critChance: 20,
                effectType: 'Luz'
            }
        },
        {
            name: 'Vajra',
            description: 'Um martelo que manipula a gravidade ao seu redor.\nPode gastar 8 MP para criar campo de alta gravidade (5m): todos inimigos movem-se na metade da velocidade e sofrem -2 em ataques. Em crítico, alvo fica flutuando por 1 turno (indefeso).',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 8,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            accessories: [],
            weaponKind: 'Martelo',
            effect: {
                value: '4d8',
                critValue: '8d8',
                critChance: 17,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Japamala',
            description: 'Um par de adagas que atacam diretamente a mente.\nCausam 2d6 de dano mental adicional ignorando armadura. Pode gastar 5 MP para atacar mentalmente alvo à distância (15m) sem linha de visão. Em crítico, alvo sofre amnésia (esquece habilidades) por 3 turnos.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 1.2,
            hit: 'log',
            ammo: 'Não consome',
            quantity: 2,
            bonus: 'Agilidade',
            accessories: [],
            weaponKind: 'Adagas Duplas',
            effect: {
                value: '3d6',
                critValue: '6d6',
                critChance: 14,
                effectType: 'Psíquico'
            }
        },
        {
            name: 'Lança do Véu',
            description: 'Uma lança que perfura a barreira entre planos.\nPode atravessar criaturas etéreas e invisíveis normalmente. Pode gastar 15 MP para banir alvo para plano etéreo por 1 minuto. Em crítico, arrasta criatura de outro plano para lutar ao seu lado por 2 turnos.',
            rarity: 'Mágico',
            kind: 'Arremessável (18m)',
            categ: 'Arma Mágica (Média)',
            range: 'Corpo-a-corpo',
            weight: 4,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Lança',
            effect: {
                value: '5d8',
                critValue: '10d8',
                critChance: 18,
                effectType: 'Perfurante'
            }
        },
        {
            name: 'Escudo de Shanti',
            description: 'Um escudo-espelho que reflete ataques mágicos.\nBloqueia 50% de dano mágico e o reflete de volta no atacante. Pode gastar 05 MP para criar clone ilusório perfeito que distrai inimigos por 3 turnos. Em crítico, absorve uma magia inimiga e pode lançá-la gratuitamente.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.5,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            accessories: [],
            weaponKind: 'Escudo',
            effect: {
                value: '2d10',
                critValue: '6d10',
                critChance: 19,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Thanatos',
            description: 'Uma foice que ceifa a essência vital dos inimigos.\nCura o portador em metade do dano causado contra criaturas vivas. Pode gastar 5 MP para drenar 2d6 PV do alvo e transferir para aliado mais próximo. Em crítico, pode arrancar temporariamente uma habilidade do alvo por 1 minuto.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Foice',
            effect: {
                value: '8d6',
                critValue: '16d6',
                critChance: 17,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Nekros',
            description: 'Um cajado adornado com runas de convocação.\nPode gastar 10 MP para invocar elemental temporário (terra/fogo/água/ar) que luta ao seu lado por 2 minutos. Elemental tem 4d8 PV e causa 2d6 de dano elemental. Em crítico, invoca elemental adicional sem custo de mana.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Média)',
            range: 'Corpo-a-corpo',
            weight: 3,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            accessories: [],
            weaponKind: 'Arma de Haste',
            effect: {   
                value: '4d12',
                critValue: '8d12',
                critChance: 18,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Gjallahorn',
            description: 'Uma espada que funde o portador com essências predadoras.\nPode gastar 10 MP para transformar-se em besta elemental por 1 minuto: ganha +5 Força e Luta, garras (3d8+2), e movimento aumentado (+9m). Em crítico, transformação dura 1 minuto adicional sem custo extra.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.8,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Luta',
            accessories: [],
            weaponKind: 'Espada',
            effect: {
                value: '6d12',
                critValue: '12d12',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Ereshkigal',
            description: 'Um escudo que retalia automaticamente ataques recebidos.\nSempre que sofre dano de ataque corpo-a-corpo, causa 8d8 de dano perfurante no atacante automaticamente. Pode gastar 15 MP para criar campo de espinhos por 1 turno: todos inimigos adjacentes sofrem 2d4 de dano. Em crítico, retaliação causa dano duplo.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            accessories: [],
            weaponKind: 'Escudo',
            effect: {
                value: '1d8',
                critValue: '2d8',
                critChance: 20,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Aphrodite',
            description: 'Um instrumento musical (harpa) que encanta e controla mentes.\nPode tocar melodia (gastando 10 MP) que encanta todos inimigos em 8m: devem fazer teste de Sabedoria (DT 14) ou ficam encantados e não podem atacar por 2 turnos. Em crítico, pode dominar uma criatura humanóide por 1 minuto.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2,
            hit: 'sab',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            accessories: [],
            effect: {
                value: '5d4',
                critValue: '10d4',
                critChance: 19,
                effectType: 'Psíquico'
            }
        },
        {
            name: 'Aniatos',
            description: 'Uma lâmina escura que aplica feridas incuráveis que nunca cicatrizam completamente.\\nCausa 2d6 de dano de sangramento por turno que não pode ser removido por meios normais de cura. Apenas magia de restauração de nível 4 ou superior pode interromper o efeito. Em crítico, a ferida se torna permanente e o alvo perde 1 ponto máximo de PV.',
            rarity: 'Mágico',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.5,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            accessories: [],
            weaponKind: 'Espada',
            effect: {
                value: '4d8',
                critValue: '8d8',
                critChance: 19,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Tyrfing',
            description: 'Uma espada amaldiçoada nórdica que não pode ser embainhada sem matar.\\nConcede +2 de bônus de acerto e dano. Se sacada em combate, não pode ser guardada até que tenha matado uma criatura. Se o combate terminar e a espada não tiver "provado sangue", o usuário sofre 1d8 de dano por turno que ignora armadura até que a sede da lâmina seja saciada. A maldição pode ser temporariamente contornada gastando 10 MP por turno.',
            rarity: 'Amaldiçoado',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            accessories: [],
            weaponKind: 'Espada',
            effect: {
                value: '3d10+2',
                critValue: '6d10+4',
                critChance: 18,
                effectType: 'Cortante'
            }
        },
        {
            name: 'Martelo Antimaterial',
            description: 'Um martelo de metal escuro que parece distorcer a luz ao seu redor.\\nEm acertos críticos, em vez de dano extra, "colapsa" permanentemente a defesa do alvo. A armadura, escudo ou carapaça natural do alvo sofre -2 cumulativo na Defesa até ser magicamente reparada. O efeito se acumula indefinidamente. Pode gastar 15 MP para ativar o colapso em um acerto normal.',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Corpo-a-corpo',
            weight: 12,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            accessories: [],
            weaponKind: 'Martelo',
            effect: {
                value: '5d12',
                critValue: '10d12',
                critChance: 16,
                effectType: 'Impactante'
            }
        },
        {
            name: 'Felaris',
            description: 'Um rosário sagrado que acelera a repetição de mantras.\\nQuando o usuário gasta uma Ação para Canalizar Mantra, ganha 2 Níveis de Mantra em vez de 1. Permite armazenar até 10 Níveis extras para uso posterior. Como Ação Bônus, pode liberar todos os Níveis acumulados instantaneamente.',
            rarity: 'Lendário',
            kind: 'Padrão',
            categ: 'Arma Mágica (Foco)',
            range: 'Corpo-a-corpo',
            weight: 0.5,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            accessories: [],
            weaponKind: 'Arma de Concussão',
            effect: {
                value: '1d4',
                critValue: '2d4',
                critChance: 15,
                effectType: 'Psíquico'
            }
        },
        {
            name: 'Manlok',
            description: 'A arma ritual do símbolo do poder do mantra.\\nPermite armazenar até 10 Níveis de Mantra na arma. Como Ação, pode canalizar e adicionar 1 Nível. Como Reação, pode gastar 1 Nível para anular magia inimiga ou liberar explosão de raio defensiva (3d6) quando atingido. A arma brilha com intensidade proporcional aos Níveis armazenados.',
            rarity: 'Lendário',
            kind: 'Padrão',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 2.8,
            hit: 'des',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Agilidade',
            accessories: [],
            weaponKind: 'Machado',
            effect: {
                value: '4d8',
                critValue: '8d8',
                critChance: 18,
                effectType: 'Eletricidade'
            }
        }
    ]
}

export const defaultWeapon = {
    name: '',
    description: '',
    rarity: 'Comum',
    weight: 0,
    quantity: 1,
    range: '',
    categ: '',
    hit: '',
    bonus: '',
    kind: 'Padrão',
    ammo: 'Não consome',
    accessories: [ 'Não possui acessórios' ],
    effect: {
        value: '',
        effectType: '',
        critChance: 20,
        critValue: ''
    }
}
