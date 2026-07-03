/**
 * Avaliador seguro de fórmulas de sistemas de RPG customizados.
 * Suporta variáveis arbitrárias (abreviações de atributos, "level", etc.)
 * substituídas por valores numéricos antes da avaliação.
 *
 * Pipeline de segurança: substitui variáveis → whitelist de caracteres → new Function.
 * Fórmulas inválidas/maliciosas retornam o fallback.
 */

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Avalia uma fórmula com as variáveis fornecidas.
 * @param formula Ex: "VIG * 2 + 10", "level * 2"
 * @param vars Mapa de variável → valor. Ex: { VIG: 5, level: 3 }. Case-insensitive.
 * @param fallback Valor retornado se a fórmula for inválida.
 */
export function evaluateFormula(
    formula: string,
    vars: Record<string, number>,
    fallback = 0
): number {
    if (!formula?.trim()) return fallback;

    try {
        let expr = formula;

        // Substitui variáveis por valores — maiores primeiro para evitar colisão de prefixo
        const tokens = Object.keys(vars).sort((a, b) => b.length - a.length);
        for (const token of tokens) {
            const pattern = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'gi');
            expr = expr.replace(pattern, String(vars[token] ?? 0));
        }

        // Whitelist: somente números, operadores aritméticos, parênteses, ponto e espaço
        if (/[^0-9+\-*/(). ]/.test(expr)) return fallback;

        // Seguro: expr já passou pela whitelist acima (apenas aritmética)
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
        const result = new Function(`return (${expr})`)() as number;
        if (typeof result !== 'number' || !isFinite(result)) return fallback;
        return Math.floor(result);
    } catch {
        return fallback;
    }
}

/**
 * Extrai os identificadores alfabéticos referenciados numa fórmula.
 * Útil para validar se a fórmula referencia atributos existentes.
 * @example extractFormulaTokens("VIG * 2 + level") → ["VIG", "level"]
 */
export function extractFormulaTokens(formula: string): string[] {
    if (!formula) return [];
    const matches = formula.match(/[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*/g);
    return matches ? Array.from(new Set(matches)) : [];
}
