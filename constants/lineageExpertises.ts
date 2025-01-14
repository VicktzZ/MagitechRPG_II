import type { Lineage, Occupation } from '@types';

export interface ExpertisesOverrided {
    points?: number,
    tests?: {
        'Agilidade'?: number
        'Argumentação'?: number
        'Atletismo'?: number
        'Competência'?: number
        'Comunicação'?: number
        'Condução'?: number
        'Conhecimento'?: number
        'Controle'?: number
        'Criatividade'?: number
        'Enganação'?: number
        'Furtividade'?: number
        'Intimidação'?: number
        'Intuição'?: number
        'Investigação'?: number
        'Ladinagem'?: number
        'Liderança'?: number
        'Luta'?: number
        'Magia'?: number
        'Medicina'?: number
        'Percepção'?: number
        'Persuasão'?: number
        'Pontaria'?: number
        'Reflexos'?: number
        'RES Física'?: number
        'RES Mágica'?: number
        'RES Mental'?: number
        'Sorte'?: number
        'Sobrevivência'?: number
        'Tecnologia'?: number
        'Vontade'?: number
    }
}

export const lineageExpertises: Record<Lineage['name'], ExpertisesOverrided> = {
    'Órfão': {
        tests: {
            'Sobrevivência': 2
        },
        points: 1
    },

    'Infiltrado': {
        tests: {
            'Percepção': 2,
            'Controle': 2
        }
    },

    'Estrangeiro': {
        points: 2
    },

    'Camponês': {
        tests: {
            'Vontade': 2,
            'Sorte': 2
        }
    },

    'Burguês': {
        tests: {
            'Controle': 2,
            'Persuasão': 2
        }
    },

    'Artista': {
        tests: {
            'Criatividade': 2,
            'Comunicação': 2
        }
    },

    'Ginasta': {
        tests: {
            'Atletismo': 2,
            'RES Física': 2
        }
    },

    'Herdeiro': {
        tests: {
            'Controle': 2,
            'Comunicação': 2
        }
    },

    'Cobaia': {
        tests: {
            'Magia': 2
        },
        points: 1
    },

    'Gangster': {
        tests: {
            'Intimidação': 2
        },
        points: 1
    },

    'Hacker': {
        tests: {
            'Percepção': 2,
            'Tecnologia': 2
        }
    },

    'Clínico': {
        tests: {
            'Medicina': 2,
            'Controle': 2
        }
    },
    
    'Combatente': {
        tests: {
            'Pontaria': 2,
            'Reflexos': 2
        }
    },

    'Aventureiro': {
        tests: {
            'Atletismo': 2,
            'Sobrevivência': 2
        }
    },

    'Trambiqueiro': {
        tests: {
            'Furtividade': 2,
            'Ladinagem': 2
        }
    },

    'Prodígio': {
        tests: {
            'Competência': 2,
            'Conhecimento': 2
        }
    },

    'Novato': {
        points: 2
    },

    'Inventor': {
        tests: {
            'Criatividade': 2,
            'Tecnologia': 2
        }
    },

    'Idólatra': {
        tests: {
            'Magia': 2
        },
        points: 1
    },

    'Cismático': {
        tests: {
            'RES Mental': 2,
            'RES Mágica': 2
        }
    },

    'Pesquisador': {
        tests: {
            'Magia': 2,
            'Tecnologia': 2
        }
    },

    'Investigador': {
        tests: {
            'Percepção': 2,
            'Investigação': 2
        }
    }
}

export const occupationsExpertises: Record<Occupation['name'], ExpertisesOverrided> = {
    'Artista': {
        tests: {
            'Criatividade': 2
        },

        points: 1
    },

    'Médico': {
        tests: {
            'Medicina': 2,
            'Intuição': 2
        }
    },

    'Militar': {
        tests: {
            'Luta': 2,
            'Pontaria': 2
        }
    },

    'Mafioso': {
        tests: {
            'Enganação': 2,
            'Intimidação': 2
        }
    },

    'Cozinheiro': {
        tests: {
            'Competência': 2,
            'Criatividade': 2
        }
    },

    'Inventor': {
        tests: {
            'Criatividade': 2,
            'Tecnologia': 2
        }
    },

    'Jardineiro': {
        tests: {
            'Conhecimento': 2,
            'Sobrevivência': 2
        }
    },

    'Programador': {
        tests: {
            'Tecnologia': 2,
            'Reflexos': 2
        }
    },

    'Cientista': {
        tests: {
            'Conhecimento': 2
        },

        points: 1
    },

    'Pesquisador': {
        tests: {
            'Conhecimento': 2,
            'Investigação': 2
        }
    },

    'Empresário': {
        tests: {
            'Liderança': 2,
            'Persuasão': 2
        }
    },

    'Professor': {
        tests: {
            'Conhecimento': 2,
            'Comunicação': 2
        }
    },

    'Político': {
        tests: {
            'Argumentação': 2,
            'Liderança': 2
        }
    },

    'Criminoso': {
        tests: {
            'Ladinagem': 2,
            'Furtividade': 2
        }
    },

    'Engenheiro': {
        tests: {
            'Competência': 2,
            'Tecnologia': 2
        }
    },

    'Mecânico': {
        tests: {
            'Condução': 2,
            'Tecnologia': 2
        }
    },

    'Autônomo': {
        tests: {
            'Competência': 2,
            'Sorte': 2
        }
    },

    'Atleta': {
        tests: {
            'Atletismo': 2,
            'Reflexos': 2
        }
    },

    'Detetive': {
        tests: {
            'Percepção': 2,
            'Investigação': 2
        }
    },

    'Sucateiro': {
        tests: {
            'Percepção': 2,
            'Reflexos': 2
        }
    },

    'Caçador': {
        tests: {
            'Furtividade': 2,
            'Sobrevivência': 2
        }
    },

    'Clérigo': {
        tests: {
            'Liderança': 2,
            'Vontade': 2
        }
    },

    'Desempregado': {
        tests: {
            'Sorte': 2,
            'Vontade': 2
        }
    }
}