import { BaseCharsheet, Race, Trait, type Skill } from '@models';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { SpellDTO } from './SpellDTO';

export class CharsheetDTO extends BaseCharsheet {
    @IsObject() skills: { lineage: Skill[]; class: Skill[]; subclass: Skill[]; bonus: Skill[]; powers: Array<Partial<Skill>>; race: Skill[]; };

    @ValidateNested({ each: true })
    @Type(() => SpellDTO)
    @IsArray() 
        spells: SpellDTO[] = [];

    @IsArray()
    @IsString({ each: true })
        traits: string[] = [];

    constructor(charsheet: CharsheetDTO) {
        super();
        Object.assign(this, charsheet);
    }
}