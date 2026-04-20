import { v4 as uuidv4 } from 'uuid'
import { type PassiveOccasion } from '@models/types/string'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class Passive {
    @IsString() id: string = uuidv4()
    @IsString() title: string
    @IsString() description: string
    @IsString() occasion: PassiveOccasion
    
    @IsOptional() 
    @IsBoolean()
        custom?: boolean

    constructor(passive: Passive) {
        Object.assign(this, passive)
    }
}