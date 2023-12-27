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