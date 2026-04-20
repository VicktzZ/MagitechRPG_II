import { Collection } from 'fireorm';

@Collection('powers')
export class Power {
    id: string;
    name: string;
    description: string;
    element: string;
    mastery: string;
    type?: string = 'Poder Mágico';
    origin?: string;
    preRequisite?: string = 'None';

    constructor(power?: Partial<Power>) {
        Object.assign(this, power)
    }
}
