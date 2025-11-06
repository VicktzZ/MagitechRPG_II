import { v4 as uuidv4 } from 'uuid'
import { IsArray, IsOptional, IsString } from 'class-validator'
import type { Attributes } from './Attributes'
import type { Expertises } from './Expertises'
import type { DiceConfig, DiceEffect } from './types/dices'

export class Dice {
    @IsString() id: string = uuidv4()
    @IsString() name: string
    @IsString() description?: string
    @IsArray() dices: DiceConfig[]
    @IsString() createdAt: string = new Date().toISOString()
    
    @IsArray() 
    @IsOptional() 
        effects?: DiceEffect[]
    
    @IsString() 
    @IsOptional() 
        color?: string
    
    @IsString() 
    @IsOptional() 
        lastRolled?: string

    @IsArray() modifiers: Array<{
        attribute?: keyof Attributes
        expertise?: keyof Expertises
        bonus?: number
    }> = []

    constructor(dice?: Partial<Dice>) {
        Object.assign(this, dice)
    }

}