import { MAX_VITAL_DELTA, VITAL_KEYS, type VitalDeltas } from '@utils/vitals';
import { badRequest } from './errors';

/**
 * Corpo de POST /api/charsheet/[id]/stats: `{ lp?: n, mp?: n, ap?: n }` com variações inteiras (negativo = dano
 * ou gasto). Devolve só as variações válidas e diferentes de zero, ou lança 400.
 */
export function assertVitalDeltas(body: unknown): VitalDeltas {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) throw badRequest('Corpo inválido');

    const source = body as Record<string, unknown>;
    const unknown = Object.keys(source).filter(key => !VITAL_KEYS.some(vital => vital === key));
    if (unknown.length > 0) throw badRequest(`Campo desconhecido: ${unknown[0]}`);

    const deltas: VitalDeltas = {};
    for (const key of VITAL_KEYS) {
        const value = source[key];
        if (value === undefined) continue;

        if (typeof value !== 'number' || !Number.isInteger(value) || Math.abs(value) > MAX_VITAL_DELTA) {
            throw badRequest(`"${key}" deve ser um número inteiro de -${MAX_VITAL_DELTA} a ${MAX_VITAL_DELTA}`);
        }
        if (value !== 0) deltas[key] = value;
    }

    if (Object.keys(deltas).length === 0) throw badRequest('Nenhuma variação para aplicar');
    return deltas;
}
