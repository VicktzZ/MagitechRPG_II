import { Item } from './Item'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Skill } from './Skill'
import type { OccupationNames } from '@models/types/string'

export class Occupation {
    @IsString() name: OccupationNames
    @IsString() description: string
    @IsArray() effects: number[]

    @ValidateNested()
    @Type(() => Skill)
        skill?: Skill
    
    @ValidateNested()
    @Type(() => Item)
        item: Item

    constructor(occupation: Occupation) {
        Object.assign(this, occupation)
    }
}