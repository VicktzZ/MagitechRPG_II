import { Collection } from 'fireorm';

@Collection('notifications')
export class Notification {
    id: string;
    userId: string;
    title: string;
    content: string;
    timestamp: string = new Date().toISOString();
    read: boolean = false;
    type: string = 'info';
    link?: string;

    constructor(notification?: Partial<Notification>) {
        Object.assign(this, notification)
    }
}