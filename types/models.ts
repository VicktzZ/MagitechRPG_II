import type { MessageType } from '@enums'
import type { Attributes, CampaignCustomArmor, CampaignCustomItem, CampaignCustomWeapon, Expertises, Ficha, Magic, Skill } from './ficha'

export interface User {
    _id?: string
    name: string
    email: string
    image: string
    fichas: string[]
}

export interface Notification {
    _id?: string
    userId: string
    title: string
    content: string
    timestamp: Date
    read: boolean
    type: 'levelUp' | 'newMessage' | 'newPlayer' | 'other'
    link?: string
}

export interface SessionNextAuth {
    user: User
    token: string
}

export interface AmmoControl {
    type: string;
    current: number;
    max: number;
}

export interface Member {
    name: string,
    email: string,
    image: string,
    _id: string,
    currentFicha: Ficha
}

export interface SessionModel {
    sessionCode: string
    admin: string[]
}

export interface Magia {
    _id?: string
    'elemento': Elemento
    'nome': string
    'nível': number
    'custo': number
    'tipo': string
    'execução': string
    'alcance': string
    'estágio 1': string
    'estágio 2'?: string
    'estágio 3'?: string
    'maestria'?: string
}

export interface Campaign {
    _id?: string
    admin: string[]
    campaignCode: string
    title: string
    description: string
    players: Player[]
    notes: Note[]
    myFicha?: Ficha | null
    session: Session
    custom: {
        magias: Magia[]
        creatures: Creature[]
        skills: Skill[]
        items: {
            weapon: CampaignCustomWeapon[]
            armor: CampaignCustomArmor[]
            item: CampaignCustomItem[]
        }
    }
}

export interface CampaignSession {
    players: Player[]
    admin: string[]
    session: Session
}

export interface CampaignData {
    campaign: Campaign
    fichas: Ficha[]
    isUserGM: boolean
    code: string
    users: {
        player: User[]
        admin: User[],
        all: User[]
    }
}

export interface Creature {
    _id?: string
    name: string
    description: string
    attributes: Record<Attributes | 'lp' | 'mp' | 'ap', number>
    expertises: Expertises
    level: number
    skills?: Skill[]
    spells?: Magic[] | Magia[]
}

export interface Note {
    _id?: string
    content: string
    timestamp: Date
}

export interface Session {
    users: string[]
    messages?: Message[]
}

export interface Message {
    id?: string
    timestamp?: Date
    type: MessageType
    text: string
    isHTML?: boolean
    by: {
        id: string
        image: string
        name: string
        isBot?: boolean
    }
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
    fichaId: string
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
        _id: string
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

type Elemento = 
    'FOGO' |
    'ÁGUA' |
    'AR' |
    'TERRA' |
    'ELETRICIDADE' |
    'TREVAS' |
    'LUZ' |
    'SANGUE' |
    'VÁCUO' |
    'PSÍQUICO' |
    'RADIAÇÃO' |
    'EXPLOSÃO' |
    'NÃO-ELEMENTAL'