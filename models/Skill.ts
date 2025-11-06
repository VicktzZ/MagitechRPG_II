import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

export class Skill {
    @IsString()
    @IsOptional()
        id?: string = uuidv4()
    
    @IsString() name: string
    @IsString() description: string
    @IsString() type: 'Poder Mágico' | 'Classe' | 'Linhagem' | 'Subclasse' | 'Bônus' | 'Profissão' | 'Exclusivo' | 'Raça'
    @IsString() origin: string

    @IsNumber() 
    @IsOptional()
        level?: number
    
    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
        effects?: number[]
        
    constructor(skill?: Skill) {
        Object.assign(this, skill)
    }
}