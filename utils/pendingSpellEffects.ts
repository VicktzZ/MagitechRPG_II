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
    const rest: Record<string, SpellStage> = { ...pending };
    delete rest[spellKey];
    return rest;
}
