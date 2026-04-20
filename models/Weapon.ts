import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { BaseItem } from './BaseItem';
import type { AmmoType, DamageType, RangeType, WeaponAccesoriesType, WeaponType, WeaponCategory, WeaponKind } from '@models/types/string';
import type { Attributes } from './Attributes';
import type { ItemTypes } from './types/misc';

export class Weapon extends BaseItem {
    @IsString() type: ItemTypes = 'weapon';
    @IsString() kind: WeaponType = 'Padrão';
    @IsString() categ: WeaponCategory<any>;
    @IsString() range: RangeType;
    @IsString() hit: keyof Attributes;
    @IsString() ammo: AmmoType | 'Não consome' = 'Não consome';
    @IsString() bonus: string;

    @IsString()
    @IsOptional()
        weaponKind?: WeaponKind;
    
    @IsNumber() 
    @IsOptional()
        magazineSize?: number;

    @IsArray()
    @IsString({ each: true }) 
        accessories: WeaponAccesoriesType[] = [];

    @IsObject() effect: {
        value: string;
        critValue: string;
        critChance: number;
        effectType: DamageType | null;
    } = {
            value: '',
            critValue: '',
            critChance: 0,
            effectType: null
        };

    constructor(weapon?: Weapon) {
        super(weapon)
        Object.assign(this, weapon)
    }
}