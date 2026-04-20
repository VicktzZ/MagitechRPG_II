import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import type { RarityType } from './types/string'

export class Skill {
    @IsString()
    @IsOptional()
        id?: string = uuidv4()
    
    @IsString() name: string
    @IsString() description: string
    @IsString() type: 'Poder Mágico' | 'Classe' | 'Linhagem' | 'Subclasse' | 'Bônus' | 'Profissão' | 'Exclusivo' | 'Raça' | 'Talento'
    @IsString() origin: string

    @IsNumber() 
    @IsOptional()
        level?: number
    
    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
        effects?: number[]

    @IsString()
    @IsOptional()
        rarity?: RarityType

    constructor(skill?: Skill) {
        Object.assign(this, skill)
    }
}