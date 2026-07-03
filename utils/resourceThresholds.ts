import type { CustomResource } from '@models/entities';

export interface ResolvedThreshold {
    value: number;
    label: string;
    color: string;
}

/**
 * Resolve os limiares de um recurso para valores absolutos, considerando
 * o máximo PESSOAL do personagem (que cresce com level-up).
 * - mode 'max': personalMax + offset (ex: pânico no Estresse máximo — 10 no
 *   nível 1, 12 no nível 5)
 * - mode 'min': def.min + offset
 * - mode 'constant' (padrão): valor fixo
 */
export function resolveThresholds(def: CustomResource, personalMax: number): ResolvedThreshold[] {
    return (def.thresholds ?? []).map(t => ({
        label: t.label,
        color: t.color,
        value: t.mode === 'max'
            ? personalMax + t.value
            : t.mode === 'min'
                ? def.min + t.value
                : t.value
    }));
}

/**
 * Limiar ativo para o valor atual. Recursos que começam perto do mínimo
 * são ascendentes (Estresse 0→10); perto do máximo, descendentes (Bateria 100→0).
 */
export function getActiveResolvedThreshold(
    def: CustomResource,
    value: number,
    personalMax: number
): ResolvedThreshold | undefined {
    const thresholds = resolveThresholds(def, personalMax);
    if (thresholds.length === 0) return undefined;

    const midpoint = (def.min + personalMax) / 2;
    const isAscending = (def.defaultValue ?? personalMax) < midpoint;

    if (isAscending) {
        return thresholds
            .filter(t => value >= t.value)
            .sort((a, b) => b.value - a.value)[0];
    }
    return thresholds
        .filter(t => value <= t.value)
        .sort((a, b) => a.value - b.value)[0];
}
