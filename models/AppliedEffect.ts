import { v4 as uuidv4 } from 'uuid'
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CombatEffect } from './CombatEffect'

export class AppliedEffect {
    @IsString() id: string = uuidv4()

    @IsString() effectId: string

    @ValidateNested()
    @Type(() => CombatEffect)
        snapshot: CombatEffect

    @IsNumber() level: number = 1

    @IsNumber() remaining: number = 0

    /**
     * Quando `true`, o efeito não decrementa ticks e só é removido manualmente.
     * Reflete o flag `indefinite` do `CombatEffectLevel` usado no momento da aplicação,
     * ou pode ser setado por override no `apply_effect`.
     */
    @IsOptional()
    @IsBoolean()
        indefinite?: boolean

    @IsNumber() appliedAtRound: number = 1

    @IsOptional()
    @IsString()
        appliedByName?: string

    @IsOptional()
    @IsString()
        appliedById?: string

    @IsOptional()
    @IsNumber()
        lastTickAtRound?: number

    @IsOptional()
    @IsNumber()
        lastTickAtTurnIndex?: number

    constructor(applied?: Partial<AppliedEffect>) {
        Object.assign(this, applied)
    }
}
