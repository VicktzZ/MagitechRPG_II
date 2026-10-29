import { rollDice } from '@utils/diceRoller';
import type { ExtraRoller } from './rolls';

/** Rola uma expressão de dados dos acréscimos das passivas e das habilidades ("1d8", "2d6+1"); `null` quando a expressão não vale */
export const rollExtraDice: ExtraRoller = (notation) => {
    const result = rollDice(notation);
    return result && !result.error ? { total: result.total, display: result.display ?? `[${result.rolls.join(', ')}]` } : null;
};
