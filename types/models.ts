import type { Ficha } from './ficha'

export interface User {
    _id?: string
    name: string
    email: string
    image: string
    fichas: string[]
}

export interface Session {
    user: User
    token: string
}

export interface Member {
    name: string,
    email: string,
    image: string,
    _id: string,
    currentFicha: Ficha
}

export interface Magia {
    _id?: string
    'elemento': Elemento
    'nome': string
    'nível': string
    'custo': string
    'tipo': string
    'execução': string
    'alcance': string
    'estágio 1': string
    'estágio 2'?: string
    'estágio 3'?: string
    'maestria'?: string
}

type Elemento = 
    'FOGO' |
    'ÁGUA' |
    'AR' |
    'TERRA' |
    'PLANTA' |
    'ELETRICIDADE' |
    'GELO' |
    'METAL' |
    'TREVAS' |
    'PSÍQUICO' |
    'TOXINA' |
    'LUZ' |
    'NÃO-ELEMENTAL'