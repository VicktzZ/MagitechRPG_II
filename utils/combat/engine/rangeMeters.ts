/**
 * Alcance em metros (regras do dono): Curto 3m, Médio 18m, Longo 30m. O catálogo ainda tem o Padrão (9m) e o Ampliado (90m), que as armas usam.
 * Corpo a corpo e Toque valem o alcance de combate corpo a corpo (1,5m). Pessoal, Visão/Visível e Ilimitado não são uma distância.
 */

export const MELEE_REACH_M = 1.5;

export type RangeKind = 'pessoal' | 'toque' | 'corpo' | 'curto' | 'padrao' | 'medio' | 'longo' | 'ampliado' | 'visao' | 'ilimitado' | 'desconhecido';

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const NAMED_METERS: Partial<Record<RangeKind, number>> = {
    toque: MELEE_REACH_M,
    corpo: MELEE_REACH_M,
    curto: 3,
    padrao: 9,
    medio: 18,
    longo: 30,
    ampliado: 90
};

/** A categoria do alcance, para o texto do catálogo ("Curto", "Médio (18m)", "Corpo-a-corpo", "Pessoal (Área)", "Visão"...) */
export function rangeKind(range: unknown): RangeKind {
    const text = normalize(range);
    if (text.startsWith('pessoal')) return 'pessoal';
    if (text.startsWith('toque')) return 'toque';
    if (text.startsWith('corpo')) return 'corpo';
    if (text.startsWith('curto')) return 'curto';
    if (text.startsWith('padrao')) return 'padrao';
    if (text.startsWith('medio')) return 'medio';
    if (text.startsWith('longo')) return 'longo';
    if (text.startsWith('ampliado')) return 'ampliado';
    if (text.startsWith('visao') || text.startsWith('visivel')) return 'visao';
    if (text.startsWith('ilimitado')) return 'ilimitado';
    return 'desconhecido';
}

/** O alcance em metros, ou `null` quando não é uma distância (Pessoal, Visão, Ilimitado) ou não se reconhece o texto */
export function rangeMeters(range: unknown): number | null {
    const kind = rangeKind(range);
    const named = NAMED_METERS[kind];
    if (named !== undefined) return named;

    // Arremessáveis e textos soltos: "9m", "4,5m"
    const explicit = /^(\d+(?:[.,]\d+)?)\s*m$/.exec(normalize(range));
    return explicit ? Number(explicit[1]!.replace(',', '.')) : null;
}
