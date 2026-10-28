/**
 * Terreno difícil (regra do dono): terrenos "diferentes" como pântano, neve e montanha reduzem o deslocamento de todos os seres que estão
 * nele pela metade, salvo quem tem imunidade (habilidade ou efeito). Movimento e distância são manuais: o motor só diz quanto cada um anda.
 */

export interface TerrainInput {
    /** Em terreno difícil agora (o mestre marca; o mapa é de terceiros) */
    difficultTerrain?: boolean;
    /** Imune à penalidade de terreno difícil */
    immune?: boolean;
}

/** O deslocamento em metros depois do terreno (9m viram 4,5m) */
export function effectiveDisplacement(displacement: number, { difficultTerrain, immune }: TerrainInput = {}): number {
    const base = Math.max(0, Number(displacement) || 0);
    return difficultTerrain && !immune ? base / 2 : base;
}
