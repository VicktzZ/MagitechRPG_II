import type { Message, Expertises, Session, Note, Skill, Creature, Weapon, Armor, Item } from '@models';
import type { Charsheet, Spell, User } from '@models/entities';

// export interface SessionModel {
//     sessionCode: string
//     admin: string[]
// }

// export interface CampaignData {
//     campaign: Campaign
//     fichas: Ficha[]
//     isUserGM: boolean
//     code: string
//     users: {
//         players: User[]
//         admin: User[],
//         all: User[]
//     }
// }

export interface CampaignData {
    campaign: {
        id: string,
        admin: string[],
        campaignCode: string,
        title: string,
        description: string,
        players: Player[],
        session: Session,
        custom: {
            items: {
                weapon: Weapon[],
                armor: Armor[],
                item: Item[]
            },
            magias: Spell[],
            creatures: Creature[],
            skills: Skill[]
        },
        myCharsheet: Charsheet | null,
        notes: Note[]
    },
    users: {
        admin: User[],
        players: User[],
        all: User[]
    },
    charsheets: Charsheet[],
    isUserGM: boolean,
}

export interface TempMessage extends Message {
    isPending?: boolean;
    tempId?: string;
}

export interface TestRequest {
    dt: number
    expertise?: keyof Expertises
    isGroupTest: boolean
    isVisible: boolean
    showResult: boolean
    selectedPlayers: string[]
    requestedBy: {
        id: string
        name: string
    }
}

export interface Player {
    userId: string,
    charsheetId: string
}

export interface PlayerInfo {
    username: string
    image: string
    charname: string
}

export interface PusherMemberParam {
    id: string,
    info: {
        name: string
        email: string
        image: string
        id: string
        currentFicha: string,
        socketId: string
    }
}

export interface TestData {
    dt: number;
    expertise?: keyof Expertises
    isGroupTest: boolean
    isVisible: boolean
    showResult: boolean
    selectedPlayers: string[];
}