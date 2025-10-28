import type { Class } from '@models';
import type { ClassNames } from '@models/types/string';
import { skills } from './skills';

const { 
    class: { 
        Combatente: CombatenteSkills,
        Especialista: EspecialistaSkills,
        Feiticeiro: feiticeiroSkills,
        Bruxo: bruxoSkills,
        Monge: mongeSkills,
        Druida: druidaSkills,
        Arcano: arcanoSkills,
        Ladino: ladinoSkills
    }
} = skills

export const classesModel: Record<ClassNames, Class> = {
    'Combatente': {
        name: 'Combatente',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 18,
            mp: 2,
            ap: 10
        },

        points: {
            expertises: 10
        },

        skills: CombatenteSkills
    },

    'Especialista': {
        name: 'Especialista',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 14,
            mp: 6,
            ap: 8
        },

        points: {
            expertises: 20
        },

        skills: EspecialistaSkills
    },

    'Feiticeiro': {
        name: 'Feiticeiro',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 10,
            mp: 10,
            ap: 7
        },

        points: {
            expertises: 12
        },

        skills: feiticeiroSkills
    },

    'Bruxo': {
        name: 'Bruxo',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 12,
            mp: 8,
            ap: 8
        },

        points: {
            expertises: 12
        },

        skills: bruxoSkills
    },

    'Monge': {
        name: 'Monge',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 14,
            mp: 4,
            ap: 9
        },

        points: {
            expertises: 16
        },

        skills: mongeSkills
    },

    'Druida': {
        name: 'Druida',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 16,
            mp: 6,
            ap: 8
        },

        points: {
            expertises: 12
        },

        skills: druidaSkills
    },

    'Arcano': {
        name: 'Arcano',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 9,
            mp: 12,
            ap: 6
        },

        points: {
            expertises: 12,
            skills: 1
        },

        skills: arcanoSkills
    },

    'Ladino': {
        name: 'Ladino',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 8,
            mp: 4,
            ap: 7
        },

        points: {
            expertises: 10
        },

        skills: ladinoSkills
    }
}