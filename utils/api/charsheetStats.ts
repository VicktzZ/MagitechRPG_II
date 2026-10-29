import { MAX_VITAL_DELTA, VITAL_KEYS, type VitalDeltas, type VitalKey } from '@utils/vitals';
import { badRequest } from './errors';

interface VitalDeltaOptions {
    /** Pontos vitais aceitos (padrão: LP, MP e AP); os demais viram "campo desconhecido" */
    allowed?: readonly VitalKey[];
    /** Outros campos do corpo que a rota lê por conta própria e que esta validação deve deixar passar */
    extraKeys?: readonly string[];
}

/**
 * Corpo de POST /api/charsheet/[id]/stats: `{ lp?: n, mp?: n, ap?: n }` com variações inteiras (negativo = dano
 * ou gasto). Devolve só as variações válidas e diferentes de zero, ou lança 400.
 */
export function assertVitalDeltas(body: unknown, { allowed = VITAL_KEYS, extraKeys = [] }: VitalDeltaOptions = {}): VitalDeltas {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) throw badRequest('Corpo inválido');

    const source = body as Record<string, unknown>;
    const unknown = Object.keys(source).filter(key => !allowed.some(vital => vital === key) && !extraKeys.includes(key));
    if (unknown.length > 0) throw badRequest(`Campo desconhecido: ${unknown[0]}`);

    const deltas: VitalDeltas = {};
    for (const key of allowed) {
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

/**
 * A campanha informada no corpo de POST /api/charsheet/[id]/stats (`campaignId`, opcional): serve para o servidor achar os efeitos de combate da ficha e usar o teto de
 * agora (Fragilidade, Sobrecura, Sobremana). Quem manda só diz **qual** campanha; os efeitos são lidos dela, nunca vêm do cliente. `undefined` se não veio.
 */
export function readStatsCampaignId(body: unknown): string | undefined {
    const value = typeof body === 'object' && body !== null ? (body as Record<string, unknown>)['campaignId'] : undefined;
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string' || value.length === 0 || value.length > 128) throw badRequest('"campaignId" inválido');
    return value;
}
