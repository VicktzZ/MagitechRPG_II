import { BaseItem } from './BaseItem';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import type { ItemTypes } from './types/misc';
import type { ItemType } from './types/string';

export class Item extends BaseItem {
    type: ItemTypes = 'item';
    
    @IsString() name: string;
    @IsString() kind: ItemType;
    @IsNumber() quantity: number = 1;
    
    @IsNumber()
    @IsOptional()
        level?: number;
    
    @IsArray() 
    @IsString({ each: true }) 
        effects: string[] = [];

    constructor(item?: Item) {
        super(item)
        Object.assign(this, item)
    }
}