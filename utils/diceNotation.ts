/**
 * Notação de dados aceita nas armas da ficha: `XdY`, com modificadores opcionais
 * (`2d6+3`, `1d8+2d4`, `1d10-1`) e multiplicador no fim (`2d6x2`).
 * Maiúsculas ("2D6") também valem. Fonte única para o formulário de criação da arma e para o
 * schema da ficha — antes cada um tinha a sua regra e uma arma válida num lado era barrada no outro.
 */
export const DICE_NOTATION_REGEX = /^\d+d\d+(?:[+-](?:\d+|\d+d\d+))*(?:x\d+)?$/i

export const DICE_NOTATION_MESSAGE = 'Use o formato XdY, com modificadores se quiser (ex: 2d4+1, 2d4+2d4, 1d8x2)'

export function isDiceNotation(value: unknown): boolean {
    return typeof value === 'string' && DICE_NOTATION_REGEX.test(value.trim())
}
