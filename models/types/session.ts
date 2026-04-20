import type { Message, Expertises } from '@models';
import type { Campaign, Charsheet, User } from '@models/entities';

// export interface SessionModel {
//     sessionCode: string
//     admin: string[]
// }

// export interface CampaignData {
//     campaign: Campaign
//     charsheets: Charsheet[]
//     isUserGM: boolean
//     code: string
//     users: {
//         players: User[]
//         admin: User[],
//         all: User[]
//     }
// }

export interface CampaignData {
    campaign: Campaign,
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
        currentCharsheet: string,
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