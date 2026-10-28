import { carriedWeight, collectEntries } from '@components/campaign/playerDashboard/inventory/inventoryList';
import { excessKg, expertiseOverweightPenalty } from './engine/overweight';

/**
 * Sobrepeso de uma ficha (regra do dono, `engine/overweight.ts`): quem carrega mais que a capacidade tem **−1 nos modificadores de todas as perícias de
 * atributo base DES e VIG para cada kg excedido** (um kg começado conta). É uma condição **derivada do inventário**, não um efeito aplicado: o peso carregado é o
 * que a tela do inventário mostra (armas, armaduras e itens; o item de Capacidade soma à capacidade e não pesa), contra `capacity.max`. Capacidade 0 é ficha sem limite.
 *
 * Só vale no Magitech padrão: ficha de sistema customizado (`systemId`) tem as próprias regras de peso e perícia, então nunca sofre a penalidade.
 * Pura e tolerante: lê só `systemId`, `capacity.max` e `inventory`, e aceita a ficha em qualquer um dos formatos do app.
 */

export interface SheetOverweight {
    /** Peso carregado pelo inventário */
    carried: number;
    /** Capacidade máxima da ficha */
    max: number;
    /** Quilos acima da capacidade, para cima (0 se está dentro) */
    excess: number;
    /** O que Sobrepeso tira das perícias de DES e VIG (negativo, ou 0) */
    penalty: number;
}

const NONE: SheetOverweight = { carried: 0, max: 0, excess: 0, penalty: 0 };

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? value as Record<string, unknown> : {});

/** Soma de pesos como 0,1 + 0,2 não fecha em 0,3: arredonda a centésimos antes de contar o quilo começado */
const roundWeight = (weight: number): number => Math.round(weight * 100) / 100;

export function sheetOverweight(sheet: unknown): SheetOverweight {
    const source = asRecord(sheet);
    if (source['systemId']) return NONE;

    const max = Number(asRecord(source['capacity'])['max']);
    if (!Number.isFinite(max) || max <= 0) return NONE;

    const carried = roundWeight(carriedWeight(collectEntries(asRecord(source['inventory']))));
    const excess = excessKg(carried, max);
    // sem `-0` quando está dentro da capacidade
    return { carried, max, excess, penalty: excess > 0 ? -excess : 0 };
}

/** O que Sobrepeso tira do modificador de uma perícia da ficha, dado o atributo base dela (só DES e VIG sofrem) */
export const sheetExpertisePenalty = (sheet: unknown, defaultAttribute: unknown): number =>
    expertiseOverweightPenalty(defaultAttribute, sheetOverweight(sheet).penalty) || 0;
