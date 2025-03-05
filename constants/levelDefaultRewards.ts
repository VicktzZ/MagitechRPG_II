import { type Class } from '@types';

export const levelDefaultRewards: Record<Class['name'], { lp: number, mp: number }> = {
    Lutador: {
        lp: 4,
        mp: 1
    },

    Especialista: {
        lp: 3,
        mp: 2
    },

    Feiticeiro: {
        lp: 1,
        mp: 3
    },

    Bruxo: {
        lp: 2,
        mp: 2
    },

    Monge: {
        lp: 2,
        mp: 2
    },

    Druida: {
        lp: 2,
        mp: 2
    },

    Arcano: {
        lp: 1,
        mp: 4
    },

    Ladino: {
        lp: 2,
        mp: 2
    }
}