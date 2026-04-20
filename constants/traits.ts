/* eslint-disable max-len */
import type{ Trait } from '@models'

// TODO: Deixar disponível apenas traços que alteram perícias
export const positiveTraits: Trait[] = [
    {
        name: 'Hipertrofiado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Força'
        }
    },

    {
        name: 'Genial',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Engenharia'
        }
    },

    {
        name: 'Piloto',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Condução'
        }
    },

    {
        name: 'Cozinheiro',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Culinária'
        }
    },
    {
        name: 'Assertivo',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Diplomacia'
        }
    },
    {
        name: 'Pragmático',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Eficácia'
        }
    },
    {
        name: 'Inabalável',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Fortitude'
        }
    },
    
    {
        name: 'Ameaçador',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Intimidação'
        }
    },
    
    {
        name: 'Inclemente',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Interrogação'
        }
    },

    {
        name: 'Cleptomaníaco',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Ladinagem'
        }
    },

    {
        name: 'Estratégico',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Tática'
        }
    },

    {
        name: 'Determinado',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Vontade'
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
        name: 'Hipotrofiado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Força'
        }
    },

    {
        name: 'Confuso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Engenharia'
        }
    },

    {
        name: 'Desgovernado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Condução'
        }
    },

    {
        name: 'Contraditório',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Diplomacia'
        }
    },

    {
        name: 'Indeciso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Eficácia'
        }
    },

    {
        name: 'Vulnerável',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Fortitude'
        }
    },

    {
        name: 'Inofensivo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Intimidação'
        }
    },
    
    {
        name: 'Desastrado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Ladinagem'
        }
    },

    {
        name: 'Afobado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Tática'
        }
    },
    
    {
        name: 'Hesitante',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Vontade'
        }
    },

    {
        name: 'Desatento',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Percepção'
        }
    },

    {
        name: 'Medroso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'RES Mental'
        }
    },

    {
        name: 'Lento',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Reflexos'
        }
    },

    {
        name: 'Sedentário',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Sobrevivência'
        }
    },

    {
        name: 'Improdutivo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Criatividade'
        }
    },

    {
        name: 'Tapado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Competência'
        }
    },

    {
        name: 'Teimoso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Diplomacia'
        }
    },

    {
        name: 'Instável',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Controle'
        }
    },

    {
        name: 'Ignorante',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Conhecimento'
        }
    },

    {
        name: 'Preguiçoso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Atletismo'
        }
    },

    {
        name: 'Barulhento',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Furtividade'
        }
    },

    {
        name: 'Reservado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Comunicação'
        }
    },

    {
        name: 'Fraco',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Luta'
        }
    },

    {
        name: 'Frágil',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'RES Física'
        }
    },

    {
        name: 'Ingênuo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Enganação'
        }
    },

    {
        name: 'Azarado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Sorte'
        }
    },

    {
        name: 'Impulsivo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Intuição'
        }
    },

    {
        name: 'Impreciso',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Pontaria'
        }
    },

    {
        name: 'Descuidado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Investigação'
        }
    },

    {
        name: 'Lerdo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Agilidade'
        }
    },

    {
        name: 'Desconexo',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Persuasão'
        }
    },

    {
        name: 'Imprudente',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Medicina'
        }
    },

    {
        name: 'Desinformado',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Tecnologia'
        }
    },

    {
        name: 'Apático',
        value: -2,
        target: {
            kind: 'expertise',
            name: 'Liderança'
        }
    }
]
