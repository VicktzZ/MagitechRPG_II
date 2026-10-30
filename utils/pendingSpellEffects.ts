import type { ExtraSpec } from '@utils/combat/passives/rolls';
import type { SpellStage } from '@utils/spellStages';

/**
 * Magias conjuradas com sucesso que ainda esperam o jogador efetuá-las (rolar dano, cura, duração...), por id da magia (nome, se não
 * tiver id), com o estágio conjurado. É conveniência do navegador de quem joga: guardado no `localStorage` para um recarregamento
 * da página não fazer o jogador pagar o MP de novo, e nunca vai para o banco.
 */
export type PendingSpellEffects = Readonly<Record<string, SpellStage>>;

export const pendingEffectsStorageKey = (campaignId: string, charsheetId: string): string => `spell-effects-pending:${campaignId}:${charsheetId}`;

const isStage = (value: unknown): value is SpellStage => value === 1 || value === 2 || value === 3;

/** Lê o que o navegador guardou; JSON inválido ou entrada fora do formato é ignorado, nunca lança */
export function parsePendingSpellEffects(raw: string | null | undefined): PendingSpellEffects {
    if (!raw) return {};
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return {};
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

    const pending: Record<string, SpellStage> = {};
    for (const [ key, stage ] of Object.entries(data)) {
        if (key && isStage(stage)) pending[key] = stage;
    }
    return pending;
}

export function withPendingEffect(pending: PendingSpellEffects, spellKey: string, stage: SpellStage): PendingSpellEffects {
    return { ...pending, [spellKey]: stage };
}

export function withoutPendingEffect(pending: PendingSpellEffects, spellKey: string): PendingSpellEffects {
    return Object.fromEntries(Object.entries(pending).filter(([ key ]) => key !== spellKey)) as Record<string, SpellStage>;
}

/**
 * Quais dessas magias foram conjuradas em **crítico** (o d20 natural do teste passou da margem, ver `critical.ts`): ao efetuar, o dano sai vezes o multiplicador. Guardado à parte,
 * no mesmo `localStorage`, com a mesma regra: conveniência do navegador, nunca vai para o banco.
 */
export type PendingSpellCriticals = Readonly<Record<string, true>>;

export const pendingCriticalsStorageKey = (campaignId: string, charsheetId: string): string => `spell-effects-critical:${campaignId}:${charsheetId}`;

export function parsePendingSpellCriticals(raw: string | null | undefined): PendingSpellCriticals {
    if (!raw) return {};
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return {};
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

    const criticals: Record<string, true> = {};
    for (const [ key, flag ] of Object.entries(data)) {
        if (key && flag === true) criticals[key] = true;
    }
    return criticals;
}

export function withPendingCritical(criticals: PendingSpellCriticals, spellKey: string, critical: boolean): PendingSpellCriticals {
    const others = Object.fromEntries(Object.entries(criticals).filter(([ key ]) => key !== spellKey)) as Record<string, true>;
    return critical ? { ...others, [spellKey]: true } : others;
}

/**
 * Os acréscimos de dano ou de cura que a **conjuração** já decidiu e que entram quando o jogador efetua a magia: a opção de metamagia ligada (Intensificação Mágica +2d8, Estágio
 * Quatro +3d10), a Fixação Mágica no estágio máximo (+5) e a Magia Guiada (+Nd4). Guardados à parte, no mesmo `localStorage`, com a mesma regra: conveniência do navegador, nunca
 * vai para o banco. Cada entrada é um `ExtraSpec` (`utils/combat/passives/rolls.ts`): origem, dados, valor fixo.
 */
export type PendingSpellExtras = Readonly<Record<string, readonly ExtraSpec[]>>;

export const pendingExtrasStorageKey = (campaignId: string, charsheetId: string): string => `spell-effects-extras:${campaignId}:${charsheetId}`;

const DICE_NOTATION = /^\d{1,2}d\d{1,4}$/i;

/** Uma entrada que o navegador guardou: só texto curto, dados no formato "XdY" e números inteiros; o resto é descartado */
function sanitizeSpec(raw: unknown): ExtraSpec | null {
    if (!raw || typeof raw !== 'object') return null;
    const { source, dice, flat, sameDie } = raw as Record<string, unknown>;
    if (typeof source !== 'string' || source === '' || source.length > 60) return null;
    const list = Array.isArray(dice) ? dice.filter((entry): entry is string => typeof entry === 'string' && DICE_NOTATION.test(entry)).slice(0, 4) : [];
    const flatNumber = Number.isInteger(flat) ? Math.max(-1000, Math.min(1000, flat as number)) : 0;
    const sameDieNumber = Number.isInteger(sameDie) ? Math.max(0, Math.min(20, sameDie as number)) : 0;
    if (list.length === 0 && flatNumber === 0 && sameDieNumber === 0) return null;
    return { source, dice: list, flat: flatNumber, sameDie: sameDieNumber };
}

export function parsePendingSpellExtras(raw: string | null | undefined): PendingSpellExtras {
    if (!raw) return {};
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return {};
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

    const extras: Record<string, ExtraSpec[]> = {};
    for (const [ key, list ] of Object.entries(data)) {
        if (!key || !Array.isArray(list)) continue;
        const specs = list.map(sanitizeSpec).filter((spec): spec is ExtraSpec => spec !== null).slice(0, 8);
        if (specs.length > 0) extras[key] = specs;
    }
    return extras;
}

/** Guarda os acréscimos da conjuração desta magia; sem nenhum, tira o que havia (a conjuração nova troca a anterior) */
export function withPendingExtras(extras: PendingSpellExtras, spellKey: string, specs: readonly ExtraSpec[]): PendingSpellExtras {
    const others = Object.fromEntries(Object.entries(extras).filter(([ key ]) => key !== spellKey)) as Record<string, readonly ExtraSpec[]>;
    return specs.length > 0 ? { ...others, [spellKey]: [ ...specs ] } : others;
}
