/**
 * Extrai a categoria de uma magia a partir do campo `type`, que no banco é
 * texto livre no formato "Categoria (detalhe)" (ex: "Defesa (imediato)",
 * "Encantamento (conjurado)"). Não existe um campo de categoria dedicado,
 * então a categoria é derivada do texto já cadastrado.
 */
export function getSpellCategory(type?: string | null): string {
    if (!type) return 'Outro';
    const base = type.split('(')[0]?.trim();
    return base || 'Outro';
}
