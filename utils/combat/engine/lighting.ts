import type { ModifierSet } from './modifiers';
import { hasFlag } from './modifiers';

/**
 * Luz e visão (regras do dono). A luz é da cena inteira; a visão é de cada combatente (Normal, Aprimorada ou Verdadeira).
 *  - Claro: nada muda.
 *  - Penumbra: cobertura parcial para todos, ou seja, desvantagem no acerto, salvo para quem tem Visão Aprimorada (ou Verdadeira).
 *  - Escuridão: quem tem visão normal fica com Cegueira; quem tem Visão Aprimorada enxerga os outros com cobertura parcial; quem tem
 *    Visão Verdadeira não sofre nada.
 * A visão aprimorada é o efeito antes chamado "Visão na Penumbra" (flag `dim_vision`); a verdadeira é `true_sight`.
 */

export type AmbientLight = 'claro' | 'penumbra' | 'escuridao';
export type VisionLevel = 'normal' | 'aprimorada' | 'verdadeira';

export interface LightingResult {
    /** O observador fica cego (condição Cegueira) */
    blinded: boolean;
    /** Os alvos têm cobertura parcial para o observador: desvantagem no acerto */
    partialCover: boolean;
}

export function lightingEffect(light: AmbientLight, vision: VisionLevel): LightingResult {
    if (light === 'penumbra') return { blinded: false, partialCover: vision === 'normal' };
    if (light === 'escuridao') {
        if (vision === 'normal') return { blinded: true, partialCover: false };
        return { blinded: false, partialCover: vision === 'aprimorada' };
    }
    return { blinded: false, partialCover: false };
}

/** A visão de um combatente: a verdadeira vence a aprimorada; a base vem da criatura ou da habilidade (enxerga no escuro) */
export function visionLevel(modifiers: ModifierSet, intrinsic: VisionLevel = 'normal'): VisionLevel {
    if (intrinsic === 'verdadeira' || hasFlag(modifiers, 'true_sight')) return 'verdadeira';
    if (intrinsic === 'aprimorada' || hasFlag(modifiers, 'dim_vision') || hasFlag(modifiers, 'enhanced_vision')) return 'aprimorada';
    return 'normal';
}
