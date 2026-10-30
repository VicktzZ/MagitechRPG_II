/**
 * A **regra única de d20** (decisão do dono, 29/10/2026; antes havia três: o botão da perícia na ficha, o teste pedido pelo mestre e a criatura): o número de d20 de um teste vem do
 * **modificador do atributo + 1**, e vale o maior. Modificador **negativo** rola 2 d20 e vale o **menor** (desvantagem). Vantagens e desvantagens de efeitos, passivas e Furtivo entram
 * depois, pelo saldo (`combat/effectDice.ts`).
 *
 *   modificador −1 (ou menos) → 2d20, vale o menor
 *   modificador  0            → 1d20
 *   modificador  1            → 2d20, vale o maior
 *   modificador  3            → 4d20, vale o maior
 *
 * Vale para o jogador (perícias, teste de acerto da arma e da magia, iniciativa, teste pedido pelo mestre, defesa) e para a criatura (o modificador dela é `⌊valor ÷ 5⌋`, ver `creatureModifier`).
 * Sistema customizado (`systemId`) tem a regra própria da influência do atributo e não passa por aqui. Pura.
 */

/** Teto de d20 por teste (a regra dá de 1 a 6; sistemas customizados podem dar mais) */
export const MAX_D20_DICE = 20;

export type D20Keep = 'highest' | 'lowest';

export interface D20Pool {
    dice: number;
    /** Qual d20 vale: o maior (normal e vantagem) ou o menor (modificador negativo, desvantagem) */
    keep: D20Keep;
}

/** O d20 puro: sem modificador conhecido (ficha sem o atributo, teste sem perícia) */
export const SINGLE_D20: D20Pool = { dice: 1, keep: 'highest' };

/** Os d20 de um modificador de atributo. Modificador que não é número (ausente, texto solto) vale 0: um d20 */
export function d20Pool(modifier: unknown): D20Pool {
    const mod = Math.floor(Number(modifier));
    if (!Number.isFinite(mod)) return { ...SINGLE_D20 };
    if (mod < 0) return { dice: 2, keep: 'lowest' };
    return { dice: Math.min(mod + 1, MAX_D20_DICE), keep: 'highest' };
}

/** O modificador de um atributo de criatura: 0 vale −1, depois `⌊valor ÷ 5⌋` até 5 (5 vale 1, 10 vale 2, 30 ou mais vale 5) */
export function creatureModifier(attributeValue: unknown): number {
    const value = Number(attributeValue);
    if (!Number.isFinite(value) || value === 0) return -1;
    return Math.min(5, Math.floor(value / 5));
}

/** Os d20 de um atributo de criatura (`d20Pool(creatureModifier(valor))`): atributo 0 ou ausente rola 2d20 e vale o menor; 4 vale 1d20; 5 vale 2d20 */
export const creatureD20Pool = (attributeValue: unknown): D20Pool => d20Pool(creatureModifier(attributeValue));

/** "2d20 (vale o menor)", "4d20 (vale o maior)", "1d20": a regra dita em texto, para dicas e logs */
export function describeD20Pool({ dice, keep }: D20Pool): string {
    if (dice === 1) return '1d20';
    return `${dice}d20 (vale o ${keep === 'lowest' ? 'menor' : 'maior'})`;
}
