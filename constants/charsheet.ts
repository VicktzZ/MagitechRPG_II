import { classMark, color } from '@themes/tokens';
import generateEntryCode from '@utils/generateEntryCode';
import { type Expertises, type Race } from '@models';
import type { FinancialCondition, Gender, SubclassNames, ClassNames, LineageNames } from '@models/types/string';
import { CharsheetDTO } from '@models/dtos';

export const expertisesDefaultValue: Expertises = {
    'Agilidade': { value: 0, defaultAttribute: 'des' },
    'Atletismo': { value: 0, defaultAttribute: 'vig' },
    'Competência': { value: 0, defaultAttribute: 'log' },
    'Comunicação': { value: 0, defaultAttribute: 'car' },
    'Condução': { value: 0, defaultAttribute: 'des' },
    'Conhecimento': { value: 0, defaultAttribute: 'sab' },
    'Concentração': { value: 0, defaultAttribute: 'foc' },
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

// Cores pelo papel (vida, mana, alerta, sucesso) e pela paleta das classes (Lógica e Sabedoria).
// O `filter` pinta o ícone preto de `RPGIcon` com a mesma cor de `color`; ao trocar uma, refaça a outra.
export const attributeIcons = {
    vig: {
        color: color.lp,
        icon: 'health',
        filter: 'invert(41%) sepia(39%) saturate(1355%) hue-rotate(320deg) brightness(105%) contrast(76%)'
    },
    foc: {
        color: color.mp,
        icon: 'potion',
        filter: 'invert(61%) sepia(69%) saturate(563%) hue-rotate(165deg) brightness(92%) contrast(96%)'
    },
    des: {
        color: color.warning,
        icon: 'shield',
        filter: 'invert(77%) sepia(41%) saturate(6226%) hue-rotate(337deg) brightness(94%) contrast(86%)'
    },
    log: {
        color: classMark.Feiticeiro,
        icon: 'book',
        filter: 'invert(64%) sepia(14%) saturate(5680%) hue-rotate(129deg) brightness(85%) contrast(70%)'
    },
    sab: {
        color: classMark.Bruxo,
        icon: 'pawprint',
        filter: 'invert(52%) sepia(81%) saturate(1027%) hue-rotate(219deg) brightness(87%) contrast(82%)'
    },
    car: {
        color: color.success,
        icon: 'aura',
        filter: 'invert(69%) sepia(9%) saturate(1675%) hue-rotate(91deg) brightness(91%) contrast(91%)'
    }
} as const;