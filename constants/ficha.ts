import type { Classes, Ficha, Gender } from '@types';

export const fichaModel: Partial<Ficha> = {
    playerName: '',
    name: '',
    age: 0,
    class: '' as Classes,
    race: '',
    lineage: '',
    elementalMastery: undefined,
    gender: '' as Gender,
    financialCondition: undefined,
    traits: [],
    capacity: 5,
    displacement: 9,
    level: 0,
    magics: [],
    subclass: '',
    skills: {
        lineage: [],
        bonus: [],
        class: [],
        subclass: []
    },

    inventory: {
        items: [],
        weapons: [],
        armors: [],
        money: 0
    },
    expertises: {
        'Atletismo': {
            value: 0,
            defaultAttribute: 'vig'
        },
        'RES Física': {
            value: 0,
            defaultAttribute: 'vig'
        },
        'RES Mental': {
            value: 0,
            defaultAttribute: 'log'
        },
        'RES Mágica': {
            value: 0,
            defaultAttribute: 'foc'
        },
        'Crime': {
            value: 0,
            defaultAttribute: 'des'
        },
        'Agilidade': {
            value: 0,
            defaultAttribute: 'des'
        },
        'Sobrevivência': {
            value: 0,
            defaultAttribute: 'sab'
        },
        'Competência': {
            value: 0,
            defaultAttribute: 'log'
        },
        'Luta': {
            value: 0,
            defaultAttribute: 'vig'
        },
        'Conhecimento': {
            value: 0,
            defaultAttribute: 'sab'
        },
        'Criatividade': {
            value: 0,
            defaultAttribute: 'log'
        },
        'Furtividade': {
            value: 0,
            defaultAttribute: 'des'
        },
        'Pontaria': {
            value: 0,
            defaultAttribute: 'des'
        },
        'Reflexos': {
            value: 0,
            defaultAttribute: 'foc'
        },
        'Controle': {
            value: 0,
            defaultAttribute: 'foc'
        },
        'Condução': {
            value: 0,
            defaultAttribute: 'des'
        },
        'Sorte': {
            value: 0,
            defaultAttribute: 'sab'
        },
        'Enganação': {
            value: 0,
            defaultAttribute: 'car'
        },
        'Tecnologia': {
            value: 0,
            defaultAttribute: 'log'
        },
        'Magia': {
            value: 0,
            defaultAttribute: 'foc'
        },
        'Medicina': {
            value: 0,
            defaultAttribute: 'sab'
        },
        'Percepção': {
            value: 0,
            defaultAttribute: 'foc'
        },
        'Intuição': {
            value: 0,
            defaultAttribute: 'log'
        },
        'Investigação': {
            value: 0,
            defaultAttribute: 'log'
        },
        'Argumentação': {
            value: 0,
            defaultAttribute: 'sab'
        },
        'Intimidação': {
            value: 0,
            defaultAttribute: 'car'
        },
        'Persuasão': {
            value: 0,
            defaultAttribute: 'car'
        },
        'Comunicação': {
            value: 0,
            defaultAttribute: 'car'
        },
        'Liderança': {
            value: 0,
            defaultAttribute: 'car'
        }
    },
    
    points: {
        attributes: 9,
        expertises: 0,
        diligence: 0,
        skills: 0,
        magics: 0  
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
    }
}