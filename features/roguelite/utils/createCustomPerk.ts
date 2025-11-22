import { create, type RandomSeed } from 'random-seed'
import { genericCustomPerks } from '../consts/genericCustomPerks'
import { Perk } from '../models'
import type { RarityType } from '@models/types/string'
import { EXPERTISE_WEIGHTS } from '../consts/expertisesWeight'
import { rollRarity } from './perkRarityRoller'

const ALL_EXPERTISES = Object.keys(EXPERTISE_WEIGHTS)

/**
 * Cria um perk customizado baseado no nome e raridade
 * @param perkName - Nome do perk base
 * @param rarity - Raridade desejada (opcional, será gerada automaticamente se não fornecida)
 * @param seed - Semente para geração aleatória (opcional)
 * @returns Perk customizado com valores baseados na raridade
 */
export function createCustomPerk(
    perkName: keyof typeof genericCustomPerks, 
    rarity?: RarityType,
    seed?: string
): Perk {
    const basePerk = genericCustomPerks[perkName]
    const rng = seed ? create(seed) : create()
    
    if (!basePerk) {
        throw new Error(`Perk "${perkName}" não encontrado em genericCustomPerks`)
    }

    // Gera raridade automaticamente se não fornecida
    const finalRarity = rarity ?? rollRarity(rng)

    // Cria cópia do perk base
    const customPerk = new Perk({ ...basePerk })
    customPerk.rarity = finalRarity

    // Aplica modificações baseadas no tipo de perk
    switch (perkName) {
    case 'Cura instantânea':
        return createCustomHealPerk(customPerk, finalRarity)
    case 'Especialização':
        return createCustomExpertisePerk(customPerk, finalRarity, rng)
    default:
        return customPerk
    }
}

/**
 * Cria um perk de cura com valores baseados na raridade
 */
function createCustomHealPerk(basePerk: Perk, rarity: RarityType): Perk {
    const healValues = {
        Comum: 10,
        Incomum: 20,
        Raro: 30,
        Épico: 40,
        Lendário: 50
    }

    const healValue = healValues[rarity] || 10
    
    basePerk.description = `Cura ${healValue} de LP.`
    basePerk.effects = [
        {
            type: 'heal',
            target: 'lp',
            value: healValue,
            description: `Cura instantânea de ${healValue} pontos de vida`
        }
    ]

    return basePerk
}

/**
 * Cria um perk de especialização com expertise aleatória e valores baseados na raridade
 */
function createCustomExpertisePerk(basePerk: Perk, rarity: RarityType, rng: RandomSeed): Perk {
    const expertiseValues = {
        Comum: 1,
        Incomum: 2,
        Raro: 3,
        Épico: 4,
        Lendário: 5
    }

    const expertiseValue = expertiseValues[rarity] || 1
    
    // Seleciona expertise aleatória baseada nos pesos
    const selectedExpertise = selectRandomExpertise(rng)
    
    basePerk.name = `Especialização em ${selectedExpertise}`
    basePerk.description = `Aumenta o bônus de ${selectedExpertise} em +${expertiseValue}.`
    basePerk.effects = [
        {
            type: 'add',
            target: 'expertise',
            value: expertiseValue,
            expertiseName: selectedExpertise,
            description: `Aumenta o bônus de ${selectedExpertise} em +${expertiseValue}`
        }
    ]

    return basePerk
}

/**
 * Seleciona uma expertise aleatória baseada nos pesos
 */
function selectRandomExpertise(rng: RandomSeed): string {
    const totalWeight = Object.values(EXPERTISE_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
    let roll = rng(totalWeight)
    
    for (const [expertise, weight] of Object.entries(EXPERTISE_WEIGHTS)) {
        roll -= weight
        if (roll <= 0) {
            return expertise
        }
    }
    
    // Fallback
    return ALL_EXPERTISES[0]
}

/**
 * Obtém todos os nomes de perks customizados disponíveis
 */
export function getAvailableCustomPerks(): string[] {
    return Object.keys(genericCustomPerks)
}

/**
 * Obtém todas as expertises disponíveis
 */
export function getAllExpertises(): string[] {
    return [...ALL_EXPERTISES]
}