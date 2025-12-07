import type { RangeType, Element } from '@models/types/string'
import { IsArray, IsNumber, IsString } from 'class-validator'

export class SpellDTO {
    @IsString() id?: string
    @IsString() element: Element
    @IsString() name: string
    @IsNumber() level: number = 1
    @IsNumber() mpCost: number = 0
    @IsString() type: string
    @IsString() execution: string
    @IsString() range: RangeType
    @IsArray()
    @IsString({ each: true })
    stages: string[] = []

    constructor(spell?: SpellDTO) {
        Object.assign(this, spell);
    }
}