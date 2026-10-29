import { v4 as uuidv4 } from 'uuid'
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CombatEffect } from './CombatEffect'

/** Magia sustentada mantida por um jogador em combate (ver `utils/combat/sustainedSpells.ts`) */
export interface SustainedSpellInfo {
    /** Id da magia (nome, se não tiver id) */
    spellKey: string
    spellName: string
    /** Estágio conjurado */
    stage: number
    /** Custo total de MP do estágio conjurado */
    cost: number
    /** MP pago a cada rodada para manter a magia: metade do custo, arredondada para baixo */
    upkeep: number
}

/** Efeito que vem de uma habilidade de classe ou subclasse (ver `utils/combat/passives`): a passiva derivada da ficha ou a habilidade ativada */
export interface AbilityEffectInfo {
    /** Chave da habilidade no catálogo (`class:cura interior`) */
    key: string;
    /** A variação escolhida, quando a habilidade tem (Postura Bestial) */
    choiceId?: string;
}

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

    /** Presente quando o efeito é uma magia sustentada (não tica; sai ao desconjurar, ao faltar MP ou ao fim do combate) */
    @IsOptional()
        sustained?: SustainedSpellInfo

    /** Presente quando o efeito vem de uma habilidade de classe/subclasse: `passive` é derivado da ficha (nunca é gravado), `ability` é a habilidade ativada pelo jogador */
    @IsOptional()
        ability?: AbilityEffectInfo

    @IsOptional()
        passive?: AbilityEffectInfo

    constructor(applied?: Partial<AppliedEffect>) {
        Object.assign(this, applied)
    }
}
