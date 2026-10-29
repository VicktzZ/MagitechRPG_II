/**
 * Acerto crítico (regra do dono, 29/10/2026; mecânica genérica: arma e magia usam as mesmas funções, e as habilidades e magias futuras só mudam a margem e o multiplicador):
 *  - o d20 **natural** (o dado que vale no teste) que **passar da margem** marca o crítico sozinho; a margem é 20 por padrão, a arma traz a dela (`effect.critChance`, "Crítico ≥ 19")
 *    e passivas, efeitos e magias a baixam (Ascensão Arcana 19, Forma Primordial −2, Estágio Quatro 18);
 *  - o multiplicador padrão é ×2 e **a margem não interfere nele**: uma fonte pode subir o multiplicador (o Furtivo do ladino faz ×3), nunca baixar;
 *  - arma com fórmula própria de crítico (`effect.critValue`: 3d4 na Adaga) rola essa fórmula; o multiplicador vale onde não há fórmula (arma sem `critValue`, magia, criatura).
 * Pura: quem rola entrega o dado que valeu e a margem já calculada.
 */

export const DEFAULT_CRIT_MARGIN = 20;
/** A margem nunca desce de 2: com 1 todo teste seria crítico */
export const MIN_CRIT_MARGIN = 2;
export const DEFAULT_CRIT_MULTIPLIER = 2;

const clampMargin = (value: number): number => Math.min(DEFAULT_CRIT_MARGIN, Math.max(MIN_CRIT_MARGIN, Math.trunc(value)));

/** A margem que a arma traz no cadastro: um inteiro de 2 a 20 (ou texto como "19-20", que vale 19); vazio, 0 ou inválido vale 20 */
export function baseCritMargin(value: unknown): number {
    // Cadastro à mão pode trazer texto ("19-20"): vale o primeiro número, a margem
    const margin = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
    if (!Number.isFinite(margin) || margin < MIN_CRIT_MARGIN) return DEFAULT_CRIT_MARGIN;
    return clampMargin(margin);
}

/** A margem de agora: a base menos as reduções (passivas, efeitos), entre 2 e 20. Aumentar a margem acima de 20 não existe */
export function critMargin(base: unknown, reduction = 0): number {
    const cut = Number.isFinite(Number(reduction)) ? Math.trunc(Number(reduction)) : 0;
    return clampMargin(baseCritMargin(base) - Math.max(0, cut));
}

/** O d20 natural que valeu no teste passou da margem? */
export function isCriticalRoll(naturalRoll: number, margin: number = DEFAULT_CRIT_MARGIN): boolean {
    return Number.isFinite(naturalRoll) && naturalRoll >= clampMargin(margin);
}

/** O multiplicador do crítico: ×2, ou o maior entre as fontes que o sobem (o Furtivo do ladino: ×3). Fonte menor que o padrão ou inválida não conta */
export function critMultiplier(sources: readonly number[] = []): number {
    return sources.reduce((best, value) => (Number.isFinite(value) && value > best ? Math.trunc(value) : best), DEFAULT_CRIT_MULTIPLIER);
}

/** O dano rolado vezes o multiplicador do crítico */
export const applyCritMultiplier = (rolled: number, multiplier: number = DEFAULT_CRIT_MULTIPLIER): number => rolled * (Number.isFinite(multiplier) ? multiplier : DEFAULT_CRIT_MULTIPLIER);

/** "d20 ≥ 19" (ou "d20 = 20" quando a margem é a padrão), para o chat e as dicas */
export const critMarginLabel = (margin: number): string => (clampMargin(margin) >= DEFAULT_CRIT_MARGIN ? 'd20 = 20' : `d20 ≥ ${clampMargin(margin)}`);

/** "Dano crítico ×2 (9 × 2 = 18)": a regra do crítico dita em texto, com a soma rolada e o total que foi para o chat */
export const critDamageText = (rolled: number, multiplier: number, total: number): string => `Crítico: dano ×${multiplier} (${rolled} × ${multiplier} = ${total})`;
