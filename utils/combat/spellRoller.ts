import type { SpellDTO } from '@models/dtos';
import { rollDice } from '@utils/diceRoller';
import { calculateTotalManaCost } from '@utils/roguelite/spellCost';

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

export function buildSpellCastMessage(playerName: string, result: SpellCastResult): string {
    const stageLabel = result.stage === 4 ? 'Maestria' : `Estágio ${result.stage}`;
    const elementTag = result.spell.element ? ` [${result.spell.element}]` : '';

    if (result.segments.length === 0) {
        return `✨ ${playerName} conjurou **${result.spell.name}**${elementTag} (${stageLabel}) — custo: **${result.mpCost} MP**`;
    }

    const detail = result.segments
        .map(s => `${s.notation}: ${s.display} = ${s.total}`)
        .join(' • ');

    return `✨ ${playerName} conjurou **${result.spell.name}**${elementTag} (${stageLabel}): **${result.totalDamage}** [${detail}] — custo: **${result.mpCost} MP**`;
}

export function buildInsufficientMpMessage(playerName: string, spell: SpellDTO, mpCost: number, currentMp: number): string {
    return `❌ ${playerName} tentou conjurar **${spell.name}** mas possui apenas ${currentMp} MP (precisa de ${mpCost}).`;
}
