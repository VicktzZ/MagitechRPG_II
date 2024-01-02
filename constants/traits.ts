import type { Trait } from '@types';

export const traits: Trait[] = [
    {
        name: 'Saúde de Ferro',
        description: 'você se recupera rapidamente de ferimentos, doenças ou efeitos nocivos. Você pode curar uma quantidade de pontos de vida igual ao seu VIG por hora, e tem vantagem em testes de resistência contra venenos, doenças ou efeitos similares.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'VIG'
        }
    },

    {
        name: 'Reflexos de Gato',
        description: 'você tem reflexos tão rápidos que pode reagir a situações perigosas ou inesperadas. Você tem vantagem em testes de iniciativa, e pode se esquivar de ataques surpresa, armadilhas ou efeitos que exijam um teste de DES para evitar.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'DES'
        }
    },

    {
        name: 'Foco Absoluto',
        description: 'você tem uma experiência vasta, que te permite sobreviver, se adaptar ou se aprimorar em situações adversas. Você tem vantagem em testes de sobrevivência, e pode usar um ponto de sabedoria para obter uma vantagem, uma oportunidade ou uma melhoria em algo.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'FOC'
        }
    },

    {
        name: 'Genial',
        description: 'você tem uma inteligência superior, que te permite resolver problemas, aprender e otimizar. Você tem vantagem em testes de lógica, e pode usar um número de pontos de lógica por dia igual ao seu LOG para obter um sucesso automático em qualquer teste que envolva inteligência.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'LOG'
        }
    },

    {
        name: 'Veterano',
        description: 'Você tem uma experiência vasta, que te permite sobreviver, se adaptar ou se aprimorar em situações adversas. Você tem vantagem em testes de sobrevivência, e pode usar um ponto de sabedoria para obter uma vantagem, uma oportunidade ou uma melhoria em algo.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'SAB'
        }
    },

    {
        name: 'Lider',
        description: 'Você tem uma capacidade de influenciar, motivar ou inspirar outras pessoas, seja por meio de ordens, conselhos, exemplos, etc. Você tem vantagem em testes de liderança, e pode usar um ponto de carisma para obter uma ajuda, uma lealdade ou uma admiração de alguém.',
        value: 1,
        target: {
            kind: 'attribute',
            name: 'CAR'
        }
    },

    {
        name: 'Perspicaz',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Percepção'
        }
    },

    {
        name: 'Valente',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'RES Mental'
        }
    },

    {
        name: 'Concentrado',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Reflexos'
        }
    },

    {
        name: 'Perfeccionista',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Competência'
        }
    },

    {
        name: 'Moderado',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Controle'
        }
    },

    {
        name: 'Diligente',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Sobrevivência'
        }
    },

    {
        name: 'Atraente',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Enganação'
        }
    },

    {
        name: 'Sagaz',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Conhecimento'
        }
    },
    
    {
        name: 'Oportunista',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Sorte'
        }
    },
    
    {
        name: 'Eloquênte',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Liderança'
        }
    },

    {
        name: 'Hipertrofia',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Luta'
        }
    },

    {
        name: 'Racional',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Intuição'
        }
    },

    {
        name: 'Observador',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Investigação'
        }
    },

    {
        name: 'Preciso',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Pontaria'
        }
    },

    {
        name: 'Engenhoso',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Criatividade'
        }
    },

    {
        name: 'Fugaz',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Agilidade'
        }
    },

    {
        name: 'Diplomata',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Comunicação'
        }
    },

    {
        name: 'Destapado',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Furtividade'
        }
    },

    {
        name: 'Robusto',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'RES Física'
        }
    },

    {
        name: 'Sarado',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Atletismo'
        }
    },

    {
        name: 'Convincente',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Persuasão'
        }
    },

    {
        name: 'Metódico',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Medicina'
        }
    },

    {
        name: 'Eficiente',
        description: '',
        value: 3,
        target: {
            kind: 'expertise',
            name: 'Tecnologia'
        }
    }
]

export default traits