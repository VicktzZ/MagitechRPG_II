import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Skill } from './Skill'
import { type ClassNames } from './types/string'

export class Class {
    @IsString() name: ClassNames
    @IsString() description: string

    @IsObject()
        attributes: {
            lp: number
            mp: number
            ap: number
        }

    @IsObject()
        points: {
            expertises: number
            skills?: number
        }

    @ValidateNested({ each: true })
    @Type(() => Skill)
    @IsArray()
        skills: Skill[]

    constructor(_class: Class) {
        Object.assign(this, _class)
    }
}