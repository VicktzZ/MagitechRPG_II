import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Attributes } from './Attributes';
import { Expertises } from './Expertises';
import { Inventory } from './Inventory';
import { Modificators } from './Modificators';
import { Points } from './Points';
import { Stats } from './Stats';
import { Dice } from './Dice';
import type { ClassNames, FinancialCondition, Gender, LineageNames } from './types/string';
import type { Subclass } from './Subclass';
import { Passive } from './Passive';

export class BaseCharsheet {
    @IsString() id: string;
    @IsString() playerName: string;
    @IsString() userId: string;
    @IsString() @MaxLength(50) name: string;
    @IsString() age: number;
    @IsString() class: ClassNames;
    @IsString() lineage: LineageNames;
    @IsString() anotacoes: string = '';
    @IsString() elementalMastery: string = '';
    @IsString() subclass: Subclass['name'];

    @IsNumber() ORMLevel: number = 0;
    @IsNumber() displacement: number = 9;
    @IsNumber() spellSpace: number = 0;
    @IsNumber() mpLimit: number = 0;
    @IsNumber() overall: number = 0;
    @IsNumber() level: number = 0;

    @IsEnum([ 'Apocalypse', 'Classic' ]) mode: 'Apocalypse' | 'Classic' = 'Classic';
    @IsEnum([ 'Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido' ]) gender: Gender;
    @IsEnum([ 'Miserável', 'Pobre', 'Estável', 'Rico' ]) financialCondition: FinancialCondition;
    
    @IsArray() status: string[] = [];
    
    @ValidateNested({ each: true })
    @Type(() => Dice)
    @IsArray() 
        dices: Dice[] = [];

    @ValidateNested()
    @Type(() => Expertises) 
        expertises: Expertises = new Expertises();

    @ValidateNested({ each: true })
    @Type(() => Inventory)
        inventory: Inventory = new Inventory();

    @ValidateNested()
    @Type(() => Attributes)
        attributes: Attributes = new Attributes();

    @ValidateNested({ each: true })
    @Type(() => Passive)
    @IsArray() 
        passives: Passive[] = [];

    @ValidateNested()
    @Type(() => Stats)
        stats: Stats = new Stats();

    @ValidateNested()
    @Type(() => Modificators)
        mods: Modificators = new Modificators();
    
    @ValidateNested()
    @Type(() => Points)
        points: Points = new Points();

    @IsObject() capacity: {
        cargo: number;
        max: number;
    } = {
            cargo: 0,
            max: 0
        };

    @IsObject() ammoCounter: {
        current: number;
        max: number;
    } = {
            current: 0,
            max: 0
        };

    @IsArray() 
    @IsObject({ each: true })
        session: Array<{
            campaignCode: string;
            stats: {
                maxLp: number;
                maxMp: number;
            }
        }>;

    constructor(charsheet?: BaseCharsheet) {
        Object.assign(this, charsheet)
    }
}