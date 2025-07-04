import { red, blue, orange, teal, deepPurple, green } from '@node_modules/@mui/material/colors';
import type { Classes, Expertises, Ficha, Gender, Lineage, Race, Element, FinancialCondition } from '@types';

export const expertisesDefaultValue: () => Expertises = () => ({
    'Agilidade': { value: 0, defaultAttribute: 'des' },
    'Argumentação': { value: 0, defaultAttribute: 'sab' },
    'Atletismo': { value: 0, defaultAttribute: 'vig' },
    'Competência': { value: 0, defaultAttribute: 'log' },
    'Comunicação': { value: 0, defaultAttribute: 'car' },
    'Condução': { value: 0, defaultAttribute: 'des' },
    'Conhecimento': { value: 0, defaultAttribute: 'sab' },
    'Controle': { value: 0, defaultAttribute: 'vig' },
    'Criatividade': { value: 0, defaultAttribute: 'log' },
    'Enganação': { value: 0, defaultAttribute: 'car' },
    'Furtividade': { value: 0, defaultAttribute: 'des' },
    'Intimidação': { value: 0, defaultAttribute: 'car' },
    'Intuição': { value: 0, defaultAttribute: 'log' },
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
    'RES Mental': { value: 0, defaultAttribute: 'log' },
    'Sorte': { value: 0, defaultAttribute: 'sab' },
    'Sobrevivência': { value: 0, defaultAttribute: 'sab' },
    'Tecnologia': { value: 0, defaultAttribute: 'log' },
    'Vontade': { value: 0, defaultAttribute: 'foc' }
})

export const fichaModel: Ficha = {
    playerName: '',
    mode: 'Classic',
    name: '',
    age: 0,
    class: '' as Classes,
    race: '' as unknown as Race,
    lineage: '' as unknown as Lineage,
    elementalMastery: '' as unknown as Element,
    gender: '' as Gender,
    financialCondition: '' as unknown as FinancialCondition,
    traits: [],
    displacement: 9,
    level: 0,
    anotacoes: '',
    ORMLevel: 1,
    magics: [],
    magicsSpace: 1,
    subclass: '',
    maxLp: 0,
    maxMp: 0,
    maxAp: 0,
    ammoCounter: {
        current: 0,
        max: 0
    },
    skills: {
        lineage: [],
        bonus: [],
        class: [],
        powers: [],
        subclass: []
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
                effects: [ 'Celular multiúso da UFEM.' ]
            },
            {
                name: 'ORM',
                description: 'Um ORM pode ser qualquer coisa desde que esteja embutido com um Zeptachip. Este dispositivo é necessário para manipular qualquer forma de magia.',
                kind: 'Especial',
                rarity: 'Especial',
                level: 1,
                weight: 0.1,
                effects: [ 'Dispositivo utilizado para manipulação de magículas e sequências mágicas.' ]
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
                }
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
                displacementPenalty: 0
            }
        ],
        money: 0
    },

    expertises: expertisesDefaultValue(),

    points: {
        attributes: 5,
        expertises: 0,
        diligence: 0,
        skills: 0,
        magics: 1
    },

    attributes: {
        lp: 0,
        ap: 5,
        car: 0,
        vig: 0,
        des: 0,
        foc: 0,
        log: 0,
        sab: 0,
        mp: 0
    },
    userId: '',
    status: []
}

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