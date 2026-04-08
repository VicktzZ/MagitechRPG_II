import type { DamageType } from '@models/types/string'

export type EffectName = 
    // Damage & Healing
    'Queimadura' |
    'Necrose' |
    'Sangramento' |
    'Envenenamento' |
    'Radiação' |
    'Regeneração' |
    
    // Debuff
    'Congelamento' |
    'Eletrização' |
    'Paralisia' |
    'Atordoamento' |
    'Silenciamento' |
    'Cegueira' |
    'Furtivo' |
    'Exaustão' |
    'Enfraquecimento' |
    'Vulnerável' |
    'Fragilidade' |
    'Incurável' |
    'Medo' |

    // Buff
    'Velocidade' |
    'Invisível' |
    'Visão na Penumbra' |
    'Visão Verdadeira' |
    `Resistência (${DamageType})` |
    'Sobrecura' |
    'Sobremana' |
    'Precisão' |
    'Evasão'

export interface Effect {
    name: EffectName
    duration: number
    stage: number
    stackable: boolean
    maxStacks: number
}
