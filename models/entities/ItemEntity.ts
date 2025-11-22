import { Collection } from "fireorm";

@Collection('items')
export class ItemEntity {
    id: string;
    name: string;
    description: string;
    rarity: string;
    type: string = 'item';
    kind: string;
    weight: number;
    quantity: number = 1;
    level?: number;
    effects: string[] = [];
    space?: string;
    rogueliteRarity?: string;
    levelRequired?: number;
    
    constructor(item?: ItemEntity) {
        Object.assign(this, item);
    }
}