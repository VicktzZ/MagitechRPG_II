import { IsEnum, IsNumber, IsString } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import type { RarityType } from './types/string';
import type { ItemTypes } from './types/misc';

export class BaseItem {
    @IsString() id: string = uuidv4();
    @IsString() name: string = '';
    @IsString() description: string = '';
    @IsString() rarity: RarityType = 'Comum';
    @IsEnum([ 'item', 'weapon', 'armor' ]) type: ItemTypes = 'item';
    @IsNumber() weight: number = 0;
    @IsNumber() quantity: number = 1;

    constructor(item?: BaseItem) {
        Object.assign(this, item)
    }
}