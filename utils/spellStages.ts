/**
 * Estágios desbloqueados de uma magia.
 *
 * Regra (definida pelo dono do projeto): toda magia começa no estágio 1; o jogador evolui a magia, sem custo, e libera
 * o estágio seguinte, em ordem; o mestre também pode ajustar. Estágio acima do liberado fica bloqueado (sem texto do efeito)
 * e não pode ser escolhido nem conjurado. O MP extra de cada estágio ao conjurar (`calculateExtraManaCost`) continua valendo.
 *
 * Evoluir custa 1 **ponto de evolução** (`points.evolution`), concedido pelo mestre no detalhe da ficha, na campanha. O ajuste direto do
 * mestre (aba de magias do detalhe da ficha) não gasta ponto.
 *
 * Dois campos da ficha:
 * - `spellStages[chave]`   estágio ATIVO: o que o jogador escolheu para conjurar;
 * - `spellUnlocked[chave]` estágio liberado até agora (o ativo nunca passa dele).
 * A chave é o id da magia (ou o nome, quando a magia não tem id).
 *
 * Ficha criada antes desta regra não tem `spellUnlocked`: vale o estágio que o jogador já usava na magia, senão ninguém
 * perderia de repente o estágio 3 que conjurava. Esse valor antigo tem de ser gravado em `spellUnlocked` junto com a
 * primeira mudança da magia (`materializeUnlocked`), senão trocar o estágio ativo para 1 apagaria o estágio liberado.
 */

export type SpellStage = 1 | 2 | 3;

export const MAX_SPELL_STAGE = 3;

type StageMap = Record<string, unknown> | null | undefined;

export interface StageSheetState {
    spellStages?: StageMap;
    spellUnlocked?: StageMap;
}

const toStage = (value: unknown): SpellStage | undefined => {
    const stage = Number(value);
    return Number.isInteger(stage) && stage >= 1 ? Math.min(stage, MAX_SPELL_STAGE) as SpellStage : undefined;
};

/** Chave da magia na ficha: o id; magias sem id usam o nome (mesma regra de `spellStages` e da remoção) */
export function spellStageKey(spell: { id?: string | null; name?: string | null }): string {
    return String(spell.id || spell.name || '');
}

/** Quantos estágios a magia tem (1 a 3), pelos textos que ela traz */
export function spellStageCount(spell: { stages?: unknown }): SpellStage {
    const stages = Array.isArray(spell.stages) ? spell.stages : [];
    if (stages[2]) return 3;
    if (stages[1]) return 2;
    return 1;
}

/**
 * A regra vale na ficha do Magitech padrão. Sistema customizado define as próprias regras de magia e a ficha do
 * Roguelite (classe "Sem Classe") ganha as magias por vantagens, com os estágios abertos como sempre foram.
 */
export function usesStageUnlock(sheet: { systemId?: string | null; class?: string | null }, campaignMode?: string | null): boolean {
    if (campaignMode === 'Roguelite') return false;
    if (sheet.systemId) return false;
    return sheet.class !== 'Sem Classe';
}

export interface StageProgress {
    /** A regra de desbloqueio vale para esta ficha? Se não, todos os estágios estão liberados */
    enabled: boolean;
    count: SpellStage;
    /** Estágio liberado até agora */
    unlocked: SpellStage;
    /** Estágio ativo, sempre entre 1 e o liberado */
    active: SpellStage;
    /** Próximo estágio a liberar, ou `null` se já liberou todos */
    next: SpellStage | null;
    /** `spellUnlocked` ainda não tem esta magia (ficha antiga): o valor liberado precisa ser gravado junto da próxima mudança */
    needsMaterialize: boolean;
}

/**
 * @param legacy `spellStages` de quando a ficha foi carregada. Na ficha aberta para edição o `spellStages` do formulário já
 *   mudou com os cliques, então o valor "antigo" tem de vir do que foi carregado; na campanha o documento é o próprio banco.
 */
export function getStageProgress(
    state: StageSheetState,
    key: string,
    stageCount: number,
    enabled: boolean,
    legacy?: StageMap
): StageProgress {
    const count = Math.max(1, Math.min(MAX_SPELL_STAGE, Math.floor(stageCount) || 1)) as SpellStage;
    const explicit = toStage(state.spellUnlocked?.[key]);
    const chosen = toStage(state.spellStages?.[key]) ?? 1;

    if (!enabled) {
        const active = Math.min(chosen, count) as SpellStage;
        return { enabled, count, unlocked: count, active, next: null, needsMaterialize: false };
    }

    const unlocked = Math.min(explicit ?? toStage((legacy ?? state.spellStages)?.[key]) ?? 1, count) as SpellStage;
    const active = Math.min(chosen, unlocked) as SpellStage;
    const next = unlocked < count ? (unlocked + 1) as SpellStage : null;
    return { enabled, count, unlocked, active, next, needsMaterialize: explicit === undefined };
}

/**
 * `spellUnlocked` com esta magia gravada. Chamar antes de mudar o estágio ativo de uma magia de ficha antiga: grava o
 * estágio que ela já tinha liberado. Devolve o mesmo objeto quando não há o que gravar.
 */
export function materializeUnlocked(
    spellUnlocked: StageMap,
    key: string,
    progress: Pick<StageProgress, 'enabled' | 'unlocked' | 'needsMaterialize'>
): Record<string, number> {
    const current = (spellUnlocked ?? {}) as Record<string, number>;
    if (!progress.enabled || !progress.needsMaterialize) return current;
    return { ...current, [key]: progress.unlocked };
}

/** Remove a magia dos dois mapas (ao excluí-la da ficha) */
export function withoutSpell(map: StageMap, key: string): Record<string, number> {
    return Object.fromEntries(Object.entries(map ?? {}).filter(([ entry ]) => entry !== key)) as Record<string, number>;
}

/** Quanto custa evoluir uma magia (liberar o próximo estágio) */
export const EVOLUTION_POINT_COST = 1;

/** Pontos de evolução da ficha (`points.evolution`); ficha antiga não tem o campo, então vale 0 */
export function getEvolutionPoints(points: { evolution?: unknown } | null | undefined): number {
    const value = Math.floor(Number(points?.evolution ?? 0));
    return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Dá para evoluir agora? Precisa da regra valendo, de um estágio seguinte e de ponto de evolução */
export function canEvolve(progress: Pick<StageProgress, 'enabled' | 'next'>, evolutionPoints: number): boolean {
    return progress.enabled && progress.next !== null && evolutionPoints >= EVOLUTION_POINT_COST;
}
