import type { Expertises } from '../models/Expertises';

export interface StateEffect {
    expertisePenalties?: Partial<Record<keyof Expertises, number>>;
    damagePerTurn?: number;
    damageType?: 'fogo' | 'frio' | 'eletrico' | 'corrosivo' | 'mental' | 'perfurante' | 'concussivo';
    immunities?: string[];
    specialEffects?: string[];
    removalConditions?: {
        expertiseTest?: keyof Expertises;
        difficulty?: number;
        turnsToEnd?: number;
        saveEndChance?: number;
    };
}

export interface State {
    id: string;
    name: string;
    description: string;
    category: 'fisico' | 'mental' | 'magico' | 'movimento' | 'sensorial' | 'tecnologico';
    effects: StateEffect;
    duration: number; // em turnos, -1 para permanente
    stackable: boolean;
    visible: boolean; // se o personagem sabe que está sob este efeito
}

export const defaultStates: Record<string, State> = {
    queimadura: {
        id: 'queimadura',
        name: 'Queimadura',
        description: 'Personagem está sofrendo queimaduras graves, causando dor contínua e dificuldade de concentração.',
        category: 'fisico',
        effects: {
            damagePerTurn: 3,
            damageType: 'fogo',
            expertisePenalties: {
                'Agilidade': -2,
                'Reflexos': -2
            },
            removalConditions: {
                expertiseTest: 'Medicina',
                difficulty: 12,
                saveEndChance: 25
            }
        },
        duration: 5,
        stackable: true,
        visible: true
    },

    congelamento: {
        id: 'congelamento',
        name: 'Congelamento',
        description: 'O corpo do personagem está parcialmente congelado, retardando movimentos e processos mentais.',
        category: 'fisico',
        effects: {
            damagePerTurn: 2,
            damageType: 'frio',
            expertisePenalties: {
                'Agilidade': -3,
                'Atletismo': -3,
                'Reflexos': -2,
                'Pontaria': -2
            },
            specialEffects: [ 'Metade do movimento' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 14,
                saveEndChance: 20
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    envenenamento: {
        id: 'envenenamento',
        name: 'Envenenamento',
        description: 'Toxinas circulam pelo corpo, enfraquecendo sistemas vitais e causando náuseas.',
        category: 'fisico',
        effects: {
            damagePerTurn: 2,
            damageType: 'corrosivo',
            expertisePenalties: {
                'Fortitude': -3,
                'Força': -2,
                'Vontade': -2
            },
            removalConditions: {
                expertiseTest: 'Medicina',
                difficulty: 15,
                saveEndChance: 15
            }
        },
        duration: 6,
        stackable: true,
        visible: true
    },

    sangramento: {
        id: 'sangramento',
        name: 'Sangramento',
        description: 'Ferimentos abertos causam perda de sangue contínua, levando à fraqueza progressiva.',
        category: 'fisico',
        effects: {
            damagePerTurn: 2,
            damageType: 'perfurante',
            expertisePenalties: {
                'Fortitude': -2,
                'Atletismo': -2,
                'Força': -1,
                'Vontade': -1
            },
            specialEffects: [ 'Deixa rastro de sangue' ],
            removalConditions: {
                expertiseTest: 'Medicina',
                difficulty: 11,
                saveEndChance: 30
            }
        },
        duration: 3,
        stackable: true,
        visible: true
    },

    paralisia: {
        id: 'paralisia',
        name: 'Paralisia',
        description: 'Personagem está completamente imobilizado, incapaz de se mover ou realizar ações físicas.',
        category: 'fisico',
        effects: {
            expertisePenalties: {
                'Agilidade': -6,
                'Atletismo': -6,
                'Força': -6,
                'Luta': -6,
                'Reflexos': -6,
                'Esquiva': -6
            },
            specialEffects: [ 'Não pode se mover', 'Não pode realizar ações físicas', 'Vulnerável a ataques críticos' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 16,
                saveEndChance: 10
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    atordoamento: {
        id: 'atordoamento',
        name: 'Atordoamento',
        description: 'Personagem está tonto e desorientado, com dificuldade para processar informações e reagir.',
        category: 'fisico',
        effects: {
            expertisePenalties: {
                'Reflexos': -4,
                'Agilidade': -3,
                'Pontaria': -3,
                'Percepção': -3
            },
            specialEffects: [ 'Apenas uma ação por turno' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 13,
                saveEndChance: 25
            }
        },
        duration: 2,
        stackable: false,
        visible: true
    },

    exaustao: {
        id: 'exaustao',
        name: 'Exaustão',
        description: 'Fadiga extrema afeta todas as capacidades físicas e mentais do personagem.',
        category: 'fisico',
        effects: {
            expertisePenalties: {
                'Força': -2,
                'Atletismo': -2,
                'Fortitude': -2,
                'Vontade': -1
            },
            specialEffects: [ 'Vantagem em testes para dormir' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 10,
                turnsToEnd: 8
            }
        },
        duration: -1,
        stackable: true,
        visible: true
    },

    medo: {
        id: 'medo',
        name: 'Medo',
        description: 'Terror paralisa o personagem, causando pânico e reações irracionais.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Vontade': -4,
                'Intimidação': -3,
                'Liderança': -3,
                'Magia': -2
            },
            specialEffects: [ 'Desejo de fugir da fonte do medo' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 14,
                saveEndChance: 20
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    confusao: {
        id: 'confusao',
        name: 'Confusão',
        description: 'Pensamento embaralhado torna difícil distinguir amigos de inimigos e tomar decisões lógicas.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Conhecimento': -3,
                'Tática': -3,
                'Investigação': -3,
                'Percepção': -2
            },
            specialEffects: [ '50% de chance de atacar alvo errado' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 12,
                saveEndChance: 25
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    charme: {
        id: 'charme',
        name: 'Charme',
        description: 'Personagem está magicamente encantado, considerando o fonte do efeito como amigo confiável.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Intimidação': -4,
                'Enganação': -3,
                'Vontade': -2,
                'Diplomacia': -2
            },
            specialEffects: [ 'Trata fonte do charme como aliado', 'Resiste a atacar fonte' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 15,
                saveEndChance: 15
            }
        },
        duration: 5,
        stackable: false,
        visible: false
    },

    raiva: {
        id: 'raiva',
        name: 'Raiva',
        description: 'Fúria incontrolável domina o personagem, levando a ações agressivas e imprudentes.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Diplomacia': -4,
                'Comunicação': -3,
                'Tática': -3,
                'Vontade': -2
            },
            specialEffects: [ '+2 em testes de Força', 'Deve atacar inimigo mais próximo' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 13,
                saveEndChance: 20
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    sono: {
        id: 'sono',
        name: 'Sono',
        description: 'Personagem cai em sono profundo, completamente inconsciente e vulnerável.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Percepção': -6,
                'Reflexos': -6,
                'Vontade': -4
            },
            specialEffects: [ 'Inconsciente', 'Vulnerável a ataques críticos', 'Acorda com dano ou barulho forte' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 11,
                saveEndChance: 50
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    maldicao: {
        id: 'maldicao',
        name: 'Maldição',
        description: 'Força sombria aflige o personagem, causando azar constante e interferência mágica.',
        category: 'magico',
        effects: {
            expertisePenalties: {
                'Magia': -3,
                'Sorte': -4,
                'Vontade': -2,
                'RES Mágica': -2
            },
            specialEffects: [ 'Falhas críticas em 1-2', 'Testes de má sorte' ],
            removalConditions: {
                expertiseTest: 'RES Mágica',
                difficulty: 16,
                saveEndChance: 10
            }
        },
        duration: -1,
        stackable: false,
        visible: true
    },

    silenciamento: {
        id: 'silenciamento',
        name: 'Silenciamento',
        description: 'Campo mágico impede vocalização, bloqueando conjuração de magias com componentes verbais.',
        category: 'magico',
        effects: {
            expertisePenalties: {
                'Magia': -5,
                'Comunicação': -3,
                'Diplomacia': -2,
                'Intimidação': -2
            },
            specialEffects: [ 'Não pode conjurar magias com componente verbal' ],
            removalConditions: {
                expertiseTest: 'RES Mágica',
                difficulty: 14,
                saveEndChance: 25
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    antimagic: {
        id: 'antimagic',
        name: 'Antimágia',
        description: 'Campo neutralizador bloqueia completamente o fluxo de energia mágica ao redor do personagem.',
        category: 'magico',
        effects: {
            expertisePenalties: {
                'Magia': -6,
                'RES Mágica': -4
            },
            specialEffects: [ 'Não pode conjurar magias', 'Itens mágicos não funcionam', 'Protege contra magias' ],
            immunities: [ 'magia' ],
            removalConditions: {
                expertiseTest: 'RES Mágica',
                difficulty: 18,
                saveEndChance: 5
            }
        },
        duration: 2,
        stackable: false,
        visible: true
    },

    drenagem: {
        id: 'drenagem',
        name: 'Drenagem',
        description: 'Energia vital ou mágica está sendo sugada, enfraquecendo o personagem continuamente.',
        category: 'magico',
        effects: {
            expertisePenalties: {
                'Fortitude': -3,
                'Vontade': -3,
                'Magia': -2,
                'RES Mágica': -2
            },
            specialEffects: [ 'Drena 1 MP por turno', 'Causa fraqueza progressiva' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 15,
                saveEndChance: 15
            }
        },
        duration: 4,
        stackable: true,
        visible: true
    },

    lentidao: {
        id: 'lentidao',
        name: 'Lentidão',
        description: 'Movimentos estão visivelmente mais lentos, reduzindo velocidade e tempo de reação.',
        category: 'movimento',
        effects: {
            expertisePenalties: {
                'Agilidade': -3,
                'Reflexos': -3,
                'Esquiva': -3,
                'Pontaria': -2
            },
            specialEffects: [ 'Metade do movimento', 'Iniciativa reduzida' ],
            removalConditions: {
                expertiseTest: 'Fortitude',
                difficulty: 12,
                saveEndChance: 30
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    imobilizacao: {
        id: 'imobilizacao',
        name: 'Imobilização',
        description: 'Forças externas ou mágicas prendem o personagem no lugar, impedindo movimento.',
        category: 'movimento',
        effects: {
            expertisePenalties: {
                'Agilidade': -5,
                'Atletismo': -5,
                'Esquiva': -5,
                'Luta': -3
            },
            specialEffects: [ 'Não pode se mover do local', 'Ações físicas com desvantagem' ],
            removalConditions: {
                expertiseTest: 'Força',
                difficulty: 14,
                saveEndChance: 20
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    queda: {
        id: 'queda',
        name: 'Queda',
        description: 'Personagem está no chão, precisando se levantar antes de agir efetivamente.',
        category: 'movimento',
        effects: {
            expertisePenalties: {
                'Agilidade': -2,
                'Luta': -3,
                'Pontaria': -2,
                'Esquiva': -4
            },
            specialEffects: [ 'Precisa gastar ação para se levantar', 'Vulnerável a ataques' ],
            removalConditions: {
                expertiseTest: 'Agilidade',
                difficulty: 10,
                saveEndChance: 100
            }
        },
        duration: 1,
        stackable: false,
        visible: true
    },

    cegueira: {
        id: 'cegueira',
        name: 'Cegueira',
        description: 'Visão completamente bloqueada, tornando o personagem dependente de outros sentidos.',
        category: 'sensorial',
        effects: {
            expertisePenalties: {
                'Pontaria': -5,
                'Percepção': -4,
                'Investigação': -3,
                'Luta': -3
            },
            specialEffects: [ 'Falha automática em testes visuais', 'Movimento com desvantagem' ],
            removalConditions: {
                expertiseTest: 'Medicina',
                difficulty: 13,
                saveEndChance: 25
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    surdez: {
        id: 'surdez',
        name: 'Surdez',
        description: 'Audição completamente bloqueada, impedindo detecção de sons e comunicação verbal.',
        category: 'sensorial',
        effects: {
            expertisePenalties: {
                'Percepção': -3,
                'Comunicação': -4,
                'Diplomacia': -3,
                'Intimidação': -2
            },
            specialEffects: [ 'Falha automática em testes auditivos', 'Não pode ouvir avisos' ],
            removalConditions: {
                expertiseTest: 'Medicina',
                difficulty: 12,
                saveEndChance: 30
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    desorientacao: {
        id: 'desorientacao',
        name: 'Desorientação',
        description: 'Sentidos confundidos dificultam localização e percepção espacial do ambiente.',
        category: 'sensorial',
        effects: {
            expertisePenalties: {
                'Percepção': -3,
                'Agilidade': -2,
                'Pontaria': -2,
                'Tática': -2
            },
            specialEffects: [ 'Dificuldade em determinar direções', 'Desvantagem em navegação' ],
            removalConditions: {
                expertiseTest: 'Vontade',
                difficulty: 11,
                saveEndChance: 35
            }
        },
        duration: 2,
        stackable: false,
        visible: true
    },

    sobrecarga: {
        id: 'sobrecarga',
        name: 'Sobrecarga Tecnológica',
        description: 'Sistemas cibernéticos e tecnológicos estão sobrecarregados, causando mau funcionamento.',
        category: 'tecnologico',
        effects: {
            expertisePenalties: {
                'Tecnologia': -4,
                'Engenharia': -3,
                'Competência': -2,
                'Reflexos': -2
            },
            specialEffects: [ 'Itens tecnológicos têm 50% de falha', 'Interferência em comunicação' ],
            removalConditions: {
                expertiseTest: 'Tecnologia',
                difficulty: 14,
                saveEndChance: 20
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    },

    instabilidade: {
        id: 'instabilidade',
        name: 'Instabilidade Arcana',
        description: 'Energia mágica instável flui descontroladamente, causando efeitos imprevisíveis.',
        category: 'magico',
        effects: {
            expertisePenalties: {
                'Magia': -3,
                'Controle': -3,
                'Vontade': -2
            },
            specialEffects: [ '20% de efeito mágico aleatório', 'Dano backlash em falhas' ],
            removalConditions: {
                expertiseTest: 'RES Mágica',
                difficulty: 15,
                saveEndChance: 15
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    protecao: {
        id: 'protecao',
        name: 'Proteção',
        description: 'Barreira mágica ou tecnológica protege o personagem contra danos.',
        category: 'magico',
        effects: {
            specialEffects: [ 'Reduz 5 pontos de dano por ataque', 'Protege contra primeiro ataque crítico' ],
            removalConditions: {
                turnsToEnd: 5
            }
        },
        duration: 5,
        stackable: false,
        visible: true
    },

    foco: {
        id: 'foco',
        name: 'Foco',
        description: 'Concentração intensificada melhora desempenho em tarefas mentais e mágicas.',
        category: 'mental',
        effects: {
            expertisePenalties: {
                'Magia': 2,
                'Percepção': 2,
                'Vontade': 2
            },
            specialEffects: [ 'Vantagem em testes de concentração' ],
            removalConditions: {
                turnsToEnd: 4
            }
        },
        duration: 4,
        stackable: false,
        visible: true
    },

    adrenalina: {
        id: 'adrenalina',
        name: 'Adrenalina',
        description: 'Surto de adrenalina aumenta capacidades físicas temporariamente.',
        category: 'fisico',
        effects: {
            expertisePenalties: {
                'Força': 3,
                'Agilidade': 2,
                'Reflexos': 2,
                'Fortitude': 2
            },
            specialEffects: [ 'Ignora penalidades de dor', '+10 PV temporários' ],
            removalConditions: {
                turnsToEnd: 3
            }
        },
        duration: 3,
        stackable: false,
        visible: true
    }
};

export const defaultState = {
    id: '',
    name: '',
    description: '',
    category: 'fisico' as const,
    effects: {
        expertisePenalties: {},
        damagePerTurn: 0,
        specialEffects: [],
        removalConditions: {
            expertiseTest: 'Fortitude' as keyof Expertises,
            difficulty: 10,
            saveEndChance: 25
        }
    },
    duration: 1,
    stackable: false,
    visible: true
};