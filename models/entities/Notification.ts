import { Collection } from 'fireorm';

@Collection('notifications')
export class Notification {
    id: string;
    userId: string;
    title: string;
    content: string;
    timestamp: Date = new Date();
    read: boolean = false;
    type: string = 'info';
    link?: string;
}