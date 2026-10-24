/**
 * Pontos vitais do personagem: LP (vida), MP (mana) e AP (armadura). Cada um guarda o valor atual em
 * `stats.<chave>` e o máximo em `stats.max<Chave>`.
 */
export const VITAL_KEYS = [ 'lp', 'mp', 'ap' ] as const;

export type VitalKey = typeof VITAL_KEYS[number];

/** Quanto o mestre muda de uma vez, para cada ponto vital (negativo = dano ou gasto, positivo = cura ou recuperação) */
export type VitalDeltas = Partial<Record<VitalKey, number>>;

/** Maior variação aceita de uma vez: protege contra um dedo a mais no teclado e contra números absurdos */
export const MAX_VITAL_DELTA = 9999;

/** Nomes dos campos de `stats` de cada ponto vital */
export const VITAL_FIELDS: Record<VitalKey, { current: 'lp' | 'mp' | 'ap'; max: 'maxLp' | 'maxMp' | 'maxAp' }> = {
    lp: { current: 'lp', max: 'maxLp' },
    mp: { current: 'mp', max: 'maxMp' },
    ap: { current: 'ap', max: 'maxAp' }
};

const finiteOr = (value: unknown, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Valor de um ponto vital depois de somar `delta` ao atual:
 * - dano ou gasto nunca leva abaixo de zero;
 * - cura ou recuperação para no máximo;
 * - quem já está acima do máximo (o mestre pode dar pontos de sobra) não perde nada ao ser curado.
 */
export function applyVitalDelta(current: unknown, max: unknown, delta: number): number {
    const now = finiteOr(current, 0);
    const ceiling = finiteOr(max, 0);
    if (!Number.isFinite(delta) || delta === 0) return now;

    if (delta < 0) return Math.max(Math.min(now, 0), now + delta);

    return now >= ceiling ? now : Math.min(ceiling, now + delta);
}

/** O texto digitado é uma quantidade válida (inteiro de 1 a MAX_VITAL_DELTA)? */
export function parseVitalAmount(text: string): number | null {
    if (!/^\d+$/.test(text.trim())) return null;
    const amount = Number(text);
    return amount >= 1 && amount <= MAX_VITAL_DELTA ? amount : null;
}
