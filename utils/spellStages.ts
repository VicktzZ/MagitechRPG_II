/**
 * Estágios desbloqueados de uma magia.
 *
 * Regra (definida pelo dono do projeto): toda magia começa no estágio 1; o jogador evolui a magia e libera o estágio
 * seguinte, em ordem; o mestre também pode ajustar. Estágio acima do liberado fica bloqueado (sem texto do efeito)
 * e não pode ser escolhido nem conjurado. O MP extra de cada estágio ao conjurar (`calculateExtraManaCost`) continua valendo.
 *
 * Evoluir custa **pontos de evolução** (`points.evolution`), concedidos pelo mestre e a cada 5 níveis (`utils/evolutionPoints.ts`).
 * O custo depende do nível da magia (`stageRule`):
 * - nível 1 e 2: 1 ponto por estágio;
 * - nível 3: 2 pontos por estágio;
 * - nível 4: 3 pontos para o estágio 2. O 3º estágio é a **Maestria**: abre sozinho, sem gastar ponto, depois do estágio 2, para
 *   quem tem maestria no elemento da magia (`elementalMastery`). **Sem a maestria no elemento a Maestria não se libera de
 *   maneira nenhuma**: nem se compra, nem o ajuste do mestre nem o `spellStages` legado a abrem (o estágio liberado é limitado
 *   ao 2 ao ler a ficha). Em elemento **secundário** o nível 4 não tem Maestria: o estágio 3 é um estágio comum, rotulado
 *   "Estágio 3", e se compra por 3 pontos (os mesmos do estágio 2), tenha ou não maestria no elemento.
 * O ajuste direto do mestre (aba de magias do detalhe da ficha) não gasta ponto, mas também não passa por cima da Maestria.
 *
 * Não existe "estágio ativo": quem evoluiu a magia conjura o estágio liberado ou qualquer um dos anteriores, escolhendo na hora
 * de conjurar (cada estágio traz o próprio custo de MP).
 *
 * Campo da ficha: `spellUnlocked[chave]` é o estágio liberado até agora. A chave é o id da magia (ou o nome, quando a magia não tem id).
 * `spellStages[chave]` é **legado**: guardava o estágio que o jogador escolhera usar. A tela não grava mais esse campo, e ele só vale
 * como estágio liberado em ficha criada antes da regra (sem `spellUnlocked`), senão ninguém perderia de repente o estágio 3 que conjurava.
 */

import { isSecondaryElement, sameElement } from './elements';

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
    /** Estágio liberado até agora: dele e de todos os anteriores se pode conjurar */
    unlocked: SpellStage;
    /** Próximo estágio a liberar, ou `null` se já liberou todos */
    next: SpellStage | null;
}

/** `spellUnlocked`; sem ele (ficha antiga) vale o `spellStages` legado; sem nenhum dos dois a magia está no estágio 1 */
export function getStageProgress(state: StageSheetState, key: string, stageCount: number, enabled: boolean): StageProgress {
    const count = Math.max(1, Math.min(MAX_SPELL_STAGE, Math.floor(stageCount) || 1)) as SpellStage;
    if (!enabled) return { enabled, count, unlocked: count, next: null };

    const unlocked = Math.min(toStage(state.spellUnlocked?.[key]) ?? toStage(state.spellStages?.[key]) ?? 1, count) as SpellStage;
    return { enabled, count, unlocked, next: unlocked < count ? (unlocked + 1) as SpellStage : null };
}

/** Remove a magia dos dois mapas (ao excluí-la da ficha) */
export function withoutSpell(map: StageMap, key: string): Record<string, number> {
    return Object.fromEntries(Object.entries(map ?? {}).filter(([ entry ]) => entry !== key)) as Record<string, number>;
}

/** Custo, em pontos de evolução, de cada estágio das magias de nível 1 e 2 (e de qualquer nível sem regra própria) */
export const EVOLUTION_POINT_COST = 1;

/** Pontos de evolução da ficha (`points.evolution`); ficha antiga não tem o campo, então vale 0 */
export function getEvolutionPoints(points: { evolution?: unknown } | null | undefined): number {
    const value = Math.floor(Number(points?.evolution ?? 0));
    return Number.isFinite(value) && value > 0 ? value : 0;
}

/** "1 ponto de evolução", "3 pontos de evolução" */
export function formatEvolutionPoints(amount: number): string {
    return `${amount} ${amount === 1 ? 'ponto' : 'pontos'} de evolução`;
}

/**
 * Nome do estágio: no nível 4 de elemento primário o terceiro é a Maestria. No de elemento secundário (que não tem
 * Maestria) ele é um estágio comum, "Estágio 3". Sem `element` vale o primário.
 */
export function spellStageLabel(level: unknown, stage: number, element?: unknown): string {
    return Number(level) === 4 && stage === 3 && !isSecondaryElement(element) ? 'Maestria' : `Estágio ${stage}`;
}

/**
 * Como se chega a um estágio:
 * - `start`   o estágio 1, que toda magia tem;
 * - `points`  gastando pontos de evolução;
 * - `mastery` sem gastar ponto, para quem tem maestria no elemento (3º estágio do nível 4 de elemento primário).
 */
export type StageAccess = 'start' | 'points' | 'mastery';

export interface StageRule {
    stage: SpellStage;
    access: StageAccess;
    /** Pontos de evolução para liberar o estágio; 0 no estágio 1 e na maestria */
    cost: number;
}

interface SpellRef {
    level?: unknown;
    element?: unknown;
}

/** A regra de custo do estágio da magia (ver o cabeçalho do arquivo) */
export function stageRule(spell: SpellRef, stage: SpellStage): StageRule {
    if (stage === 1) return { stage, access: 'start', cost: 0 };

    const level = Number(spell.level);
    if (level === 4) {
        if (stage === 2) return { stage, access: 'points', cost: 3 };
        return isSecondaryElement(spell.element)
            ? { stage, access: 'points', cost: 3 }
            : { stage, access: 'mastery', cost: 0 };
    }
    if (level === 3) return { stage, access: 'points', cost: 2 };
    return { stage, access: 'points', cost: EVOLUTION_POINT_COST };
}

/** O que o jogador precisa para liberar o estágio, em uma frase ("Custa 2 pontos de evolução"); vazio no estágio 1 */
export function stageAccessText(rule: StageRule, element: unknown): string {
    if (rule.access === 'start') return '';
    if (rule.access === 'mastery') {
        const name = typeof element === 'string' && element ? ` em ${element.toLowerCase()}` : '';
        return `Abre sozinho com maestria${name}`;
    }
    return `Custa ${formatEvolutionPoints(rule.cost)}`;
}

export interface StageInfo {
    stage: SpellStage;
    label: string;
    rule: StageRule;
    status: 'unlocked' | 'next' | 'locked';
    /** Liberado pela maestria no elemento, sem gastar ponto */
    byMastery: boolean;
}

export interface SpellProgress extends StageProgress {
    /** Estágio liberado por pontos (ou herdado da ficha antiga): é o que fica gravado em `spellUnlocked`; a maestria não entra */
    purchased: SpellStage;
    /** Pontos para liberar o próximo estágio; `null` quando não há próximo ou ele só abre pela maestria */
    nextCost: number | null;
    /** O próximo estágio é a Maestria e a ficha não tem maestria no elemento da magia */
    needsMastery: boolean;
    /** A magia tem Maestria (3º estágio do nível 4 de elemento primário) e a ficha não tem a maestria no elemento: ela fica bloqueada, por qualquer caminho */
    masteryRequired: boolean;
    /** Todos os estágios da magia, do primeiro ao último, com a situação de cada um */
    stages: StageInfo[];
}

export interface SpellProgressOptions {
    /** A regra de desbloqueio vale para esta ficha? (`usesStageUnlock`) */
    enabled: boolean;
}

/**
 * `getStageProgress` da magia mais o custo de evoluir e a maestria: no nível 4 de elemento primário, quem tem maestria
 * no elemento e já liberou o estágio 2 ganha a Maestria (3º estágio) sozinho.
 */
export function getSpellProgress(
    spell: SpellRef & { id?: string | null; name?: string | null; stages?: unknown },
    sheet: StageSheetState & { elementalMastery?: unknown },
    options: SpellProgressOptions
): SpellProgress {
    const key = spellStageKey(spell);
    const base = getStageProgress(sheet, key, spellStageCount(spell), options.enabled);

    // A Maestria existe só no 3º estágio do nível 4 de elemento primário e só abre para quem tem a maestria no elemento.
    // Sem ela o liberado nunca passa do 2, venha o 3 do ajuste do mestre, do `spellStages` legado ou de um valor antigo gravado
    const hasMasteryStage = base.enabled && base.count >= 3 && stageRule(spell, 3).access === 'mastery';
    const hasMastery = hasMasteryStage && sameElement(sheet.elementalMastery, spell.element);
    const masteryRequired = hasMasteryStage && !hasMastery;
    const purchased = (masteryRequired ? Math.min(base.unlocked, 2) : base.unlocked) as SpellStage;

    const masteryOpens = hasMastery && purchased === 2;
    const unlocked: SpellStage = masteryOpens ? 3 : purchased;
    const next = unlocked < base.count ? (unlocked + 1) as SpellStage : null;

    const nextRule = next && base.enabled ? stageRule(spell, next) : null;
    const stages: StageInfo[] = Array.from({ length: base.count }, (_, index) => {
        const stage = (index + 1) as SpellStage;
        return {
            stage,
            label: spellStageLabel(spell.level, stage, spell.element),
            rule: stageRule(spell, stage),
            status: stage <= unlocked ? 'unlocked' : stage === unlocked + 1 ? 'next' : 'locked',
            byMastery: masteryOpens && stage === 3
        };
    });

    return {
        ...base,
        unlocked,
        next,
        purchased,
        nextCost: nextRule?.access === 'points' ? nextRule.cost : null,
        needsMastery: nextRule?.access === 'mastery',
        masteryRequired,
        stages
    };
}

/** Dá para evoluir agora? Precisa da regra valendo, de um estágio seguinte que se compra e de pontos de evolução suficientes */
export function canEvolve(
    progress: Pick<StageProgress, 'enabled' | 'next'> & { nextCost?: number | null },
    evolutionPoints: number
): boolean {
    if (!progress.enabled || progress.next === null) return false;
    const cost = progress.nextCost === undefined ? EVOLUTION_POINT_COST : progress.nextCost;
    return cost !== null && evolutionPoints >= cost;
}

/** Texto curto do que falta para evoluir a magia, ou `null` quando já dá (ou não há o que evoluir) */
export function evolutionBlockReason(
    progress: Pick<SpellProgress, 'enabled' | 'next' | 'nextCost' | 'needsMastery'>,
    evolutionPoints: number,
    element: unknown
): string | null {
    if (!progress.enabled || progress.next === null) return null;
    if (progress.needsMastery) return `${stageAccessText({ stage: 3, access: 'mastery', cost: 0 }, element)}; não se compra com pontos`;
    if (progress.nextCost === null || evolutionPoints >= progress.nextCost) return null;
    const missing = progress.nextCost - evolutionPoints;
    return `Faltam ${formatEvolutionPoints(missing)} (você tem ${evolutionPoints}). Peça ao mestre.`;
}
