import type { SpellDTO } from '@models/dtos';
import { rollDice } from '@utils/diceRoller';
import { calculateTotalManaCost } from '@utils/roguelite/spellCost';
import { spellStageLabel, type SpellStage } from '@utils/spellStages';
import { spellCastDifficulty } from '@utils/spellDifficulty';
import { buildActionRollText } from './actionRollMessage';
import { applyCritMultiplier, critMarginLabel } from './critical';
import type { HitTestResult } from './hitTest';
import { rollExtraDice } from './passives/roller';
import { firstDie, isDurationExpression, rollSpecs, sumSegments, type ExtraSegment, type ExtraSpec, type SpellCostAdjustment } from './passives/rolls';

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
    /** Os acréscimos das passivas e das habilidades ativadas ao dano ou à cura (já dentro de `segments` e `totalDamage`) */
    extras?: ExtraSegment[];
    /** A magia de ataque foi conjurada em crítico: o dano (nunca a duração) já está vezes isto em `totalDamage`; as rolagens de `segments` mostram os valores sem multiplicar */
    critMultiplier?: number;
}

export interface SpellEffectOptions {
    /** O multiplicador do crítico (`critMultiplier` de `critical.ts`), para a magia de ataque conjurada com o d20 natural na margem; sem ele o efeito sai normal */
    critMultiplier?: number;
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

/**
 * Custo total de MP de conjurar a magia neste estagio (base + extra do estagio). `adjustment` são as passivas que mexem no custo (Magismo Total: −1 MP e o estágio Maestria do
 * nível 4 sem o MP extra, ou seja, custa o mesmo que o estágio anterior); o custo nunca fica abaixo de zero.
 */
export function getSpellMpCost(spell: SpellDTO, stage: SpellStage, adjustment?: Pick<SpellCostAdjustment, 'delta' | 'freeMasteryExtra'>): number {
    const base = Number(spell.mpCost) || 0;
    const level = Number(spell.level) || 1;
    const masteryStage = level === 4 && stage === 3;
    const costStage = adjustment?.freeMasteryExtra && masteryStage ? 2 : stage;
    const cost = calculateTotalManaCost(base, level, costStage - 1, spell.mpCostIncrease);
    return Math.max(0, cost + (adjustment?.delta ?? 0));
}

/** Se o texto do estagio tem dados a rolar ao efetuar a magia; sem eles conjurar basta */
export function hasSpellEffectDice(spell: SpellDTO, stage: SpellStage): boolean {
    return extractDiceExpressions(stageText(spell, stage)).length > 0;
}

/**
 * Efetua a magia: extrai e rola todas as expressoes de dados encontradas no texto do estagio
 * (dano, cura, duracao em turnos...). O custo de MP e o teste de magia ja foram feitos ao conjurar.
 * `extras` são os acréscimos das passivas e das habilidades ativadas (Feitiçaria +1, Manipulação Elemental +1d8...): entram no dano ou na cura, nunca numa duração, e viram
 * segmentos à parte no cartão, com a origem no nome. Sem dado de dano ou cura no estágio não há acréscimo.
 */
export function rollSpellEffect(spell: SpellDTO, stage: SpellStage, extras: readonly ExtraSpec[] = [], options: SpellEffectOptions = {}): SpellEffectResult {
    const segments: SpellRollSegment[] = [];
    let damageTotal = 0;
    let durationTotal = 0;
    let die: { sides: number } | null = null;
    const text = stageText(spell, stage);

    for (const expr of extractDiceExpressions(text)) {
        const result = rollDice(expr);
        if (!result || result.error) continue;
        segments.push({
            notation: expr,
            total: result.total,
            display: result.display ?? `[${result.rolls.join(', ')}]`
        });
        if (isDurationExpression(text, expr)) {
            durationTotal += result.total;
        } else {
            damageTotal += result.total;
            if (!die) die = firstDie(expr);
        }
    }

    // Os acréscimos valem só se o estágio tem dado de dano ou cura (a duração em turnos não recebe nada)
    let added: ExtraSegment[] | undefined;
    if (die && extras.length > 0) {
        added = rollSpecs(extras, rollExtraDice, die);
        for (const { notation, display, total } of added) segments.push({ notation, display, total });
        damageTotal += sumSegments(added);
    }

    // Crítico: o dano e a cura do estágio (com os acréscimos) saem vezes o multiplicador; a duração em turnos não dobra
    const multiplier = die && options.critMultiplier && options.critMultiplier > 1 ? options.critMultiplier : undefined;
    const result: SpellEffectResult = { spell, stage, segments, totalDamage: applyCritMultiplier(damageTotal, multiplier ?? 1) + durationTotal };
    if (added) result.extras = added;
    if (multiplier) result.critMultiplier = multiplier;
    return result;
}

const spellDetail = (spell: SpellDTO, stage: SpellStage, phase: string): string =>
    [ spell.element ? String(spell.element) : '', spellStageLabel(spell.level, stage, spell.element), phase ].filter(Boolean).join(' · ');

/**
 * Texto da conjuração para o chat (mensagem de dados, ver `actionRollMessage.ts`): o teste de magia do jogador, que
 * é o resultado à vista, e o custo de MP gasto. As rolagens do efeito vêm depois, ao efetuar a magia.
 */
export function buildSpellCastMessage(playerName: string, spell: SpellDTO, stage: SpellStage, test: HitTestResult, mpCost: number, options: { critical?: boolean } = {}): string {
    const label = test.bonusLabel === '—' ? '' : ` ${test.bonusLabel}`;
    // Acerto crítico: o d20 natural que valeu passou da margem (só na magia de ataque conjurada com sucesso; quem chama decide)
    const critical = Boolean(options.critical);
    const notes = [ ...(test.notes ?? []), ...(critical ? [ `Acerto crítico (${critMarginLabel(test.critMargin)}): o efeito sai em dobro` ] : []) ];

    return buildActionRollText({
        kind: 'conjuração',
        player: playerName,
        title: spell.name,
        detail: spellDetail(spell, stage, 'Conjuração'),
        critical,
        ...(test.keep === 'lowest' ? { keepLowest: true } : {}),
        ...(notes.length > 0 ? { notes } : {}),
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
        critical: result.critMultiplier !== undefined,
        ...(result.critMultiplier ? { multiplier: result.critMultiplier } : {}),
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
