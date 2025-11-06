import { red, blue, orange, teal, deepPurple, green } from '@mui/material/colors';
import generateEntryCode from '@utils/generateEntryCode';
import { type Expertises, type Race } from '@models';
import { type Charsheet } from '@models/entities';
import type { FinancialCondition, Gender, SubclassNames, ClassNames, LineageNames } from '@models/types/string';
import { CharsheetDTO } from '@models/dtos';

export const expertisesDefaultValue: Expertises = {
    'Agilidade': { value: 0, defaultAttribute: 'des' },
    'Atletismo': { value: 0, defaultAttribute: 'vig' },
    'Competência': { value: 0, defaultAttribute: 'log' },
    'Comunicação': { value: 0, defaultAttribute: 'car' },
    'Condução': { value: 0, defaultAttribute: 'des' },
    'Conhecimento': { value: 0, defaultAttribute: 'sab' },
    'Controle': { value: 0, defaultAttribute: 'vig' },
    'Criatividade': { value: 0, defaultAttribute: 'log' },
    'Culinária': { value: 0, defaultAttribute: 'des' },
    'Diplomacia': { value: 0, defaultAttribute: 'car' },
    'Eficácia': { value: 0, defaultAttribute: null },
    'Enganação': { value: 0, defaultAttribute: 'car' },
    'Engenharia': { value: 0, defaultAttribute: 'log' },
    'Fortitude': { value: 0, defaultAttribute: null },
    'Força': { value: 0, defaultAttribute: 'vig' },
    'Furtividade': { value: 0, defaultAttribute: 'des' },
    'Intimidação': { value: 0, defaultAttribute: 'car' },
    'Intuição': { value: 0, defaultAttribute: 'sab' },
    'Interrogação': { value: 0, defaultAttribute: 'car' },
    'Investigação': { value: 0, defaultAttribute: 'log' },
    'Ladinagem': { value: 0, defaultAttribute: 'des' },
    'Liderança': { value: 0, defaultAttribute: 'car' },
    'Luta': { value: 0, defaultAttribute: 'vig' },
    'Magia': { value: 0, defaultAttribute: 'foc' },
    'Medicina': { value: 0, defaultAttribute: 'sab' },
    'Percepção': { value: 0, defaultAttribute: 'foc' },
    'Persuasão': { value: 0, defaultAttribute: 'car' },
    'Pontaria': { value: 0, defaultAttribute: 'des' },
    'Reflexos': { value: 0, defaultAttribute: 'foc' },
    'RES Física': { value: 0, defaultAttribute: 'vig' },
    'RES Mágica': { value: 0, defaultAttribute: 'foc' },
    'RES Mental': { value: 0, defaultAttribute: 'sab' },
    'Sorte': { value: 0, defaultAttribute: 'sab' },
    'Sobrevivência': { value: 0, defaultAttribute: 'sab' },
    'Tática': { value: 0, defaultAttribute: 'log' },
    'Tecnologia': { value: 0, defaultAttribute: 'log' },
    'Vontade': { value: 0, defaultAttribute: 'foc' }
}

export const charsheet: CharsheetDTO = {
    id: '',
    playerName: '',
    mode: 'Classic',
    name: '',
    age: 0,
    class: '' as ClassNames,
    race: '' as Race['name'],
    lineage: '' as LineageNames,
    elementalMastery: '',
    gender: '' as Gender,
    financialCondition: '' as FinancialCondition,
    traits: [],
    displacement: 9,
    level: 0,
    anotacoes: '',
    createdAt: new Date().toISOString(),
    ORMLevel: 1,
    spells: [],
    spellSpace: 1,
    mpLimit: 0,
    overall: 0,
    subclass: '' as SubclassNames,
    ammoCounter: {
        current: 0,
        max: 0
    },
    skills: {
        lineage: [],
        bonus: [],
        class: [],
        powers: [],
        subclass: [],
        race: []
    },

    capacity: {
        cargo: 1.0,
        max: 5.0
    },

    inventory: {
        items: [
            {
                name: 'Celular',
                description: 'Celular institucional dado a todos estudantes da UFEM.',
                kind: 'Especial',
                rarity: 'Comum',
                weight: 0.2,
                effects: [ 'Celular multiúso da UFEM.' ],
                type: 'item',
                quantity: 1,
                id: `smartphone-${generateEntryCode(12, 'lower')}`
            },
            {
                name: 'ORM',
                description: 'Um ORM pode ser qualquer coisa desde que esteja embutido com um Zeptachip. Este dispositivo é necessário para manipular qualquer forma de magia.',
                kind: 'Especial',
                rarity: 'Especial',
                level: 1,
                weight: 0.1,
                effects: [ 'Dispositivo utilizado para manipulação de magículas e sequências mágicas.' ],
                type: 'item',
                quantity: 1,
                id: `orm-${generateEntryCode(12, 'lower')}`
            }
        ],
        weapons: [
            {
                name: 'Bastão Retrátil',
                description: 'Um bastão retrátil dado a estudantes da UFEM como arma de defesa pessoal.',
                categ: 'Arma Branca (Leve)',
                range: 'Corpo-a-corpo',
                kind: 'Padrão',
                rarity: 'Comum',
                weight: 0.2,
                hit: 'des',
                ammo: 'Não consome',
                bonus: 'Agilidade',
                effect: {
                    value: '2d6',
                    critValue: '4d6',
                    critChance: 20,
                    effectType: 'Impactante'
                },
                type: 'weapon',
                accessories: [],
                id: `retrogradable_staff-${generateEntryCode(12, 'lower')}`,
                quantity: 1
            }
        ],
        armors: [
            {
                name: 'Uniforme da UFEM',
                description: 'Um uniforme escolar dado a todos estudantes da UFEM para identificação e segurança na instalação.',
                categ: 'Leve',
                kind: 'Padrão',
                rarity: 'Comum',
                weight: 0.5,
                value: 5,
                displacementPenalty: 0,
                type: 'weapon',
                accessories: [],
                id: `uniform-${generateEntryCode(12, 'lower')}`,
                quantity: 1
            }
        ],
        money: 0
    },

    expertises: expertisesDefaultValue,

    points: {
        attributes: 25,
        expertises: 0,
        skills: 0,
        magics: 1
    },

    attributes: {
        car: 0,
        vig: 0,
        des: 0,
        foc: 0,
        log: 0,
        sab: 0
    },
    stats: {
        lp: 0,
        mp: 0,
        ap: 5,
        maxLp: 0,
        maxMp: 0,
        maxAp: 5
    },
    mods: {
        attributes: {
            des: 0,
            vig: 0,
            log: 0,
            sab: 0,
            foc: 0,
            car: 0
        },
        discount: -10
    },
    dices: [],
    passives: [], 
    userId: '',
    status: [],
    session: []
}

export const charsheetModel = new CharsheetDTO(charsheet)

export const attributeIcons = {
    vig: {
        color: red[500],
        icon: 'health',
        filter: 'invert(32%) sepia(55%) saturate(3060%) hue-rotate(343deg) brightness(99%) contrast(93%)'
    },
    foc: {
        color: blue[500],
        icon: 'potion',
        filter: 'invert(42%) sepia(99%) saturate(584%) hue-rotate(169deg) brightness(101%) contrast(99%)'
    },
    des: {
        color: orange[500],
        icon: 'shield',
        filter: 'invert(57%) sepia(63%) saturate(723%) hue-rotate(357deg) brightness(99%) contrast(107%)'
    },
    log: {
        color: teal[500],
        icon: 'book',
        filter: 'invert(53%) sepia(48%) saturate(7320%) hue-rotate(150deg) brightness(89%) contrast(101%)'
    },
    sab: {
        color: deepPurple[500],
        icon: 'pawprint',
        filter: 'invert(19%) sepia(90%) saturate(2394%) hue-rotate(253deg) brightness(90%) contrast(84%)'
    },
    car: {
        color: green[500],
        icon: 'aura',
        filter: 'invert(60%) sepia(41%) saturate(642%) hue-rotate(73deg) brightness(91%) contrast(85%)'
    }
} as const;