import { Skill } from './Skill'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import type { SubclassNames } from './types/string'

export class Subclass {
    @IsString() name: SubclassNames
    @IsString() description: string
    
    @ValidateNested({ each: true })
    @Type(() => Skill)
    @IsArray() 
        skills: Skill[]

    constructor(subclass: Subclass) {
        Object.assign(this, subclass)
    }
}