import { Collection } from 'fireorm'

@Collection('users')
export class User {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string = new Date().toISOString();
    charsheets?: string[] = [];

    constructor(user?: Partial<User>) {
        Object.assign(this, user)
    }
}