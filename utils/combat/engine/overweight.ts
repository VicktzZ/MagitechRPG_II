/**
 * Condição SOBREPESO (regra do dono): quem carrega mais que a capacidade tem os modificadores de todas as perícias cujo atributo base é DES ou
 * VIG reduzidos em −1 para cada kg excedido. Um kg começado conta (excedeu 0,3kg = −1). A condição vem do inventário, não de um efeito aplicado;
 * o item do tipo Capacidade (mochila) soma à capacidade e já é tratado no peso carregado (`entryWeight`).
 */

export const OVERWEIGHT_ATTRIBUTES: readonly string[] = [ 'des', 'vig' ];

/** Quilos acima da capacidade, arredondados para cima; 0 se está dentro (ou se a capacidade é 0, ficha sem limite) */
export function excessKg(carried: number, capacity: number): number {
    const cargo = Number(carried);
    const max = Number(capacity);
    if (!Number.isFinite(cargo) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.ceil(cargo - max));
}

export const isOverweight = (carried: number, capacity: number): boolean => excessKg(carried, capacity) > 0;

/** O quanto Sobrepeso tira dos modificadores das perícias de DES e VIG (negativo, ou 0) */
export const overweightPenalty = (carried: number, capacity: number): number => -excessKg(carried, capacity);

/** A penalidade que cabe a uma perícia: só as de atributo base DES ou VIG a sofrem */
export function expertiseOverweightPenalty(defaultAttribute: unknown, penalty: number): number {
    return typeof defaultAttribute === 'string' && OVERWEIGHT_ATTRIBUTES.includes(defaultAttribute.toLowerCase()) ? penalty : 0;
}
