import { isSecondaryElement } from '../../elements';

/**
 * Fraqueza elemental (regras do dono). Os elementos primários formam um ciclo em que cada um vence o seguinte:
 *
 *     Água → Fogo → Terra → Ar → Eletricidade → Água        e        Trevas ⇄ Luz
 *
 * Quem ataca um alvo FRACO ao elemento do ataque ganha +1d20 (vantagem) e causa o dobro de dano. O atacante não precisa de maestria:
 * basta o alvo ter fraqueza. Ela vem de (1) fraquezas declaradas (criatura, mestre, tipos físicos como cortante ou impactante), (2) do elemento
 * da criatura e (3) da maestria elemental do personagem: adquirir a maestria em X dá fraqueza ao elemento que vence X.
 * O ciclo não vale para elementos secundários nem para Não-elemental. Tipos físicos não têm tabela: só valem se declarados como fraqueza.
 */

export const WEAKNESS_ADVANTAGE = 1;
export const WEAKNESS_DAMAGE_MULTIPLIER = 2;

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Quem vence quem: a chave vence o valor */
const BEATS: Readonly<Record<string, string>> = {
    agua: 'fogo',
    fogo: 'terra',
    terra: 'ar',
    ar: 'eletricidade',
    eletricidade: 'agua',
    trevas: 'luz',
    luz: 'trevas'
};

/** O elemento que vence `element` (a fraqueza de quem é desse elemento), ou `null` fora do ciclo (secundários, Não-elemental, físicos) */
export function elementBeating(element: unknown): string | null {
    const key = normalize(element);
    if (!key || isSecondaryElement(element)) return null;
    const winner = Object.entries(BEATS).find(([ , loser ]) => loser === key);
    return winner ? winner[0] : null;
}

export interface WeaknessProfile {
    /** Elemento da criatura (ou do alvo) */
    element?: unknown;
    /** Maestria elemental do personagem */
    mastery?: unknown;
    /** Fraquezas declaradas: elementos ou tipos de dano físico */
    weaknesses?: readonly unknown[] | null;
}

/** As fraquezas do alvo, sem caixa nem acento: as declaradas, a do elemento dele e a da maestria dele */
export function weaknessesOf(profile: WeaknessProfile): string[] {
    const found = new Set<string>();
    for (const declared of profile.weaknesses ?? []) {
        const key = normalize(declared);
        if (key) found.add(key);
    }
    for (const source of [ profile.element, profile.mastery ]) {
        const winner = elementBeating(source);
        if (winner) found.add(winner);
    }
    return Array.from(found);
}

export interface WeaknessResult {
    weak: boolean;
    /** Vantagens (d20 a mais) no acerto */
    advantages: number;
    /** Multiplicador do dano */
    damageMultiplier: number;
}

/** O alvo é fraco ao elemento (ou tipo de dano) do ataque? */
export function weaknessAgainst(target: WeaknessProfile, attackType: unknown): WeaknessResult {
    const attack = normalize(attackType);
    const weak = attack !== '' && weaknessesOf(target).includes(attack);
    return weak
        ? { weak, advantages: WEAKNESS_ADVANTAGE, damageMultiplier: WEAKNESS_DAMAGE_MULTIPLIER }
        : { weak, advantages: 0, damageMultiplier: 1 };
}
