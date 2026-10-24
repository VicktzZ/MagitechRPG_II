/** Níveis em que o personagem ganha pontos de evolução: de 5 em 5 (5, 10, 15, 20...) */
export const EVOLUTION_POINT_LEVEL_STEP = 5;

/** Pontos de evolução ganhos a cada nível múltiplo de 5 */
export const EVOLUTION_POINTS_PER_STEP = 3;

/**
 * Pontos de evolução ganhos ao subir de `oldLevel` para `newLevel`: 3 por nível múltiplo de 5 atingido no caminho
 * (subir do 4 ao 11 passa pelo 5 e pelo 10, então são 6). Não sobe de nível, não ganha: devolve 0.
 */
export function evolutionPointsForLevelUp(oldLevel: number, newLevel: number): number {
    const from = Math.max(0, Math.floor(Number(oldLevel)) || 0);
    const to = Math.floor(Number(newLevel)) || 0;
    if (to <= from) return 0;

    const steps = Math.floor(to / EVOLUTION_POINT_LEVEL_STEP) - Math.floor(from / EVOLUTION_POINT_LEVEL_STEP);
    return Math.max(0, steps) * EVOLUTION_POINTS_PER_STEP;
}
