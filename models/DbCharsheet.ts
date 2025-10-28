import { BaseCharsheet } from './BaseCharsheet';
import { IsArray, IsObject, IsString } from 'class-validator';
import type { Skill } from './Skill';
import type { Race } from './Race';

export class DbCharsheet extends BaseCharsheet {
    @IsObject() skills: { lineage: Skill[]; class: Skill[]; subclass: Skill[]; bonus: Skill[]; powers: string[]; race: Skill[]; };
    @IsString() race: Race['name'];
    @IsArray() @IsString({ each: true }) spells: string[] = [];
    @IsArray() @IsString({ each: true }) traits: string[] = [];

    constructor(charsheet?: DbCharsheet) {
        super();
        Object.assign(this, charsheet);
    }
}