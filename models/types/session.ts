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

/** Resultado de um jogador num teste pedido pelo mestre (gravado pelo servidor, que refaz a conta) */
export interface TestResponse {
    userName: string
    /** d20 rolados (um por dado do teste) */
    rolls: number[]
    /** Quantidade de d20 do teste */
    dice: number
    /** Valor usado: o maior d20 rolado */
    usedRoll: number
    /** Bônus somado ao d20 (perícia + influência do atributo) */
    bonus: number
    total: number
    success: boolean
    respondedAt: string
}

/**
 * Teste em andamento pedido pelo mestre. Fica em `campaign.session.testRequest`:
 * os jogadores o recebem pelo mesmo listener da campanha, sem depender do Pusher.
 * Só existe um por vez — um novo pedido substitui o anterior.
 */
export interface ActiveTest {
    id: string
    dt: number
    expertise?: string
    isGroupTest: boolean
    /** Público: o resultado vai para o chat. Fechado: só o mestre vê. */
    isVisible: boolean
    showResult: boolean
    /** IDs de usuário dos jogadores chamados (num teste geral, os que estavam online) */
    selectedPlayers: string[]
    requestedBy: { id: string, name: string }
    createdAt: string
    /** Respostas por ID de usuário */
    responses?: Record<string, TestResponse>
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