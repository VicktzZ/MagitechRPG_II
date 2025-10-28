import { BaseItem } from './BaseItem';
import { IsArray, IsNumber, IsString } from 'class-validator';
import type { ItemTypes } from './types/misc';
import type { ArmorAccessoriesType, ArmorType } from './types/string';

export class Armor extends BaseItem {
    type: ItemTypes = 'armor';
    
    @IsString() kind: ArmorType;
    @IsString() categ: 'Leve' | 'Média' | 'Pesada';
    @IsNumber() value: number = 0;
    @IsNumber() displacementPenalty: number = 0;
    
    @IsArray() 
    @IsString({ each: true })
        accessories: ArmorAccessoriesType[] = [];

    constructor(armor?: Armor) {
        super(armor)
        Object.assign(this, armor)
    }
}