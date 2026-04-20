import { Type } from 'class-transformer';
import { Skill } from './Skill';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class Race {
    @IsString() name: 'Humano' | 'Ciborgue' | 'Autômato' | 'Humanoide' | 'Mutante' | 'Magia-viva'
    @IsString() description: string
    @IsNumber() effect: number
    
    @ValidateNested()
    @Type(() => Skill)
        skill: Skill

    constructor(race: Race) {
        Object.assign(this, race)
    }
}