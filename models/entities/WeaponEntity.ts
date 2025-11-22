import { Collection } from 'fireorm';

@Collection('weapons')
export class WeaponEntity {
    id: string;
    name: string;
    description: string;
    rarity: string;
    type: string = 'weapon';
    kind: string;
    categ: string;
    range: string;
    hit: string;
    ammo: string;
    bonus: string;
    weaponKind?: string;
    magazineSize?: number;
    accessories: string;
    effect: {
        value: string;
        critValue: string;
        critChance: number;
        effectType: string;
    };

    weight: number;
    value: number;
    quantity: number;
    space?: string;
    rogueliteRarity?: string;
    levelRequired?: number;

    constructor(weapon?: WeaponEntity) {
        Object.assign(this, weapon);
    }
}