/**
 * Calcula o custo adicional de MP baseado no nível da magia e estágio
 */
export function calculateExtraManaCost(magicLevel: number, stage: number): number {
    if (stage === 0) return 0
    
    if (magicLevel === 4) {
        if (stage === 1) return 4
        if (stage === 2) return 9
    } else if (magicLevel === 3) {
        if (stage === 1) return 2
        if (stage === 2) return 5
    } else if (magicLevel === 2) {
        if (stage === 1) return 2
        if (stage === 2) return 4
    } else {
        // Nível 1
        if (stage === 1) return 1
        if (stage === 2) return 2
    }
    
    return 0
}

/**
 * Calcula o custo total de MP (base + extra do estágio)
 */
export function calculateTotalManaCost(baseCost: number, magicLevel: number, stage: number): number {
    return baseCost + calculateExtraManaCost(magicLevel, stage)
}
