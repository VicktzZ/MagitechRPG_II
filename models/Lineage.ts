import { Item } from './Item'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Skill } from './Skill'
import type { LineageNames } from './types/string'

export class Lineage {
    @IsString() name: LineageNames
    @IsString() description: string
    @IsArray() effects: number[]

    @ValidateNested()
    @Type(() => Skill)
        skill?: Skill
    
    @ValidateNested()
    @Type(() => Item)
        item: Item

    constructor(lineage: Lineage) {
        Object.assign(this, lineage)
    }
}