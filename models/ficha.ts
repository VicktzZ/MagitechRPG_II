import { Schema, model, models } from 'mongoose';

const fichaSchema = new Schema({
    playerName: {
        type: String,
        required: [ true, 'Player name is required!' ]
    },
    name: {
        type: String,
        required: [ true, 'Name is required!' ]
    },
    age: {
        type: Number,
        required: [ true, 'Age is required!' ]
    },
    class: {
        type: String,
        required: [ true, 'Class is required!' ]
    },
    capacity: {
        type: Number,
        required: [ true, 'Capacity is required!' ],
        default: 5
    },
    race: {
        type: String,
        required: [ true, 'Race is required!' ]
    },
    displacement: {
        type: Number,
        required: [ true, 'Displacement is required!' ],
        default: 9
    },
    lineage: {
        type: String,
        required: [ true, 'Lineage is required!' ]
    },
    inventory: {
        type: Object,
        required: [ true, 'Inventory is required!' ],
        default: {
            money: 0,
            items: [
                {
                    name: 'Celular',
                    description: 'Celular institucional dado a todos estudantes da UFEM.',
                    kind: 'Especial',
                    weight: 0.2
                },
                {
                    name: 'ORM',
                    description: 'Um ORM pode ser qualquer coisa desde que esteja embutido com um Zeptachip. Este dispositivo é necessário para manipular qualquer forma de magia.',
                    kind: 'Especial',
                    level: 1,
                    weight: 0.1
                }
            ],
            weapons: [
                {
                    name: 'Bastão Retrátil',
                    description: 'Um bastão retrátil dado a estudantes da UFEM como arma de defesa pessoal',
                    categ: 'Arma Branca (Leve)',
                    range: 'Corpo-a-corpo',
                    weight: 0.2,
                    hit: 'des',
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
                    weight: 0.5,
                    value: 5,
                    displacementPenalty:0
                }
            ]
        }
    },
    magics: {
        type: [ Object ],
        required: [ true, 'Magics is required!' ],
        default: []
    },
    gender: {
        type: String,
        required: [ true, 'Gender is required!' ]
    },
    elementalAffinities: {
        type: [ String ],
        required: [ true, 'Elemental affinities is required!' ]
    },
    level: {
        type: Number,
        required: [ true, 'Level is required!' ],
        default: 0
    },
    subclass: {
        type: String,
        required: [ true, 'Subclass is required!' ],
        default: ''
    },
    financialCondition: {
        type: String,
        required: [ true, 'Financial condition is required!' ]
    },
    skills: {
        type: [ Object ],
        required: [ true, 'Skills is required!' ]
    },
    expertises: {
        type: Object,
        required: [ true, 'Expertises is required!' ],
        default: {
            'Atletismo': 0,
            'RES Física': 0,
            'RES Mental': 0,
            'RES Mágica': 0,
            'Crime': 0,
            'Agilidade': 0,
            'Sobrevivência': 0,
            'Competência': 0,
            'Luta': 0,
            'Conhecimento': 0,
            'Criatividade': 0,
            'Furtividade': 0,
            'Pontaria': 0,
            'Reflexos': 0,
            'Controle': 0,
            'Condução': 0,
            'Sorte': 0,
            'Enganação': 0,
            'Tecnologia': 0,
            'Magia': 0,
            'Comunicação': 0,
            'Medicina': 0,
            'Percepção': 0,
            'Intuição': 0,
            'Investigação': 0,
            'Argumentação': 0,
            'Intimidação': 0,
            'Persuasão': 0,
            'Liderança': 0
        }
    },
    perks: {
        type: [ Object ],
        required: [ true, 'Perks is required!' ],
        default: []
    },
    penalties: {
        type: [ Object ],
        required: [ true, 'Penalties is required!' ],
        deafult: []
    },
    points: {
        attributes: {
            type: Number,
            required: [ true, 'Attributes is required!' ],
            default: 9
        },
        expertises: {
            type: Number,
            required: [ true, 'Expertises is required!' ],
            default: 0
        },
        skills: {
            type: Number,
            required: [ true, 'Skills is required!' ],
            default: 0
        },
        magics: {
            type: Number,
            required: [ true, 'Magics is required!' ],
            default: 0
        }
    },
    attributes: {
        lp: {
            type: Number,
            required: [ true, 'LP is required!' ],
            default: 0
        },
        mp: {
            type: Number,
            required: [ true, 'MP is required!' ],
            default: 0
        },
        ap: {
            type: Number,
            required: [ true, 'AP is required!' ],
            default: 5
        },
        des: {
            type: Number,
            required: [ true, 'Des is required!' ],
            default: 0
        },
        vig: {
            type: Number,
            required: [ true, 'Vig is required!' ],
            default: 0
        },
        foc: {
            type: Number,
            required: [ true, 'Foc is required!' ],
            default: 0
        },
        log: {
            type: Number,
            required: [ true, 'Log is required!' ],
            default: 0
        },
        sab: {
            type: Number,
            required: [ true, 'Sab is required!' ],
            default: 0
        },
        car: {
            type: Number,
            required: [ true, 'Car is required!' ],
            default: 0
        }
    }
})

const Ficha = models['Ficha'] || model('Ficha', fichaSchema)

export default Ficha