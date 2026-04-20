import { v4 as uuidv4 } from 'uuid'
import { IsArray, IsBoolean, IsHexColor, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export type CombatEffectCategory = 'damage' | 'heal' | 'info' | 'buff' | 'debuff'
export type CombatEffectTiming = 'turn' | 'round'
export type CombatEffectElement =
    | 'fogo'
    | 'agua'
    | 'terra'
    | 'vento'
    | 'luz'
    | 'trevas'
    | 'fisico'
    | 'veneno'
    | 'energia'
    | 'neutro'

export type CombatEffectScope = 'global' | 'campaign'

/**
 * Descreve um modificador estruturado que um efeito aplica.
 *
 * Os `kind`s são consumidos pelo motor de combate e pela UI para exibir os
 * impactos mecânicos de um efeito, mesmo que a aplicação automática em
 * cálculos de ataque/defesa ainda não esteja 100% plugada para todos eles.
 */
export type CombatEffectModifierKind =
    | 'stat_bonus'           // +N em um target (ex: 'displacement', 'maxLp', 'initiative', 'ap')
    | 'stat_penalty'         // -N em um target
    | 'damage_resistance'    // reduz dano recebido (em % ou absoluto); pode ser elemental
    | 'damage_vulnerability' // aumenta dano recebido (em % ou absoluto); pode ser elemental
    | 'damage_dealt_bonus'   // aumenta dano causado
    | 'damage_dealt_penalty' // reduz dano causado (enfraquecimento)
    | 'advantage'            // vantagem em testes do target ('attack','dodge','initiative','stealth'...)
    | 'disadvantage'         // desvantagem em testes
    | 'skip_turn'            // perde a próxima ação / turno
    | 'no_healing'           // bloqueia cura
    | 'no_actions'           // bloqueia ações (paralisia)
    | 'no_spells'            // bloqueia magias (silenciamento)
    | 'overflow_stat'        // permite ultrapassar max (sobrecura, sobremana)
    | 'flag'                 // marcador sem valor numérico (invisible, stealth, true_sight, dim_vision)

export class CombatEffectModifier {
    @IsString() kind: CombatEffectModifierKind

    @IsOptional()
    @IsString()
        target?: string       // path livre: 'maxLp', 'displacement', 'attack', 'lp', 'mp', 'stealth', 'initiative'...

    @IsOptional()
        value?: number | string // '-20%', '+5', 2, 'invisible'

    @IsOptional()
    @IsString()
        element?: CombatEffectElement // quando relevante (resistência/vulnerabilidade elemental)

    @IsOptional()
    @IsString()
        note?: string

    constructor(mod?: Partial<CombatEffectModifier>) {
        Object.assign(this, mod)
    }
}

export class CombatEffectLevel {
    @IsNumber() level: number

    @IsString() formula: string = '0'

    @IsNumber() duration: number = 1

    @IsOptional()
    @IsString()
        description?: string

    /**
     * Quando `true`, o efeito não tem duração — o valor de `duration` é ignorado
     * e o efeito só é removido manualmente (ex: buffs persistentes).
     */
    @IsOptional()
    @IsBoolean()
        indefinite?: boolean

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CombatEffectModifier)
    @IsArray()
        modifiers?: CombatEffectModifier[]

    constructor(level?: Partial<CombatEffectLevel>) {
        Object.assign(this, level)
    }
}

export interface CombatEffectCustomLabels {
    damage?: string[]
    heal?: string[]
    info?: string[]
    buff?: string[]
    debuff?: string[]
}

export class CombatEffect {
    @IsString() id: string = uuidv4()

    @IsString() name: string

    @IsString() description: string = ''

    @IsString() category: CombatEffectCategory = 'damage'

    @IsString() timing: CombatEffectTiming = 'turn'

    @IsOptional()
    @IsString()
        element?: CombatEffectElement

    @IsHexColor() color: string = '#ff5722'

    @IsString() icon: string = '💥'

    @ValidateNested({ each: true })
    @Type(() => CombatEffectLevel)
    @IsArray()
        levels: CombatEffectLevel[] = []

    /**
     * Quando `false`, este efeito é "simples" (um único conjunto de parâmetros,
     * sem escalonamento). A UI esconde seletor de nível e editores de múltiplos níveis.
     * `true` por padrão para retrocompatibilidade com os efeitos já cadastrados.
     */
    @IsOptional()
    @IsBoolean()
        usesLevels?: boolean

    @IsOptional()
        customLabels?: CombatEffectCustomLabels

    @IsString() scope: CombatEffectScope = 'global'

    @IsOptional()
    @IsString()
        campaignId?: string

    @IsOptional()
    @IsString()
        createdBy?: string

    @IsString() createdAt: string = new Date().toISOString()

    @IsOptional()
    @IsBoolean()
        archived?: boolean

    constructor(effect?: Partial<CombatEffect>) {
        Object.assign(this, effect)
    }
}
