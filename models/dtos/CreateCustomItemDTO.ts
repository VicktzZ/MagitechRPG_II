import { Armor, Item, Weapon } from '@models';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class CreateCustomItemDTO {
    @IsString() type: 'weapon' | 'armor' | 'item';
    @ValidateNested()
    @Type(() => Weapon)
    @Type(() => Armor)
    @Type(() => Item)
        item: Weapon | Armor | Item;
}