/**
 * Processa e aplica os efeitos de perks ao charsheet
 */

interface PerkEffect {
    type: 'add' | 'multiply' | 'heal' | 'reduce' | 'set'
    target: string
    value: number | string
    description?: string
    expertiseName?: string
}

interface ApplyEffectsOptions {
    effects: PerkEffect[]
    currentCharsheet: any
    campaignCode: string
}

interface ApplyEffectsResult {
    updates: Record<string, any>
    messages: string[]
}

/**
 * Obtém o valor de um campo aninhado do objeto
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Parseia o valor do efeito para número
 * Suporta strings como "1d6+1" (retorna 0 para valores não numéricos)
 */
function parseEffectValue(value: number | string): number {
    if (typeof value === 'number') return value
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
}

/**
 * Aplica os efeitos de um perk ao charsheet
 * @param options - Opções contendo effects, currentCharsheet e campaignCode
 * @returns Objeto com updates para o Firestore e mensagens de resultado
 */
export function applyPerkEffects(options: ApplyEffectsOptions): ApplyEffectsResult {
    const { effects, currentCharsheet } = options
    const updates: Record<string, any> = {}
    const messages: string[] = []
    
    if (!effects || !Array.isArray(effects) || effects.length === 0) {
        return { updates, messages }
    }
    
    for (const effect of effects) {
        const { type, target, value  } = effect
        const numericValue = parseEffectValue(value)
        
        console.log(`[applyPerkEffects] Processando efeito: type=${type}, target=${target}, value=${value}`)
        
        try {
            switch (type) {
            case 'add': {
                const result = processAddEffect(target, numericValue, currentCharsheet)
                if (result.update) {
                    Object.assign(updates, result.update)
                }
                if (result.message) {
                    messages.push(result.message)
                }
                break
            }
                
            case 'multiply': {
                const result = processMultiplyEffect(target, numericValue, currentCharsheet)
                if (result.update) {
                    Object.assign(updates, result.update)
                }
                if (result.message) {
                    messages.push(result.message)
                }
                break
            }
                
            case 'heal': {
                const result = processHealEffect(target, numericValue, currentCharsheet)
                if (result.update) {
                    Object.assign(updates, result.update)
                }
                if (result.message) {
                    messages.push(result.message)
                }
                break
            }
                
            case 'reduce': {
                // Reduce é como multiply mas semanticamente diferente (valor < 1)
                const result = processMultiplyEffect(target, numericValue, currentCharsheet)
                if (result.update) {
                    Object.assign(updates, result.update)
                }
                if (result.message) {
                    messages.push(result.message.replace('multiplicado', 'reduzido'))
                }
                break
            }
                
            case 'set': {
                const result = processSetEffect(target, numericValue)
                if (result.update) {
                    Object.assign(updates, result.update)
                }
                if (result.message) {
                    messages.push(result.message)
                }
                break
            }
                
            default:
                console.warn(`[applyPerkEffects] Tipo de efeito desconhecido: ${type}`)
            }
        } catch (error) {
            console.error('[applyPerkEffects] Erro ao processar efeito:', error)
        }
    }
    
    console.log('[applyPerkEffects] Updates gerados:', updates)
    console.log('[applyPerkEffects] Mensagens:', messages)
    
    return { updates, messages }
}

interface EffectResult {
    update: Record<string, any> | null
    message: string | null
}

/**
 * Processa efeito do tipo 'add'
 */
function processAddEffect(
    target: string,
    value: number,
    charsheet: any
): EffectResult {
    // Mapeamento de targets conhecidos
    const targetMappings: Record<string, () => EffectResult> = {
        // Dinheiro
        'money': () => {
            const current = charsheet?.money || 0
            return { 
                update: { money: current + value }, 
                message: `+${value} de dinheiro` 
            }
        },
        'inventory.money': () => {
            const current = charsheet?.inventory?.money || 0
            return { 
                update: { 'inventory.money': current + value }, 
                message: `+${value} de dinheiro` 
            }
        },
        
        // Redução de dano
        'damageReduction': () => {
            const current = charsheet?.damageReduction || 0
            return { 
                update: { damageReduction: current + value }, 
                message: `+${value} de redução de dano` 
            }
        },
        
        // Deslocamento
        'displacement': () => {
            const current = charsheet?.displacement || 9
            return { 
                update: { displacement: current + value }, 
                message: `+${value}m de deslocamento` 
            }
        },
        
        // Espaços de magia
        'spellSpace': () => {
            const current = charsheet?.spellSpace || 0
            return { 
                update: { spellSpace: current + value }, 
                message: `+${value} espaço(s) de magia` 
            }
        },
        
        // Capacidade de peso
        'capacity.max': () => {
            const current = charsheet?.capacity?.max || 0
            return { 
                update: { 'capacity.max': current + value }, 
                message: `+${value}kg de capacidade` 
            }
        },
        
        // Limite de MP
        'mpLimit': () => {
            const current = charsheet?.mpLimit || 0
            return { 
                update: { mpLimit: current + value }, 
                message: `+${value} de limite de MP` 
            }
        }
    }
    
    // Verifica se é um target mapeado
    if (targetMappings[target]) {
        return targetMappings[target]()
    }
    
    // Expertises (ex: "expertises.Luta", "expertises.Pontaria")
    if (target.startsWith('expertises.')) {
        const expertiseName = target.replace('expertises.', '')
        const current = charsheet?.expertises?.[expertiseName]?.value || 0
        return { 
            update: { [`expertises.${expertiseName}.value`]: current + value }, 
            message: `+${value} em ${expertiseName}` 
        }
    }
    
    // Stats (ex: "stats.lp", "stats.maxLp", "stats.mp", "stats.maxMp", "stats.ap")
    if (target.startsWith('stats.')) {
        const statName = target.replace('stats.', '')
        const currentStats = charsheet?.stats || {}
        const current = currentStats[statName] || 0
        
        // Mensagem mais descritiva
        const labelMap: Record<string, string> = {
            'lp': 'LP',
            'mp': 'MP',
            'ap': 'AP',
            'maxLp': 'LP máximo',
            'maxMp': 'MP máximo',
            'maxAp': 'AP máximo'
        }
        const label = labelMap[statName] || statName
        
        return { 
            update: { [`stats.${statName}`]: current + value }, 
            message: `+${value} ${label}` 
        }
    }
    
    // Atributos (ex: "attributes.for", "attributes.log")
    if (target.startsWith('attributes.')) {
        const attrName = target.replace('attributes.', '')
        const current = charsheet?.attributes?.[attrName] || 0
        return { 
            update: { [`attributes.${attrName}`]: current + value }, 
            message: `+${value} em ${attrName.toUpperCase()}` 
        }
    }
    
    // Target genérico - tenta resolver o path diretamente
    const current = getNestedValue(charsheet, target) || 0
    return { 
        update: { [target]: current + value }, 
        message: `+${value} em ${target}` 
    }
}

/**
 * Processa efeito do tipo 'multiply'
 */
function processMultiplyEffect(
    target: string,
    value: number,
    charsheet: any
): EffectResult {
    // Stats
    if (target.startsWith('stats.')) {
        const statName = target.replace('stats.', '')
        const current = charsheet?.stats?.[statName] || 0
        const newValue = Math.floor(current * value)
        return { 
            update: { [`stats.${statName}`]: newValue }, 
            message: `${statName} multiplicado por ${value} (${current} → ${newValue})` 
        }
    }
    
    // Target genérico
    const current = getNestedValue(charsheet, target) || 0
    const newValue = Math.floor(current * value)
    return { 
        update: { [target]: newValue }, 
        message: `${target} multiplicado por ${value} (${current} → ${newValue})` 
    }
}

/**
 * Processa efeito do tipo 'heal'
 * 'heal' funciona como 'add' - adiciona o valor ao stat atual
 * Suporta targets: 'lp', 'mp', 'stats.lp', 'stats.mp', 'stats.maxLp', 'stats.maxMp', etc.
 */
function processHealEffect(
    target: string,
    value: number,
    charsheet: any
): EffectResult {
    const stats = charsheet?.stats || {}
    
    // Normaliza o target removendo 'stats.' se presente
    const normalizedTarget = target.startsWith('stats.') ? target.replace('stats.', '') : target
    
    // Determina o stat a ser modificado e se é um max stat
    const isMaxStat = normalizedTarget.startsWith('max')
    const baseStat = isMaxStat ? normalizedTarget.toLowerCase().replace('max', '') : normalizedTarget
    
    // LP ou maxLp
    if (baseStat === 'lp') {
        if (isMaxStat) {
            // Aumenta maxLp
            const currentMaxLp = stats.maxLp || stats.lp || 100
            const newMaxLp = currentMaxLp + value
            
            return { 
                update: { 'stats.maxLp': newMaxLp }, 
                message: `+${value} LP máximo (${currentMaxLp} → ${newMaxLp})` 
            }
        } else {
            // Cura LP (limitado ao máximo)
            const currentLp = stats.lp || 0
            const maxLp = stats.maxLp || 100
            const newLp = Math.min(currentLp + value, maxLp)
            const healed = newLp - currentLp
            
            return { 
                update: { 'stats.lp': newLp }, 
                message: `Curado ${healed} LP (${currentLp} → ${newLp})` 
            }
        }
    }
    
    // MP ou maxMp
    if (baseStat === 'mp') {
        if (isMaxStat) {
            // Aumenta maxMp
            const currentMaxMp = stats.maxMp || stats.mp || 50
            const newMaxMp = currentMaxMp + value
            
            return { 
                update: { 'stats.maxMp': newMaxMp }, 
                message: `+${value} MP máximo (${currentMaxMp} → ${newMaxMp})` 
            }
        } else {
            // Restaura MP (limitado ao máximo)
            const currentMp = stats.mp || 0
            const maxMp = stats.maxMp || 50
            const newMp = Math.min(currentMp + value, maxMp)
            const restored = newMp - currentMp
            
            return { 
                update: { 'stats.mp': newMp }, 
                message: `Restaurado ${restored} MP (${currentMp} → ${newMp})` 
            }
        }
    }
    
    // AP ou maxAp
    if (baseStat === 'ap') {
        if (isMaxStat) {
            const currentMaxAp = stats.maxAp || stats.ap || 5
            const newMaxAp = currentMaxAp + value
            
            return { 
                update: { 'stats.maxAp': newMaxAp }, 
                message: `+${value} AP máximo (${currentMaxAp} → ${newMaxAp})` 
            }
        } else {
            const currentAp = stats.ap || 0
            const maxAp = stats.maxAp || 5
            const newAp = Math.min(currentAp + value, maxAp)
            const restored = newAp - currentAp
            
            return { 
                update: { 'stats.ap': newAp }, 
                message: `Restaurado ${restored} AP (${currentAp} → ${newAp})` 
            }
        }
    }
    
    // Fallback: trata como add genérico para stats
    if (target.startsWith('stats.') || [ 'lp', 'mp', 'ap', 'maxLp', 'maxMp', 'maxAp' ].includes(target)) {
        const statName = target.startsWith('stats.') ? target.replace('stats.', '') : target
        const current = stats[statName] || 0
        const newValue = current + value
        
        return { 
            update: { [`stats.${statName}`]: newValue }, 
            message: `+${value} em ${statName} (${current} → ${newValue})` 
        }
    }
    
    return { update: null, message: null }
}

/**
 * Processa efeito do tipo 'set'
 */
function processSetEffect(
    target: string,
    value: number
): EffectResult {
    // Stats
    if (target.startsWith('stats.')) {
        const statName = target.replace('stats.', '')
        return { 
            update: { [`stats.${statName}`]: value }, 
            message: `${statName} definido para ${value}` 
        }
    }
    
    return { 
        update: { [target]: value }, 
        message: `${target} definido para ${value}` 
    }
}

export type { PerkEffect, ApplyEffectsOptions, ApplyEffectsResult }
