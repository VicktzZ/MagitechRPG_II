import type { Classes, Ficha, Gender, Lineage, Race } from '@types';

export const fichaModel: Partial<Ficha> = {
    playerName: '',
    name: '',
    age: 0,
    class: '' as Classes,
    race: '' as unknown as Race,
    lineage: '' as unknown as Lineage,
    elementalMastery: undefined,
    gender: '' as Gender,
    financialCondition: undefined,
    traits: [],
    displacement: 9,
    level: 0,
    magics: [],
    magicsSpace: 0,
    subclass: '',
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
                weight: 0.2,
                effects: [ 'Celular multiúso da UFEM.' ]
            },
            {
                name: 'ORM',
                description: 'Um ORM pode ser qualquer coisa desde que esteja embutido com um Zeptachip. Este dispositivo é necessário para manipular qualquer forma de magia.',
                kind: 'Especial',
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
                weight: 0.2,
                hit: 'des',
                ammo: 'Não consome',
                bonus: 'Agilidade',
                effect: {
                    value: '2d6',
                    critValue: '4d6',
                    critChance: 20,
                    kind: 'damage',
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
                weight: 0.5,
                value: 5,
                displacementPenalty:0
            }
        ],
        money: 0
    },
    
    expertises: {
        'Agilidade': { value: 0, defaultAttribute: 'des' },
        'Argumentação': { value: 0, defaultAttribute: 'sab' },
        'Atletismo': { value: 0, defaultAttribute: 'vig' },
        'Competência': { value: 0, defaultAttribute: 'log' },
        'Comunicação': { value: 0, defaultAttribute: 'car' },
        'Condução': { value: 0, defaultAttribute: 'des' },
        'Conhecimento': { value: 0, defaultAttribute: 'sab' },
        'Controle': { value: 0, defaultAttribute: 'foc' },
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
    },
    
    points: {
        attributes: 8,
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
    }
}