import type { VisionLevel } from './lighting';

/**
 * Furtividade, invisibilidade e surpresa (regras do dono).
 *  - Quem passa em Furtividade num local visível ainda pode ser notado: os que o veem testam Percepção contra DT 20 (DT 30 se ele estiver
 *    invisível). Passando, enxergam o furtivo e ele sai da condição.
 *  - Visão Verdadeira anula a furtividade (vê o furtivo sem teste) e baixa a DT para detectar invisibilidade para 15.
 *  - Ataque de surpresa (o alvo não vê o atacante): +1d20; atacante invisível, +2d20. O alvo não pode se esquivar.
 */

export const STEALTH_DETECTION_DT = 20;
export const INVISIBLE_DETECTION_DT = 30;
export const TRUE_SIGHT_INVISIBLE_DT = 15;

export interface DetectionInput {
    furtive?: boolean;
    invisible?: boolean;
    /** A visão de quem tenta notar */
    observerVision?: VisionLevel;
}

/** A DT do teste de Percepção para notar o ser, ou `null` quando não há o que testar (está à vista, ou a visão verdadeira vê o furtivo sozinha) */
export function detectionDT({ furtive, invisible, observerVision = 'normal' }: DetectionInput): number | null {
    if (invisible) return observerVision === 'verdadeira' ? TRUE_SIGHT_INVISIBLE_DT : INVISIBLE_DETECTION_DT;
    if (furtive) return observerVision === 'verdadeira' ? null : STEALTH_DETECTION_DT;
    return null;
}

export interface SeenInput extends DetectionInput {
    /** O observador já passou no teste de Percepção (ou o mestre marcou que ele viu) */
    spotted?: boolean;
}

/** O observador enxerga o ser? Sim se já o notou, se ele não está escondido, ou se tem Visão Verdadeira e o ser só está furtivo */
export function observerSees({ furtive, invisible, observerVision = 'normal', spotted }: SeenInput): boolean {
    if (spotted) return true;
    if (!furtive && !invisible) return true;
    return observerVision === 'verdadeira' && !invisible;
}

export interface Surprise {
    /** Vantagens (d20 a mais) no acerto: 0, 1 (furtivo) ou 2 (invisível) */
    advantages: number;
    /** O alvo não pode se esquivar */
    noDodge: boolean;
}

/** A surpresa do ataque, dado o atacante e quem o vê (o alvo) */
export function surprise(attacker: { furtive?: boolean; invisible?: boolean }, target: { vision?: VisionLevel; spotted?: boolean }): Surprise {
    const seen = observerSees({ ...attacker, observerVision: target.vision, spotted: target.spotted });
    if (seen) return { advantages: 0, noDodge: false };
    return { advantages: attacker.invisible ? 2 : 1, noDodge: true };
}
