import type { Weapon } from '@types'

export const deafultWeapons: Record<'melee' | 'ranged' | 'magic' | 'ballistic' | 'energy' | 'special', Weapon[]> = {
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
            rarity: 'Comum',
            kind: 'Duas mãos',
            categ: 'Arma Especial (Pesada)',
            range: 'Ampliado (90m)',
            weight: 30,
            hit: 'log',
            ammo: 'Bateria de Cádmio com Óxido de Grafeno',
            magazineSize: 3,
            quantity: 1,
            bonus: 'Tecnologia',
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
            name: 'Bioflame',
            description: '',
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
            effect: {
                value: '4d12',
                critValue: '8d12',
                critChance: 20,
                effectType: 'Fogo'
            }
        },
        {
            name: 'Canhão d\'água',
            description: '',
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
            effect: {
                value: '4d20',
                critValue: '8d20',
                critChance: 20,
                effectType: 'Água'
            }
        },
        {
            name: 'Biohammer',
            description: '',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 10,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            effect: {
                value: '5d20',
                critValue: '10d20',
                critChance: 17,
                effectType: 'Terra'
            }
        },
        {
            name: 'Freezegun',
            description: '',
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
            description: '',
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
            description: '',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Pesada)',
            range: 'Curto (3m)',
            weight: 12,
            hit: 'vig',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Força',
            effect: {
                value: '5d20',
                critValue: '15d20/19.5',
                critChance: 19,
                effectType: 'Não-elemental'
            }
        },
        {
            name: 'Dreameater',
            description: '',
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
            description: '',
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
            effect: {
                value: '6d10',
                critValue: '12d10',
                critChance: 20,
                effectType: 'Não-elemental'
            }
        },
        {
            name: 'Sabre de luz',
            description: '',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 3,
            hit: 'foc',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            effect: {
                value: '6d12',
                critValue: '12d12',
                critChance: 17,
                effectType: 'Luz'
            }
        },
        {
            name: 'Soulreaver',
            description: '',
            rarity: 'Mágico',
            kind: 'Duas mãos',
            categ: 'Arma Mágica (Leve)',
            range: 'Corpo-a-corpo',
            weight: 4.5,
            hit: 'foc',
            ammo: 'Não consome',
            quantity: 1,
            bonus: 'Magia',
            effect: {
                value: '2d20',
                critValue: '4d20',
                critChance: 19,
                effectType: 'Trevas'
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
