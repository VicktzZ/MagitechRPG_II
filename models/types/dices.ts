import type { Attributes, Expertises } from '@models';

export interface RollResult {
    dice: Dice
    rolls: number[]
    total: number
    modifiersResult: Array<{ name: string; value: number }>
    allRolls: number[]
    rollCount: number
}

export interface Dice {
    id: string
    name: string
    description?: string
    dices: DiceConfig[]
    modifiers: Array<{
        attribute?: keyof Attributes
        expertise?: keyof Expertises
        bonus?: number
    }>
    effects?: DiceEffect[]
    color?: string
    createdAt: string
    lastRolled?: string
}

export type DiceEffectOperation = 'increase' | 'decrease'
export type DiceEffectTarget = 'lp' | 'mp' | 'ap' | 'ammo'
export type DiceEffectType = 'result' | 'constant' | 'variable'

export interface DiceEffect {
    operation: DiceEffectOperation
    type: DiceEffectType
    target: DiceEffectTarget
    value?: number // Usado quando type === 'constant'
    variableValue?: number // Usado quando type === 'variable' e está rolando o dado
}

export interface DiceConfig {
    faces: number
    quantity: number
}