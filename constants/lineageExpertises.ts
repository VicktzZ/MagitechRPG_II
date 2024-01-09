import { Expertises, Lineage } from "@types";

interface ExpertisesOverrided {
    points?: number,
    tests: {
        'Agilidade': number
        'Argumentação': number
        'Atletismo': number
        'Competência': number
        'Comunicação': number
        'Condução': number
        'Conhecimento': number
        'Controle': number
        'Criatividade': number
        'Enganação': number
        'Furtividade': number
        'Intimidação': number
        'Intuição': number
        'Investigação': number
        'Ladinagem': number
        'Liderança': number
        'Luta': number
        'Magia': number
        'Medicina': number
        'Percepção': number
        'Persuasão': number
        'Pontaria': number
        'Reflexos': number
        'RES Física': number
        'RES Mágica': number
        'RES Mental': number
        'Sorte': number
        'Sobrevivência': number
        'Tecnologia': number
        'Vontade': number
    }
}

const expertises = {
    'Agilidade': 0,
    'Argumentação': 0,
    'Atletismo': 0,
    'Competência': 0,
    'Comunicação': 0,
    'Condução': 0,
    'Conhecimento': 0,
    'Controle': 0,
    'Criatividade': 0,
    'Enganação': 0,
    'Furtividade': 0,
    'Intimidação': 0,
    'Intuição': 0,
    'Investigação': 0,
    'Ladinagem': 0,
    'Liderança': 0,
    'Luta': 0,
    'Magia': 0,
    'Medicina': 0,
    'Percepção': 0,
    'Persuasão': 0,
    'Pontaria': 0,
    'Reflexos': 0,
    'RES Física': 0,
    'RES Mágica': 0,
    'RES Mental': 0,
    'Sorte': 0,
    'Sobrevivência': 0,
    'Tecnologia': 0,
    'Vontade': 0
}

export const lineageExpertises: Record<Lineage['name'], ExpertisesOverrided> = {
    'Órfão': {
        tests: {
            ...expertises,
            'Sobrevivência': 2
        },
        points: 1
    },

    'Infiltrado': {
        tests: {
            ...expertises,
            'Percepção': 2,
            'Controle': 2
        }
    },

    'Estrangeiro': {
        tests: {
            ...expertises
        },
        points: 2
    },

    'Camponês': {
        tests: {
            ...expertises,
            'Vontade': 2,
            'Sorte': 2
        }
    },

    'Burguês': {
        tests: {
            ...expertises,
            'Controle': 2,
            'Persuasão': 2
        }
    },

    'Artista': {
        tests: {
            ...expertises,
            'Criatividade': 2,
            'Comunicação': 2
        }
    },

    'Ginasta': {
        tests: {
            ...expertises,
            'Atletismo': 2,
            'RES Física': 2
        }
    },

    'Herdeiro': {
        tests: {
            ...expertises,
            'Controle': 2,
            'Comunicação': 2
        }
    },

    'Cobaia': {
        tests: {
            ...expertises,
            'Magia': 2
        },
        points: 1
    },

    'Gangster': {
        tests: {
            ...expertises,
            'Intimidação': 2
        },
        points: 1
    },

    'Hacker': {
        tests: {
            ...expertises,
            'Percepção': 2,
            'Tecnologia': 2
        }
    },

    'Clínico': {
        tests: {
            ...expertises,
            'Medicina': 2,
            'Controle': 2
        }
    },
    
    'Combatente': {
        tests: {
            ...expertises,
            'Pontaria': 2,
            'Reflexos': 2
        }
    },

    'Aventureiro': {
        tests: {
            ...expertises,
            'Atletismo': 2,
            'Sobrevivência': 2
        }
    },

    'Trambiqueiro': {
        tests: {
            ...expertises,
            'Furtividade': 2,
            'Ladinagem': 2
        }
    },

    'Prodígio': {
        tests: {
            ...expertises,
            'Competência': 2,
            'Conhecimento': 2
        }
    },

    'Novato': {
        tests: {
            ...expertises
        },

        points: 2
    },

    'Inventor': {
        tests: {
            ...expertises,
            'Criatividade': 2,
            'Tecnologia': 2
        }
    },

    'Idólatra': {
        tests: {
            ...expertises,
            'Magia': 2
        },
        points: 1
    },

    'Cismático': {
        tests: {
            ...expertises,
            'RES Mental': 2,
            'RES Mágica': 2
        }
    },

    'Pesquisador': {
        tests: {
            ...expertises,
            'Magia': 2,
            'Tecnologia': 2
        }
    },

    'Investigador': {
        tests: {
            ...expertises,
            'Percepção': 2,
            'Investigação': 2
        }
    }
}