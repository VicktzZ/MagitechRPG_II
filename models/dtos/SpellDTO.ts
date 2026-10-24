import type { RangeType, Element } from '@models/types/string'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

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

    /** Opcional: acréscimo de MP do estágio 2 e do estágio 3, nesta ordem, somado ao `mpCost` (sem o campo vale o padrão do código por nível) */
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
        mpCostIncrease?: number[]

    constructor(spell?: SpellDTO) {
        Object.assign(this, spell);
    }
}