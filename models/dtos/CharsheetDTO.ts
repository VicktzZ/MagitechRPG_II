import { BaseCharsheet, Race, Trait, type Skill } from '@models';
import { Type } from 'class-transformer';
import { IsArray, IsObject, ValidateNested } from 'class-validator';
import { SpellDTO } from './SpellDTO';

export class CharsheetDTO extends BaseCharsheet {
    @IsObject() skills: { lineage: Skill[]; class: Skill[]; subclass: Skill[]; bonus: Skill[]; powers: Array<Partial<Skill>>; race: Skill[]; };

    @ValidateNested({ each: true })
    @Type(() => SpellDTO)
    @IsArray() 
        spells: SpellDTO[] = [];

    @ValidateNested()
    @Type(() => Race)
        race: Race;

    @ValidateNested({ each: true })
    @Type(() => Trait)
    @IsArray() 
        traits: Trait[] = [];

    constructor(charsheet: CharsheetDTO) {
        super();
        Object.assign(this, charsheet);
    }
}