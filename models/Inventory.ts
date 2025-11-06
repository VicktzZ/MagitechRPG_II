import { Weapon, Item, Armor } from '@models';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Inventory {
    @ValidateNested({ each: true })
    @Type(() => Item)
        items: Item[] = [];
    
    @ValidateNested({ each: true })
    @Type(() => Weapon)
        weapons: Weapon[] = [];
    
    @ValidateNested({ each: true })
    @Type(() => Armor)
        armors: Armor[] = [];
    
    @IsNumber() money: number = 0;

    constructor(inventory?: Inventory) {
        Object.assign(this, inventory)
    }
}