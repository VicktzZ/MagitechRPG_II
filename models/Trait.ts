import { IsNumber, IsObject, IsString } from 'class-validator'
import { type Attributes } from './Attributes'
import { type Expertises } from './Expertises'

export class Trait {
    @IsString() name: string
    @IsNumber() value: number

    @IsObject()
        target: {
            kind: 'attribute',
            name: keyof Attributes
        } | {
            kind: 'expertise',
            name: keyof Expertises
        }

    constructor(trait: Trait) {
        Object.assign(this, trait)
    }
}