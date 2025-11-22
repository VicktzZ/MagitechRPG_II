import type { RarityType } from '@models/types/string'

export enum EnemyModifierType {
    DAMAGE_BOOST = 'damage_boost',
    HEALING = 'healing',
    STATUS_IMMUNITY = 'status_immunity',
    BLEED_CHANCE = 'bleed_chance',
    SPEED_BOOST = 'speed_boost',
    ARMOR_PENETRATION = 'armor_penetration',
    LIFE_STEAL = 'life_steal',
    AOE_DAMAGE = 'aoe_damage',
    RESISTANCE = 'resistance',
    MULTI_ATTACK = 'multi_attack'
}

export interface EnemyModifierEffect {
    damageMultiplier?: number
    healAmount?: string
    immunityTypes?: string[]
    statusChance?: number
    speedMultiplier?: number
    armorPenetration?: number
    lifeStealPercentage?: number
    aoeRadius?: number
    aoeDamage?: string
    resistanceTypes?: string[]
    resistanceAmount?: number
    additionalAttacks?: number
}

export interface EnemyModifier {
    id: string
    name: string
    description: string
    rarity: RarityType
    modifierType: EnemyModifierType
    effect: EnemyModifierEffect
    duration?: 'permanent' | 'combat' | 'turns'
    turns?: number
    stackable?: boolean
    icon?: string
}

export const defaultEnemyModifiers: Record<RarityType, (() => EnemyModifier)[]> = {
    Comum: [
        () => ({
            id: 'damage_boost_minor',
            name: 'Fúria Fraca',
            description: 'Inimigos causam 25% a mais de dano.',
            rarity: 'Comum',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 1.25
            },
            duration: 'combat',
            stackable: false,
            icon: '⚔️'
        }),
        () => ({
            id: 'speed_boost_minor',
            name: 'Agilidade Aumentada',
            description: 'Inimigos se movem 50% mais rápido.',
            rarity: 'Comum',
            modifierType: EnemyModifierType.SPEED_BOOST,
            effect: {
                speedMultiplier: 1.5
            },
            duration: 'combat',
            stackable: false,
            icon: '💨'
        }),
        () => ({
            id: 'resistance_physical',
            name: 'Resistência Física',
            description: 'Inimigos recebem 25% menos dano de ataques físicos.',
            rarity: 'Comum',
            modifierType: EnemyModifierType.RESISTANCE,
            effect: {
                resistanceTypes: ['Cortante', 'Impactante', 'Perfurante'],
                resistanceAmount: 0.25
            },
            duration: 'combat',
            stackable: false,
            icon: '🛡️'
        })
    ],
    Incomum: [
        () => ({
            id: 'damage_boost_moderate',
            name: 'Fúria Moderada',
            description: 'Inimigos causam 50% a mais de dano.',
            rarity: 'Incomum',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 1.5
            },
            duration: 'combat',
            stackable: false,
            icon: '⚔️'
        }),
        () => ({
            id: 'bleed_100',
            name: 'Lâminas Sanguinárias',
            description: 'Ataques inimigos têm 100% de chance de causar sangramento.',
            rarity: 'Incomum',
            modifierType: EnemyModifierType.BLEED_CHANCE,
            effect: {
                statusChance: 1.0
            },
            duration: 'combat',
            stackable: false,
            icon: '🩸'
        }),
        () => ({
            id: 'life_steal_minor',
            name: 'Drenagem Vital',
            description: 'Inimigos se curam em 25% do dano causado.',
            rarity: 'Incomum',
            modifierType: EnemyModifierType.LIFE_STEAL,
            effect: {
                lifeStealPercentage: 0.25
            },
            duration: 'combat',
            stackable: false,
            icon: '💀'
        }),
        () => ({
            id: 'armor_penetration',
            name: 'Quebra-armaduras',
            description: 'Ataques inimigos ignoram 50% da armadura.',
            rarity: 'Incomum',
            modifierType: EnemyModifierType.ARMOR_PENETRATION,
            effect: {
                armorPenetration: 0.5
            },
            duration: 'combat',
            stackable: false,
            icon: '💥'
        })
    ],
    Raro: [
        () => ({
            id: 'damage_boost_major',
            name: 'Fúria Intensa',
            description: 'Inimigos causam 100% a mais de dano.',
            rarity: 'Raro',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 2.0
            },
            duration: 'combat',
            stackable: false,
            icon: '⚔️'
        }),
        () => ({
            id: 'status_immunity_all',
            name: 'Imunidade Completa',
            description: 'Inimigos são imunes a todos os efeitos de status negativos.',
            rarity: 'Raro',
            modifierType: EnemyModifierType.STATUS_IMMUNITY,
            effect: {
                immunityTypes: ['sangramento', 'envenenamento', 'queimadura', 'congelamento', 'paralisia', 'confusão', 'sono', 'medo']
            },
            duration: 'combat',
            stackable: false,
            icon: '🔰'
        }),
        () => ({
            id: 'healing_on_attack',
            name: 'Regeneração Combativa',
            description: 'Inimigos se curam em 2d6 PV a cada ataque bem-sucedido.',
            rarity: 'Raro',
            modifierType: EnemyModifierType.HEALING,
            effect: {
                healAmount: '2d6'
            },
            duration: 'combat',
            stackable: false,
            icon: '💚'
        }),
        () => ({
            id: 'multi_attack_double',
            name: 'Ataque Duplo',
            description: 'Inimigos podem atacar duas vezes por turno.',
            rarity: 'Raro',
            modifierType: EnemyModifierType.MULTI_ATTACK,
            effect: {
                additionalAttacks: 1
            },
            duration: 'combat',
            stackable: false,
            icon: '⚡'
        })
    ],
    Épico: [
        () => ({
            id: 'damage_boost_extreme',
            name: 'Fúria Devastadora',
            description: 'Inimigos causam 200% a mais de dano.',
            rarity: 'Épico',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 3.0
            },
            duration: 'combat',
            stackable: false,
            icon: '⚔️'
        }),
        () => ({
            id: 'life_steal_major',
            name: 'Drenagem Absoluta',
            description: 'Inimigos se curam em 75% do dano causado.',
            rarity: 'Épico',
            modifierType: EnemyModifierType.LIFE_STEAL,
            effect: {
                lifeStealPercentage: 0.75
            },
            duration: 'combat',
            stackable: false,
            icon: '💀'
        }),
        () => ({
            id: 'aoe_damage_explosion',
            name: 'Explosão Caótica',
            description: 'Ataques inimigos causam dano em área (3m) com 50% do dano principal.',
            rarity: 'Épico',
            modifierType: EnemyModifierType.AOE_DAMAGE,
            effect: {
                aoeRadius: 3,
                aoeDamage: '0.5x'
            },
            duration: 'combat',
            stackable: false,
            icon: '💥'
        }),
        () => ({
            id: 'resistance_all',
            name: 'Resistência Elemental',
            description: 'Inimigos recebem 50% menos dano de todos os tipos elementais.',
            rarity: 'Épico',
            modifierType: EnemyModifierType.RESISTANCE,
            effect: {
                resistanceTypes: ['Fogo', 'Água', 'Terra', 'Ar', 'Eletricidade', 'Luz', 'Trevas'],
                resistanceAmount: 0.5
            },
            duration: 'combat',
            stackable: false,
            icon: '🛡️'
        })
    ],
    Lendário: [
        () => ({
            id: 'damage_boost_legendary',
            name: 'Fúria Divina',
            description: 'Inimigos causam 400% a mais de dano.',
            rarity: 'Lendário',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 5.0
            },
            duration: 'combat',
            stackable: false,
            icon: '⚔️'
        }),
        () => ({
            id: 'multi_attack_triple',
            name: 'Fúria de Ataques',
            description: 'Inimigos podem atacar três vezes por turno.',
            rarity: 'Lendário',
            modifierType: EnemyModifierType.MULTI_ATTACK,
            effect: {
                additionalAttacks: 2
            },
            duration: 'combat',
            stackable: false,
            icon: '⚡'
        }),
        () => ({
            id: 'healing_massive',
            name: 'Regeneração Divina',
            description: 'Inimigos se curam em 4d6 PV a cada ataque bem-sucedido e 2d6 PV por turno.',
            rarity: 'Lendário',
            modifierType: EnemyModifierType.HEALING,
            effect: {
                healAmount: '4d6'
            },
            duration: 'combat',
            stackable: false,
            icon: '💚'
        }),
        () => ({
            id: 'ultimate_combination',
            name: 'Poder Supremo',
            description: 'Inimigos causam 200% a mais de dano, têm 100% de chance de sangramento e se curam em 50% do dano.',
            rarity: 'Lendário',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 3.0,
                lifeStealPercentage: 0.5
            },
            duration: 'combat',
            stackable: false,
            icon: '👑'
        })
    ],
    Único: [
        () => ({
            id: 'god_mode',
            name: 'Modo Deus',
            description: 'Inimigos causam 1000% a mais de dano, são imunes a todos os status, se curam em 100% do dano e atacam 4 vezes por turno.',
            rarity: 'Único',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 11.0,
                lifeStealPercentage: 1.0,
                additionalAttacks: 3
            },
            duration: 'combat',
            stackable: false,
            icon: '🌟'
        })
    ],
    Mágico: [
        () => ({
            id: 'magical_affinity',
            name: 'Afinidade Arcana',
            description: 'Inimigos causam 100% a mais de dano mágico e são imunes a magias de controle.',
            rarity: 'Mágico',
            modifierType: EnemyModifierType.DAMAGE_BOOST,
            effect: {
                damageMultiplier: 2.0
            },
            duration: 'combat',
            stackable: false,
            icon: '✨'
        })
    ],
    Especial: [
        () => ({
            id: 'adaptive_evolution',
            name: 'Evolução Adaptativa',
            description: 'Inimigos se adaptam ao tipo de dano recebido, ganhando 25% de resistência após serem atingidos.',
            rarity: 'Especial',
            modifierType: EnemyModifierType.RESISTANCE,
            effect: {
                resistanceAmount: 0.25
            },
            duration: 'combat',
            stackable: true,
            icon: '🧬'
        })
    ],
    Amaldiçoado: [
        () => ({
            id: 'cursed_blood',
            name: 'Sangue Amaldiçoado',
            description: 'Inimigos causam dano vampírico: curam-se em 150% do dano mas morrem em 3 turnos.',
            rarity: 'Amaldiçoado',
            modifierType: EnemyModifierType.LIFE_STEAL,
            effect: {
                lifeStealPercentage: 1.5
            },
            duration: 'turns',
            turns: 3,
            stackable: false,
            icon: '🩸'
        })
    ]
}

// Função para obter modificadores aleatórios baseados na raridade
export function getRandomEnemyModifier(difficulty: number = 1): EnemyModifier | null {
    const roll = Math.random() * 100
    let rarity: RarityType = 'Comum'
    
    if (roll < 60) rarity = 'Comum'
    else if (roll < 80) rarity = 'Incomum'
    else if (roll < 90) rarity = 'Raro'
    else if (roll < 96) rarity = 'Épico'
    else if (roll < 99) rarity = 'Lendário'
    else if (roll < 99.5) rarity = 'Mágico'
    else if (roll < 99.8) rarity = 'Especial'
    else if (roll < 99.9) rarity = 'Amaldiçoado'
    else rarity = 'Único'
    
    const modifiers = defaultEnemyModifiers[rarity]
    if (!modifiers || modifiers.length === 0) return null
    
    // Ajuste baseado na dificuldade
    const availableModifiers = modifiers.filter(mod => {
        const modRarityIndex = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mágico', 'Especial', 'Amaldiçoado', 'Único'].indexOf(rarity)
        return modRarityIndex <= difficulty + 2 // Permite modificadores até 2 níveis acima da dificuldade
    })
    
    if (availableModifiers.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * availableModifiers.length)
    return availableModifiers[randomIndex]()
}

// Função para aplicar múltiplos modificadores baseados na onda/dificuldade
export function getEnemyModifiersForWave(wave: number, maxModifiers: number = 3): EnemyModifier[] {
    const modifiers: EnemyModifier[] = []
    const difficulty = Math.floor(wave / 5) + 1
    
    // Número de modificadores baseado na onda
    const numModifiers = Math.min(Math.max(1, Math.floor(wave / 3)), maxModifiers)
    
    for (let i = 0; i < numModifiers; i++) {
        const modifier = getRandomEnemyModifier(difficulty)
        if (modifier && !modifiers.find(m => m.id === modifier.id)) {
            modifiers.push(modifier)
        }
    }
    
    return modifiers
}

// Função para verificar se modificadores são compatíveis
export function areModifiersCompatible(modifiers: EnemyModifier[]): boolean {
    // Verifica se há modificadores conflitantes
    const damageBoosts = modifiers.filter(m => m.modifierType === EnemyModifierType.DAMAGE_BOOST)
    if (damageBoosts.length > 1) return false // Múltiplos boosts de dano não se acumulam
    
    const multiAttacks = modifiers.filter(m => m.modifierType === EnemyModifierType.MULTI_ATTACK)
    if (multiAttacks.length > 1) return false // Múltiplos ataques extras não se acumulam
    
    return true
}

// Função para combinar efeitos de modificadores
export function combineModifierEffects(modifiers: EnemyModifier[]): EnemyModifierEffect {
    const combined: EnemyModifierEffect = {}
    
    modifiers.forEach(modifier => {
        const effect = modifier.effect
        
        // Combina multiplicadores de dano (soma o maior)
        if (effect.damageMultiplier && (!combined.damageMultiplier || effect.damageMultiplier > combined.damageMultiplier)) {
            combined.damageMultiplier = effect.damageMultiplier
        }
        
        // Combina vida extra (soma)
        if (effect.lifeStealPercentage) {
            combined.lifeStealPercentage = (combined.lifeStealPercentage || 0) + effect.lifeStealPercentage
        }
        
        // Combina ataques extras (soma)
        if (effect.additionalAttacks) {
            combined.additionalAttacks = (combined.additionalAttacks || 0) + effect.additionalAttacks
        }
        
        // Combina imunidades (união)
        if (effect.immunityTypes) {
            combined.immunityTypes = [...(combined.immunityTypes || []), ...effect.immunityTypes].filter((v, i, a) => a.indexOf(v) === i)
        }
        
        // Combina resistências (mantém a maior)
        if (effect.resistanceAmount && (!combined.resistanceAmount || effect.resistanceAmount > combined.resistanceAmount)) {
            combined.resistanceAmount = effect.resistanceAmount
            combined.resistanceTypes = effect.resistanceTypes
        }
        
        // Outros efeitos específicos
        if (effect.healAmount && !combined.healAmount) {
            combined.healAmount = effect.healAmount
        }
        if (effect.statusChance && !combined.statusChance) {
            combined.statusChance = effect.statusChance
        }
        if (effect.speedMultiplier && !combined.speedMultiplier) {
            combined.speedMultiplier = effect.speedMultiplier
        }
        if (effect.armorPenetration && !combined.armorPenetration) {
            combined.armorPenetration = effect.armorPenetration
        }
        if (effect.aoeRadius && !combined.aoeRadius) {
            combined.aoeRadius = effect.aoeRadius
            combined.aoeDamage = effect.aoeDamage
        }
    })
    
    return combined
}