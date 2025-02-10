/* eslint-disable max-len */
import type { Trait } from '@types';

export const positiveTraits: Trait[] = [
    {
        name: 'Saúde de Ferro',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'VIG'
        }
    },

    {
        name: 'Reflexos de Gato',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'DES'
        }
    },

    {
        name: 'Foco Absoluto',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'FOC'
        }
    },

    {
        name: 'Genial',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'LOG'
        }
    },

    {
        name: 'Veterano',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'SAB'
        }
    },

    {
        name: 'Lider',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'CAR'
        }
    },

    {
        name: 'Perspicaz',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Percepção'
        }
    },

    {
        name: 'Valente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'RES Mental'
        }
    },

    {
        name: 'Concentrado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Reflexos'
        }
    },

    {
        name: 'Perfeccionista',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Competência'
        }
    },

    {
        name: 'Moderado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Controle'
        }
    },

    {
        name: 'Diligente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Sobrevivência'
        }
    },

    {
        name: 'Atraente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Enganação'
        }
    },

    {
        name: 'Sagaz',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Conhecimento'
        }
    },
    
    {
        name: 'Oportunista',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Sorte'
        }
    },
    
    {
        name: 'Eloquente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Liderança'
        }
    },

    {
        name: 'Hipertrofia',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Luta'
        }
    },

    {
        name: 'Racional',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Intuição'
        }
    },

    {
        name: 'Observador',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Investigação'
        }
    },

    {
        name: 'Preciso',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Pontaria'
        }
    },

    {
        name: 'Engenhoso',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Criatividade'
        }
    },

    {
        name: 'Fugaz',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Agilidade'
        }
    },

    {
        name: 'Diplomata',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Comunicação'
        }
    },

    {
        name: 'Destapado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Furtividade'
        }
    },

    {
        name: 'Robusto',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'RES Física'
        }
    },

    {
        name: 'Sarado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Atletismo'
        }
    },

    {
        name: 'Convincente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Persuasão'
        }
    },

    {
        name: 'Metódico',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Medicina'
        }
    },

    {
        name: 'Eficiente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Tecnologia'
        }
    }
]

export const negativeTraits: Trait[] = [
    {
        name: 'Saúde Frágil',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'VIG'
        }
    },

    {
        name: 'Desajeitado',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'DES'
        }
    },

    {
        name: 'Distraído',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'FOC'
        }
    },

    {
        name: 'Confuso',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'LOG'
        }
    },

    {
        name: 'Inexperiente',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'SAB'
        }
    },

    {
        name: 'Antissocial',
        value: -1,
        target: {
            kind: 'attribute',
            name: 'CAR'
        }
    },

    {
        name: 'Desatento',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Percepção'
        }
    },

    {
        name: 'Medroso',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'RES Mental'
        }
    },

    {
        name: 'Lento',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Reflexos'
        }
    },

    {
        name: 'Preguiçoso',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Sobrevivência'
        }
    },

    {
        name: 'Improdutivo',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Criatividade'
        }
    },

    {
        name: 'Tapado',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Competência'
        }
    },

    {
        name: 'Teimoso',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Argumentação'
        }
    },

    {
        name: 'Instável',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Controle'
        }
    },

    {
        name: 'Ignorante',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Conhecimento'
        }
    },

    {
        name: 'Moroso',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Atletismo'
        }
    },

    {
        name: 'Barulhento',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Furtividade'
        }
    },

    {
        name: 'Reservado',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Comunicação'
        }
    },

    {
        name: 'Fraco',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Luta'
        }
    },

    {
        name: 'Frágil',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'RES Física'
        }
    },

    {
        name: 'Ingênuo',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Enganação'
        }
    },

    {
        name: 'Azarado',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Sorte'
        }
    },

    {
        name: 'Impulsivo',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Intuição'
        }
    },

    {
        name: 'Impreciso',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Pontaria'
        }
    },

    {
        name: 'Descuidado',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Investigação'
        }
    },

    {
        name: 'Lerdo',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Agilidade'
        }
    },

    {
        name: 'Desconexo',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Persuasão'
        }
    },

    {
        name: 'Imprudente',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Medicina'
        }
    },

    {
        name: 'Desinformado',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Tecnologia'
        }
    },

    {
        name: 'Apático',
        value: -3,
        target: {
            kind: 'expertise',
            name: 'Liderança'
        }
    }
]
