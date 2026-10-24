/**
 * Acréscimo de MP por estágio gravado na própria magia (campo opcional `mpCostIncrease` no banco): a lista tem um número por estágio
 * acima do primeiro, na ordem, ou seja, `[acréscimo do estágio 2, acréscimo do estágio 3]` (um só se a magia tem 2 estágios, nenhum se
 * tem 1). Cada número soma ao custo base `mpCost`. Sem o campo, ou sem o número daquele estágio, vale o acréscimo padrão do código
 * (`calculateExtraManaCost`, que depende do nível da magia).
 */
export type StageCostIncrease = ReadonlyArray<number | string | null | undefined> | null | undefined

/** O acréscimo gravado na magia para este estágio (índice 0 = estágio 1, sem acréscimo), ou `null` se não há número válido para ele */
function storedStageIncrease(increase: StageCostIncrease, stage: number): number | null {
    if (!Array.isArray(increase) || stage < 1) return null
    const value: unknown = increase[stage - 1]
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null
}

/**
 * Calcula o custo adicional de MP baseado no nível da magia e estágio (`stage` é o índice: 0 = estágio 1). Se a magia traz o acréscimo
 * por estágio (`increase`), ele vale no lugar do padrão do código.
 */
export function calculateExtraManaCost(magicLevel: number, stage: number, increase?: StageCostIncrease): number {
    if (stage === 0) return 0

    const stored = storedStageIncrease(increase, stage)
    if (stored !== null) return stored

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
export function calculateTotalManaCost(baseCost: number, magicLevel: number, stage: number, increase?: StageCostIncrease): number {
    return baseCost + calculateExtraManaCost(magicLevel, stage, increase)
}
