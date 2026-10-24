import type { SpellDTO } from '@models/dtos';
import { rollDice } from '@utils/diceRoller';
import { calculateTotalManaCost } from '@utils/roguelite/spellCost';
import { spellStageLabel } from '@utils/spellStages';
import { buildActionRollText } from './actionRollMessage';

export interface SpellRollSegment {
    notation: string;
    total: number;
    display: string;
}

export interface SpellCastResult {
    spell: SpellDTO;
    stage: number;
    mpCost: number;
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

/**
 * Conjura uma magia em um determinado estagio.
 * - Calcula o custo total de MP (base + extra do estagio)
 * - Extrai e rola todas as expressoes de dados encontradas no texto do estagio
 * - Retorna o resumo da conjuracao
 */
export function castSpell(spell: SpellDTO, stage: 1 | 2 | 3): SpellCastResult {
    const stageIndex = Math.max(0, Math.min(2, stage - 1));
    const stageText = spell.stages?.[stageIndex] ?? '';

    const expressions = extractDiceExpressions(stageText);
    const segments: SpellRollSegment[] = [];
    let totalDamage = 0;

    for (const expr of expressions) {
        const result = rollDice(expr);
        if (!result || result.error) continue;
        segments.push({
            notation: expr,
            total: result.total,
            display: result.display ?? `[${result.rolls.join(', ')}]`
        });
        totalDamage += result.total;
    }

    const mpCost = calculateTotalManaCost(Number(spell.mpCost) || 0, Number(spell.level) || 1, stage - 1);

    return {
        spell,
        stage,
        mpCost,
        segments,
        totalDamage
    };
}

/**
 * Texto da conjuração para o chat (mensagem de dados, ver `actionRollMessage.ts`): o cartão mostra o total do dano à vista,
 * as rolagens no dropdown e o custo de MP. Magia sem dado só mostra o custo.
 */
export function buildSpellCastMessage(playerName: string, result: SpellCastResult): string {
    const stageLabel = spellStageLabel(result.spell.level, result.stage, result.spell.element);
    const element = result.spell.element ? String(result.spell.element) : '';

    return buildActionRollText({
        kind: 'magia',
        player: playerName,
        title: result.spell.name,
        detail: [ element, stageLabel ].filter(Boolean).join(' · '),
        critical: false,
        total: result.segments.length > 0 ? result.totalDamage : null,
        cost: result.mpCost,
        segments: result.segments.map(({ notation, display, total }) => ({ notation, display, total }))
    });
}

export function buildInsufficientMpMessage(playerName: string, spell: SpellDTO, mpCost: number, currentMp: number): string {
    return `❌ ${playerName} tentou conjurar **${spell.name}** mas possui apenas ${currentMp} MP (precisa de ${mpCost}).`;
}

export function buildMpLimitExceededMessage(playerName: string, spell: SpellDTO, mpCost: number, spent: number, limit: number): string {
    return `⛔ ${playerName} tentou conjurar **${spell.name}** (${mpCost} MP), mas já gastou ${spent} de ${limit} MP neste turno. O mestre pode liberar o limite.`;
}
