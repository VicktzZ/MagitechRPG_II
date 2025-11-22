import { Collection } from "fireorm";

@Collection('armors')
export class ArmorEntity {
    id: string;
    name: string;
    description: string;
    rarity: string;
    type: string;
    kind: string;
    categ: 'Leve' | 'Média' | 'Pesada';
    weight: number;
    value: number;
    displacementPenalty: number;
    accessories: string[];
    quantity: number;
    space?: string;
    rogueliteRarity?: string;
    levelRequired?: number;


    constructor(armor?: ArmorEntity) {
        Object.assign(this, armor);
    }
}