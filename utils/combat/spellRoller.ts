import type { SpellDTO } from '@models/dtos';
import { rollDice } from '@utils/diceRoller';
import { calculateTotalManaCost } from '@utils/roguelite/spellCost';
import { spellStageLabel, type SpellStage } from '@utils/spellStages';
import { spellCastDifficulty } from '@utils/spellDifficulty';
import { buildActionRollText } from './actionRollMessage';
import type { HitTestResult } from './hitTest';

export interface SpellRollSegment {
    notation: string;
    total: number;
    display: string;
}

/** Os dados do efeito de um estágio (dano, cura, duração...), rolados ao efetuar a magia */
export interface SpellEffectResult {
    spell: SpellDTO;
    stage: SpellStage;
    segments: SpellRollSegment[];
    totalDamage: number;
}

const DICE_REGEX = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/gi;

/**
 * Extrai todas as expressoes de dados (XdY ou XdY+/-Z) presentes no texto descritivo
 * de um estagio de magia. Retorna a lista de notacoes encontradas, sem duplicar.
 */
export function extractDiceExpressions(text: string): string[] {
    if (!text) return [];
    const found = new Set<string>();
    const matches = text.match(DICE_REGEX) ?? [];
    for (const m of matches) {
        const cleaned = m.replace(/\s+/g, '');
        if (cleaned) found.add(cleaned.toLowerCase());
    }
    return Array.from(found);
}

const stageText = (spell: SpellDTO, stage: SpellStage): string => spell.stages?.[Math.max(0, Math.min(2, stage - 1))] ?? '';

/** Custo total de MP de conjurar a magia neste estagio (base + extra do estagio) */
export function getSpellMpCost(spell: SpellDTO, stage: SpellStage): number {
    return calculateTotalManaCost(Number(spell.mpCost) || 0, Number(spell.level) || 1, stage - 1, spell.mpCostIncrease);
}

/** Se o texto do estagio tem dados a rolar ao efetuar a magia; sem eles conjurar basta */
export function hasSpellEffectDice(spell: SpellDTO, stage: SpellStage): boolean {
    return extractDiceExpressions(stageText(spell, stage)).length > 0;
}

/**
 * Efetua a magia: extrai e rola todas as expressoes de dados encontradas no texto do estagio
 * (dano, cura, duracao em turnos...). O custo de MP e o teste de magia ja foram feitos ao conjurar.
 */
export function rollSpellEffect(spell: SpellDTO, stage: SpellStage): SpellEffectResult {
    const segments: SpellRollSegment[] = [];
    let totalDamage = 0;

    for (const expr of extractDiceExpressions(stageText(spell, stage))) {
        const result = rollDice(expr);
        if (!result || result.error) continue;
        segments.push({
            notation: expr,
            total: result.total,
            display: result.display ?? `[${result.rolls.join(', ')}]`
        });
        totalDamage += result.total;
    }

    return { spell, stage, segments, totalDamage };
}

const spellDetail = (spell: SpellDTO, stage: SpellStage, phase: string): string =>
    [ spell.element ? String(spell.element) : '', spellStageLabel(spell.level, stage, spell.element), phase ].filter(Boolean).join(' · ');

/**
 * Texto da conjuração para o chat (mensagem de dados, ver `actionRollMessage.ts`): o teste de magia do jogador, que
 * é o resultado à vista, e o custo de MP gasto. As rolagens do efeito vêm depois, ao efetuar a magia.
 */
export function buildSpellCastMessage(playerName: string, spell: SpellDTO, stage: SpellStage, test: HitTestResult, mpCost: number): string {
    const label = test.bonusLabel === '—' ? '' : ` ${test.bonusLabel}`;

    return buildActionRollText({
        kind: 'conjuração',
        player: playerName,
        title: spell.name,
        detail: spellDetail(spell, stage, 'Conjuração'),
        critical: false,
        ...(test.keep === 'lowest' ? { keepLowest: true } : {}),
        ...(test.notes && test.notes.length > 0 ? { notes: test.notes } : {}),
        total: test.total,
        cost: mpCost,
        dt: spellCastDifficulty(spell.level, stage),
        segments: [ {
            notation: test.notation,
            display: `[${test.rolls.join(', ')}] ${test.bonus >= 0 ? '+' : '-'} ${Math.abs(test.bonus)}${label}`,
            total: test.total
        } ]
    });
}

/** Texto do efeito da magia para o chat: o total do dano/cura à vista e as rolagens no dropdown (sem custo: ele foi pago ao conjurar) */
export function buildSpellEffectMessage(playerName: string, result: SpellEffectResult): string {
    return buildActionRollText({
        kind: 'efeito',
        player: playerName,
        title: result.spell.name,
        detail: spellDetail(result.spell, result.stage, 'Efeito'),
        critical: false,
        total: result.segments.length > 0 ? result.totalDamage : null,
        cost: null,
        dt: null,
        segments: result.segments.map(({ notation, display, total }) => ({ notation, display, total }))
    });
}

export function buildInsufficientMpMessage(playerName: string, spell: SpellDTO, mpCost: number, currentMp: number): string {
    return `❌ ${playerName} tentou conjurar **${spell.name}** mas possui apenas ${currentMp} MP (precisa de ${mpCost}).`;
}

export function buildMpLimitExceededMessage(playerName: string, spell: SpellDTO, mpCost: number, spent: number, limit: number): string {
    return `⛔ ${playerName} tentou conjurar **${spell.name}** (${mpCost} MP), mas já gastou ${spent} de ${limit} MP nesta rodada. O mestre pode liberar o limite.`;
}
