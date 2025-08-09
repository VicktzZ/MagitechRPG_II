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
        type: Object,
        required: [ true, 'Expertises is required!' ]
    },
    traits: {
        type: [ Object ],
        required: [ true, 'Traits is required!' ],
        default: []
    },
    session: {
        type: [ {
            campaignCode: String,
            attributes: {
                maxLp: Number,
                maxMp: Number
            }
        } ],
        default: []
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
        },

        maxLp: {
            type: Number,
            required: [ true, 'Max LP is required!' ],
            default: function() {
                return this.attributes.lp;
            }
        },
        maxMp: {
            type: Number,
            required: [ true, 'Max MP is required!' ],
            default: function() {
                return this.attributes.mp;
            }
        },
        maxAp: {
            type: Number,
            required: [ true, 'Max AP is required!' ],
            default: function() {
                return this.attributes.ap;
            }
        }
    },
    ammoCounter: {
        current: {
            type: Number,
            required: [ true, 'Current ammo is required!' ],
            default: 0
        },
        max: {
            type: Number,
            required: [ true, 'Max ammo is required!' ],
            default: 30
        }
    },
    overall: {
        type: Number,
        required: [ true, 'Overall is required!' ]
    },
    dices: {
        type: [ Object ],
        required: [ true, 'Dices is required!' ],
        default: []
    },
    passives: {
        type: [ Object ],
        required: [ true, 'Passives is required!' ],
        default: []
    },
    mpLimit: {
        type: Number,
        required: [ true, 'MP Limit is required!' ],
        default: function() {
            return this.attributes.mp + this.level + this.attributes.foc;
        }
    },
    mods: {
        attributes: {
            des: {
                type: Number,
                required: [ true, 'DES MOD is required!' ],
                default: 0
            },
            vig: {
                type: Number,
                required: [ true, 'VIG MOD is required!' ],
                default: 0
            },
            log: {
                type: Number,
                required: [ true, 'LOG MOD is required!' ],
                default: 0
            },
            sab: {
                type: Number,
                required: [ true, 'SAB MOD is required!' ],
                default: 0
            },
            foc: {
                type: Number,
                required: [ true, 'FOC MOD is required!' ],
                default: 0
            },
            car: {
                type: Number,
                required: [ true, 'CAR MOD is required!' ],
                default: 0
            }
        },
        discount: {
            type: Number,
            required: [ true, 'Discount is required!' ],
            default: -10
        }
    }
})

const Ficha = models['Ficha'] || model('Ficha', fichaSchema)

export default Ficha