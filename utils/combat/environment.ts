import type { AppliedEffect, Combat } from '@models';
import { normalizeSearchText } from '@utils/searchText';
import { combatantVision } from './awareness';
import { combatantEffects, effectDice, type EffectDice } from './effectDice';
import { lightingEffect, type AmbientLight } from './engine/lighting';
import { collectModifiers } from './engine/modifiers';
import { displacementWithTerrain, terrainImmune } from './effectStats';

/**
 * Ambiente manual do combate (Fase 7): **iluminação da cena** e **terreno difícil**. O mapa é de terceiros, então quem sabe qual é a luz e quem está em terreno
 * difícil é o mestre: ele marca, e o app tira as consequências das regras do dono (`engine/lighting.ts`, `engine/terrain.ts`). Fica em `Combat.environment`, só com o
 * combate ativo (`start` e `end` o zeram) e fora do histórico do "Desfazer", como a matriz de percepção.
 *
 *  - **Luz** (da cena inteira): claro não muda nada; penumbra dá cobertura parcial a todos (−1d20 no acerto) salvo a quem tem Visão Aprimorada ou Verdadeira; escuridão
 *    deixa quem tem visão normal com Cegueira (−1d20 no acerto), dá cobertura parcial a quem tem Visão Aprimorada (−1d20) e não muda nada para a Visão Verdadeira.
 *    A visão de cada combatente vem dos efeitos aplicados (`combatantVision`); a criatura ainda não tem visão própria no cadastro. Quem já está com o efeito Cegueira
 *    não ganha a desvantagem da escuridão de novo (é a mesma condição);
 *  - **Terreno difícil** (por combatente: o mestre marca quem está nele): o deslocamento cai pela metade, salvo imunidade (efeito com a marca `terrain_immunity`).
 *    O app só mostra o deslocamento de agora, não valida movimento.
 */

export type { AmbientLight } from './engine/lighting';

export const AMBIENT_LIGHTS: readonly AmbientLight[] = [ 'claro', 'penumbra', 'escuridao' ];

export const LIGHT_LABEL: Record<AmbientLight, string> = { claro: 'Claro', penumbra: 'Penumbra', escuridao: 'Escuridão' };

/** O que a luz faz com quem tem visão normal, dito em uma frase (a dica do seletor e o aviso do jogador) */
export const LIGHT_RULE: Record<AmbientLight, string> = {
    claro: 'Sem efeito.',
    penumbra: 'Cobertura parcial: desvantagem no acerto, salvo Visão Aprimorada ou Verdadeira.',
    escuridao: 'Quem tem visão normal fica cego (desvantagem no acerto); Visão Aprimorada tem cobertura parcial; Visão Verdadeira não sofre nada.'
};

/** Quem está em terreno difícil, no máximo (o que vem do cliente) */
export const MAX_TERRAIN_IDS = 60;

export interface CombatEnvironment {
    light: AmbientLight;
    /** Os combatentes que estão em terreno difícil agora (ids) */
    difficultTerrainIds: string[];
}

export const defaultEnvironment = (): CombatEnvironment => ({ light: 'claro', difficultTerrainIds: [] });

/** A luz vinda do cliente (`null` se não for uma das conhecidas) */
export const sanitizeLight = (raw: unknown): AmbientLight | null => AMBIENT_LIGHTS.find(light => light === raw) ?? null;

/** Ids de combatentes vindos do cliente: texto curto, sem repetir */
export function sanitizeTerrainIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ].slice(0, MAX_TERRAIN_IDS);
}

/** O ambiente gravado, lido com tolerância: combate antigo (sem o campo) ou lixo vale claro e sem terreno difícil */
export function readEnvironment(raw: unknown): CombatEnvironment {
    const source = typeof raw === 'object' && raw !== null ? raw as Partial<Record<keyof CombatEnvironment, unknown>> : {};
    return { light: sanitizeLight(source.light) ?? 'claro', difficultTerrainIds: sanitizeTerrainIds(source.difficultTerrainIds) };
}

/** O ambiente depois de marcar (ou desmarcar) terreno difícil para os combatentes; devolve um novo, sem alterar o original */
export function setTerrain(env: CombatEnvironment, combatantIds: readonly string[], difficult: boolean): CombatEnvironment {
    const current = new Set(env.difficultTerrainIds);
    for (const id of combatantIds) {
        if (difficult) current.add(id);
        else current.delete(id);
    }
    return { ...env, difficultTerrainIds: [ ...current ].slice(0, MAX_TERRAIN_IDS) };
}

/** Tira o combatente que saiu do combate da lista de terreno difícil */
export const dropTerrainFor = (env: CombatEnvironment | null | undefined, combatantId: string): CombatEnvironment => {
    const current = readEnvironment(env);
    return { ...current, difficultTerrainIds: current.difficultTerrainIds.filter(id => id !== combatantId) };
};

export const isInDifficultTerrain = (env: CombatEnvironment | null | undefined, combatantId: string | null | undefined): boolean =>
    Boolean(combatantId) && readEnvironment(env).difficultTerrainIds.includes(String(combatantId));

/** Algum efeito aplicado dá imunidade ao terreno difícil (a marca `terrain_immunity` do catálogo de efeitos) */
export const hasTerrainImmunity = (effects: readonly AppliedEffect[] | null | undefined): boolean => terrainImmune(collectModifiers(effects));

/** O deslocamento de agora em metros: o base com os efeitos (Velocidade, Congelamento...) e depois o terreno difícil, que corta pela metade quem não é imune */
export const displacementNow = (base: unknown, effects: readonly AppliedEffect[] | null | undefined, difficultTerrain: boolean): number =>
    displacementWithTerrain(base, collectModifiers(effects), difficultTerrain);

// ─────────────────────────────────────────────
// Luz e visão no acerto
// ─────────────────────────────────────────────

const isBlindnessEffect = (effect: Pick<AppliedEffect, 'effectId' | 'snapshot'>): boolean =>
    normalizeSearchText(effect.snapshot?.name) === 'cegueira' || normalizeSearchText(effect.effectId).endsWith('cegueira');

/**
 * A desvantagem de acerto que a luz da cena dá a quem ataca, com a origem ("Penumbra: cobertura parcial, −1d20"). Depende da visão do atacante (pelos efeitos aplicados).
 * Quem já está com o efeito Cegueira não ganha a desvantagem de cegueira da escuridão de novo: é a mesma condição.
 */
export function ambientAttackDice(light: AmbientLight, effects: readonly AppliedEffect[] | null | undefined): EffectDice {
    const result: EffectDice = { advantages: 0, disadvantages: 0, notes: [] };
    const effect = lightingEffect(light, combatantVision({ effects }));

    if (effect.blinded && !(effects ?? []).some(isBlindnessEffect)) {
        result.disadvantages += 1;
        result.notes.push('Escuridão: cegueira (visão normal), desvantagem, −1d20');
    }
    if (effect.partialCover) {
        result.disadvantages += 1;
        result.notes.push(light === 'penumbra' ? 'Penumbra: cobertura parcial, desvantagem, −1d20' : 'Escuridão: cobertura parcial (Visão Aprimorada), desvantagem, −1d20');
    }
    return result;
}

/** As vantagens e desvantagens de acerto dos efeitos aplicados mais a da luz da cena (`light` 'claro' não acrescenta nada) */
export function attackDiceWithLight(effects: readonly AppliedEffect[] | null | undefined, light: AmbientLight): EffectDice {
    const fromEffects = effectDice(effects, 'attack');
    const ambient = ambientAttackDice(light, effects);
    return {
        advantages: fromEffects.advantages + ambient.advantages,
        disadvantages: fromEffects.disadvantages + ambient.disadvantages,
        notes: [ ...fromEffects.notes, ...ambient.notes ]
    };
}

/** A luz da cena: só vale com o combate ativo (fora dele a cena não tem luz marcada) */
export const combatLight = (combat: Pick<Combat, 'isActive' | 'environment'> | null | undefined): AmbientLight =>
    combat?.isActive ? readEnvironment(combat.environment).light : 'claro';

/** Os d20 de acerto de um combatente: os efeitos aplicados e a luz da cena. Quem não está no combate ativo não tem nem efeito nem luz */
export function combatantAttackDice(combat: Pick<Combat, 'isActive' | 'combatants' | 'environment'> | null | undefined, combatantId: string | null | undefined): EffectDice {
    const inCombat = Boolean(combat?.isActive && combatantId && combat.combatants?.some(combatant => combatant.id === combatantId));
    return attackDiceWithLight(combatantEffects(combat, combatantId), inCombat ? combatLight(combat) : 'claro');
}

/** O combatente (a ficha, pelo id) está em terreno difícil agora? Fora de combate ativo não */
export const combatantInDifficultTerrain = (combat: Pick<Combat, 'isActive' | 'environment'> | null | undefined, combatantId: string | null | undefined): boolean =>
    Boolean(combat?.isActive) && isInDifficultTerrain(combat?.environment, combatantId);
