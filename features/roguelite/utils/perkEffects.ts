// @eslint-disable @typescript-eslint/no-use-before-define
import type { Charsheet } from '@models/entities'
import type { Perk, PerkEffect } from '../models'

/**
 * Aplica os efeitos de um perk na ficha do personagem
 * @param charsheet - Ficha do personagem que receberá o perk
 * @param perk - Perk a ser aplicado
 * @returns Ficha atualizada com os efeitos aplicados
 */
export function assignPerkReward(charsheet: Charsheet, perk: Perk): Charsheet {
    // Se o perk não tem efeitos definidos, retorna a ficha inalterada
    if (!perk.effects || perk.effects.length === 0) {
        return charsheet
    }

    // Clona a ficha para evitar mutação direta
    const updatedCharsheet = { ...charsheet }

    // Aplica cada efeito do perk
    for (const effect of perk.effects) {
        applyEffect(updatedCharsheet, effect)
    }

    return updatedCharsheet
}

/**
 * Aplica um efeito individual na ficha
 * @param charsheet - Ficha do personagem
 * @param effect - Efeito a ser aplicado
 */
function applyEffect(charsheet: Charsheet, effect: PerkEffect): void {
    const { type, target, value } = effect

    switch (type) {
    case 'heal':
        applyHeal(charsheet, target as string, value as number)
        break
    case 'damage':
        applyDamage(charsheet, target as string, value as number)
        break
    case 'add':
        if (target === 'expertise') {
            applyExpertiseEffect(charsheet, effect)
        } else {
            applyAdd(charsheet, target as string, value as number)
        }
        break
    case 'set':
        applySet(charsheet, target as string, value as number)
        break
    case 'multiply':
        applyMultiply(charsheet, target as string, value as number)
        break
    case 'percentage':
        applyPercentage(charsheet, target as string, value as number, effect)
        break
    default:
        console.warn(`Tipo de efeito não reconhecido: ${type}`)
    }
}

/**
 * Aplica cura (não pode exceder o máximo)
 */
function applyHeal(charsheet: Charsheet, target: string, value: number): void {
    const currentValue = charsheet.stats[target as keyof typeof charsheet.stats]
    const maxValue = charsheet.stats[`max${target.charAt(0).toUpperCase()}${target.slice(1)}` as keyof typeof charsheet.stats]
    
    const newValue = Math.min(currentValue + value, maxValue)
    charsheet.stats[target as keyof typeof charsheet.stats] = newValue
}

/**
 * Aplica dano (não pode ser menor que 0)
 */
function applyDamage(charsheet: Charsheet, target: string, value: number): void {
    const currentValue = charsheet.stats[target as keyof typeof charsheet.stats]
    const newValue = Math.max(currentValue - value, 0)
    charsheet.stats[target as keyof typeof charsheet.stats] = newValue
}

/**
 * Adiciona valor ao atributo atual (com validação de limites)
 */
function applyAdd(charsheet: Charsheet, target: string, value: number): void {
    const currentValue = charsheet.stats[target as keyof typeof charsheet.stats]
    
    if (target.startsWith('max')) {
        // Para atributos máximos, permite valores positivos
        const newValue = currentValue + value
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.max(newValue, 0)
    } else {
        // Para atributos atuais, respeita os limites máximos
        const maxKey = `max${target.charAt(0).toUpperCase()}${target.slice(1)}` as keyof typeof charsheet.stats
        const maxValue = charsheet.stats[maxKey]
        const newValue = Math.min(currentValue + value, maxValue)
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.max(newValue, 0)
    }
}

/**
 * Define um valor fixo para o atributo
 */
function applySet(charsheet: Charsheet, target: string, value: number): void {
    if (target.startsWith('max')) {
        // Para atributos máximos, define o valor diretamente
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.max(value, 0)
    } else {
        // Para atributos atuais, respeita o limite máximo
        const maxKey = `max${target.charAt(0).toUpperCase()}${target.slice(1)}` as keyof typeof charsheet.stats
        const maxValue = charsheet.stats[maxKey]
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.min(value, maxValue)
    }
}

/**
 * Multiplica o valor atual do atributo
 */
function applyMultiply(charsheet: Charsheet, target: string, value: number): void {
    const currentValue = charsheet.stats[target as keyof typeof charsheet.stats]
    const newValue = Math.floor(currentValue * value)
    
    if (target.startsWith('max')) {
        // Para atributos máximos, aplica multiplicação diretamente
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.max(newValue, 0)
    } else {
        // Para atributos atuais, respeita o limite máximo
        const maxKey = `max${target.charAt(0).toUpperCase()}${target.slice(1)}` as keyof typeof charsheet.stats
        const maxValue = charsheet.stats[maxKey]
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.min(Math.max(newValue, 0), maxValue)
    }
}

/**
 * Aplica porcentagem ao valor atual do atributo
 * Ex: value: 0.5 = 50% do valor atual
 */
function applyPercentage(charsheet: Charsheet, target: string, value: number, effect: PerkEffect): void {
    const currentValue = charsheet.stats[target as keyof typeof charsheet.stats]
    const newValue = Math.floor(currentValue * value)
    
    // Aplica limites mínimo e máximo se definidos
    const finalValue = Math.max(
        Math.min(newValue, effect.max ?? Infinity),
        effect.min ?? 1
    )
    
    if (target.startsWith('max')) {
        // Para atributos máximos, aplica porcentagem diretamente
        charsheet.stats[target as keyof typeof charsheet.stats] = finalValue
        
        // Se reduziu o máximo, ajusta o valor atual se necessário
        const currentKey = target.slice(3) // Remove "max" do início
        const currentStat = charsheet.stats[currentKey.toLowerCase() as keyof typeof charsheet.stats]
        if (currentStat > finalValue) {
            charsheet.stats[currentKey.toLowerCase() as keyof typeof charsheet.stats] = finalValue
        }
    } else {
        // Para atributos atuais, respeita o limite máximo
        const maxKey = `max${target.charAt(0).toUpperCase()}${target.slice(1)}` as keyof typeof charsheet.stats
        const maxValue = charsheet.stats[maxKey]
        charsheet.stats[target as keyof typeof charsheet.stats] = Math.min(finalValue, maxValue)
    }
}

/**
 * Aplica efeito em uma expertise
 */
function applyExpertiseEffect(charsheet: Charsheet, effect: PerkEffect): void {
    const { value, expertiseName, min, max } = effect
    
    if (!expertiseName) {
        console.warn('Efeito de expertise requer expertiseName')
        return
    }
    
    // Verifica se a expertise existe na ficha
    if (!(expertiseName in charsheet.expertises)) {
        console.warn(`Expertise "${expertiseName}" não encontrada na ficha`)
        return
    }
    
    const expertise = charsheet.expertises[expertiseName as keyof typeof charsheet.expertises]
    const currentValue = expertise.value
    const newValue = currentValue + (value as number)
    
    // Aplica limites mínimo e máximo se definidos
    const finalValue = Math.max(
        Math.min(newValue, max ?? Infinity),
        min ?? 0
    )
    
    expertise.value = finalValue
}

/**
 * Verifica se um perk pode ser aplicado (requisitos de nível, etc.)
 * @param charsheet - Ficha do personagem
 * @param perk - Perk a ser verificado
 * @returns true se o perk pode ser aplicado
 */
export function canApplyPerk(charsheet: Charsheet, perk: Perk): boolean {
    // Verifica requisito de nível
    if (perk.levelRequired && charsheet.level < perk.levelRequired) {
        return false
    }
    
    // TODO: Adicionar outras validações (classe, raça, etc.)
    
    return true
}

/**
 * Obtém descrição dos efeitos que serão aplicados
 * @param perk - Perk a ser analisado
 * @returns Array de descrições dos efeitos
 */
export function getPerkEffectsDescription(perk: Perk): string[] {
    if (!perk.effects || perk.effects.length === 0) {
        return []
    }
    
    return perk.effects.map(effect => {
        const { type, target, value, description } = effect
        
        // Se tiver descrição customizada, usa ela
        if (description) {
            return description
        }
        
        // Gera descrição baseada no tipo e valor
        const targetName = target.toUpperCase()
        switch (type) {
        case 'heal':
            return `Cura ${value} pontos de ${targetName}`
        case 'damage':
            return `Causa ${value} de dano em ${targetName}`
        case 'add':
            return `Adiciona ${value} pontos de ${targetName}`
        case 'set':
            return `Define ${targetName} para ${value}`
        case 'multiply':
            return `Multiplica ${targetName} por ${value}`
        default:
            return `Efeito: ${type} ${target} ${value}`
        }
    })
}
