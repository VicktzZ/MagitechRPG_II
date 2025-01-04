import type { Class, Classes } from  '@types';
import { skills } from './skills';

const { 
    class: { 
        Lutador: LutadorSkills,
        Especialista: EspecialistaSkills,
        Feiticeiro: feiticeiroSkills,
        Bruxo: bruxoSkills,
        Monge: mongeSkills,
        Druida: druidaSkills,
        Arcano: arcanoSkills,
        Ladino: ladinoSkills
    }
} = skills

export const classesModel: Record<Classes, Class> = {
    'Lutador': {
        name: 'Lutador',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 18,
            mp: 2,
            ap: 8
        },

        points: {
            diligence: 3,
            expertises: 4
        },

        skills: LutadorSkills
    },

    'Especialista': {
        name: 'Especialista',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 14,
            mp: 6,
            ap: 6
        },

        points: {
            diligence: 4,
            expertises: 10
        },

        skills: EspecialistaSkills
    },

    'Feiticeiro': {
        name: 'Feiticeiro',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 10,
            mp: 10,
            ap: 5
        },

        points: {
            diligence: 3,
            expertises: 6
        },

        skills: feiticeiroSkills
    },

    'Bruxo': {
        name: 'Bruxo',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 12,
            mp: 8,
            ap: 6
        },

        points: {
            diligence: 4,
            expertises: 6
        },

        skills: bruxoSkills
    },

    'Monge': {
        name: 'Monge',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 14,
            mp: 4,
            ap: 7
        },

        points: {
            diligence: 3,
            expertises: 8
        },

        skills: mongeSkills
    },

    'Druida': {
        name: 'Druida',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 16,
            mp: 6,
            ap: 6
        },

        points: {
            diligence: 5,
            expertises: 6
        },

        skills: druidaSkills
    },

    'Arcano': {
        name: 'Arcano',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 9,
            mp: 12,
            ap: 4
        },

        points: {
            diligence: 6,
            expertises: 5
        },

        skills: arcanoSkills
    },

    'Ladino': {
        name: 'Ladino',
        description: 'A classe de mago com habilidades de combate e defesa. O seu poder de ataque e de defesa aumentam com o nível da classe.',
        attributes: {
            lp: 8,
            mp: 4,
            ap: 5
        },

        points: {
            diligence: 5,
            expertises: 5
        },

        skills: ladinoSkills
    }
}