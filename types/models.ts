import type { MessageType } from '@enums'
import type { Expertises, Ficha } from './ficha'

export interface User {
    _id?: string
    name: string
    email: string
    image: string
    fichas: string[]
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
    myFicha?: Ficha | null
    session: Session
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
    'NÃO-ELEMENTAL'