import { Collection } from 'fireorm'

@Collection('users')
export class User {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: Date = new Date();
    fichas?: string[] = [];
}