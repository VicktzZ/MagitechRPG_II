import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { Attributes } from './Attributes'
import { Spell } from './entities/Spell'
import { Expertises } from './Expertises'
import { Skill } from './Skill'
import { Stats } from './Stats'
import type { Effect } from '@features/pipelines/types/effects'
import type { Element } from './types/string'
import type { DamageModifierData } from '../utils/combat/creatureDefense'

export class Creature {
    @IsString() id: string = uuidv4()
    @IsString() name: string
    @IsString() description: string
    @IsNumber() level: number = 0

    /** Categoria da criatura (ex: Fera, Humanoide, Morto-vivo) — livre */
    @IsString() @IsOptional() type?: string

    /** URL de imagem/retrato da criatura */
    @IsString() @IsOptional() imageUrl?: string

    @ValidateNested({ each: true })
    @Type(() => Skill)
    @IsArray()
    @IsOptional()
        skills?: Skill[]

    @ValidateNested({ each: true })
    @Type(() => Spell)
    @IsArray()
    @IsOptional()
        spells?: Spell[]

    @ValidateNested()
    @Type(() => Attributes)
        attributes: Attributes;
    
    @ValidateNested()
    @Type(() => Stats)
        stats: Stats;
    
    /** Elemento da criatura: dá a ela a fraqueza do elemento que o vence (ver `utils/combat/engine/weakness.ts`) */
    @IsString() elementalMastery: Element = '' as unknown as Element;

    /** Fraquezas declaradas (elementos ou tipos físicos como "Cortante"); somam-se à do elemento. Só o mestre vê (`utils/combat/creatureDefense.ts`) */
    @IsArray() @IsOptional() weaknesses?: string[];

    /** Resistências e vulnerabilidades ao dano recebido (`{ kind, element?, value: '25%' | '3' }`). Só o mestre vê */
    @IsArray() @IsOptional() damageModifiers?: DamageModifierData[];
    
    @IsArray()
    @IsOptional()
        effects: Effect[] = [];

    @ValidateNested()
    @Type(() => Expertises)
        expertises: Expertises;

    constructor(creature?: Creature) {
        Object.assign(this, creature)
    }
}
