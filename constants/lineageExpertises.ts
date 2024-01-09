import type { Lineage } from '@types';

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