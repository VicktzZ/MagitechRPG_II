import type { Ficha as FichaType } from '@types';
import { Schema, model, models } from 'mongoose';

const fichaSchema = new Schema<FichaType>({
    playerName: {
        type: String,
        required: [ true, 'Player name is required!' ]
    },
    mode: {
        type: String,
        required: [ true, 'Mode is required!' ]
    },
    name: {
        type: String,
        required: [ true, 'Name is required!' ]
    },
    userId: {
        type: String,
        required: [ true, 'userId is required!' ]
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
        type: Object,
        required: [ true, 'Capacity is required!' ]
    },
    ORMLevel: {
        type: Number,
        default: 1
    },
    race: {
        type: String,
        required: [ true, 'Race is required!' ]
    },
    displacement: {
        type: Number,
        required: [ true, 'Displacement is required!' ]
    },
    lineage: {
        type: String,
        required: [ true, 'Lineage is required!' ]
    },
    inventory: {
        money: {
            type: Number,
            default: 0
        },
        items: {
            type: [ Object ],
            default: [
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
            ]
        },
        weapons: {
            type: [ Object ],
            default: [
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
            ]
        },
        armors: {
            type: [ Object ],
            default: [
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
    elementalMastery: {
        type: String,
        default: null
    },
    anotacoes: {
        type: String,
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    subclass: {
        type: String
    },
    financialCondition: {
        type: String,
        required: [ true, 'Financial condition is required!' ]
    },
    magicsSpace: {
        type: Number
    },
    skills: {
        type: Object,
        required: [ true, 'Skills is required!' ]
    },
    expertises: {
        'Atletismo': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'vig'
            }
        },
        'RES Física': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'vig'
            }
        },
        'RES Mental': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'RES Mágica': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        },
        'Ladinagem': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'des'
            }
        },
        'Agilidade': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'des'
            }
        },
        'Sobrevivência': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'sab'
            }
        },
        'Competência': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'Luta': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'vig'
            }
        },
        'Conhecimento': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'sab'
            }
        },
        'Criatividade': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'Furtividade': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'des'
            }
        },
        'Pontaria': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'des'
            }
        },
        'Reflexos': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        },
        'Controle': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        },
        'Condução': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'des'
            }
        },
        'Sorte': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'sab'
            }
        },
        'Enganação': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Tecnologia': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'Magia': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        },
        'Comunicação': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Medicina': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'sab'
            }
        },
        'Percepção': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        },
        'Intuição': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'Investigação': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'log'
            }
        },
        'Argumentação': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Intimidação': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Persuasão': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Liderança': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'car'
            }
        },
        'Vontade': {
            type: Object,
            default: {
                value: 0,
                defaultAttribute: 'foc'
            }
        }
    },
    traits: {
        type: [ Object ],
        required: [ true, 'Traits is required!' ],
        default: []
    },

    points: {
        attributes: {
            type: Number,
            required: [ true, 'Attributes is required!' ],
            default: 9
        },
        diligence: {
            type: Number,
            required: [ true, 'Diligence is required!' ],
            default: 1
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