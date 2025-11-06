import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { Attributes } from './Attributes'
import { Spell } from './entities/Spell'
import { Expertises } from './Expertises'
import { Skill } from './Skill'
import { Stats } from './Stats'

export class Creature {
    @IsString() id: string = uuidv4()
    @IsString() name: string
    @IsString() description: string
    @IsNumber() level: number = 0

    @ValidateNested({ each: true })
    @Type(() => Skill)
    @IsArray()
    @IsOptional()
        skills?: Skill[]

    @ValidateNested({ each: true })
    @Type(() => Spell)
    @IsArray()
    @IsOptional()
        spells?: Spell[]

    @ValidateNested()
    @Type(() => Attributes)
        attributes: Attributes;
    
    @ValidateNested()
    @Type(() => Stats)
        stats: Stats;

    @ValidateNested()
    @Type(() => Expertises)
        expertises: Expertises;

    constructor(creature?: Creature) {
        Object.assign(this, creature)
    }
}
