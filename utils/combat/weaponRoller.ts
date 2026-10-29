import type { Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { rollDice, type DiceResult } from '@utils/diceRoller';
import { buildActionRollText } from './actionRollMessage';
import { applyCritMultiplier, critMargin, critMarginLabel, DEFAULT_CRIT_MULTIPLIER } from './critical';
import { effectDice, type EffectDice } from './effectDice';
import { rollHitTest, type HitTestResult } from './hitTest';
import { rollExtraDice } from './passives/roller';
import { rollSpecs, sumSegments, type ExtraSegment, type ExtraSpec } from './passives/rolls';
import { STEALTH_DAMAGE_MULTIPLIER, STEALTH_EXTRA_D20 } from './stealth';

export interface WeaponDamageResult {
    notation: string;
    display: string;
    /** O dano final; com o efeito Furtivo é o dobro do rolado (a arma mais os acréscimos) */
    total: number;
    /** O dano da arma, rolado, sem os acréscimos e sem o Furtivo */
    rolled: number;
    /** Acréscimos das passivas e das habilidades ativadas (Armado +1d8, Bom de Briga +5...), cada um com a origem; já dentro de `total` */
    extras: ExtraSegment[];
    isCritical: boolean;
    /**
     * O crítico saiu do multiplicador (a arma não tem fórmula própria de crítico, `effect.critValue`): `total` já é a soma (dano rolado e acréscimos) vezes isto.
     * Arma com fórmula própria de crítico rola a fórmula e não tem multiplicador
     */
    critMultiplier?: number;
    /** Atacou furtivo: `total` já é o dano rolado vezes `STEALTH_DAMAGE_MULTIPLIER` */
    stealth?: boolean;
}

export interface WeaponRollOptions {
    /** O atacante está com o efeito Furtivo (ver `stealth.ts`) */
    stealth?: boolean;
    /** O que as passivas e os efeitos de habilidade somam ao dano (`passives/rolls.ts`); o Furtivo dobra a soma toda */
    extras?: readonly ExtraSpec[];
    /** O multiplicador do crítico quando a arma não tem fórmula própria (`critMultiplier` de `critical.ts`: ×2, ou o que uma habilidade sobe); sem ele vale ×2 */
    critMultiplier?: number;
}

export interface WeaponHitOptions extends WeaponRollOptions {
    /** Vantagens e desvantagens de ataque dos efeitos aplicados (`effectDice(efeitos, 'attack')`) */
    effects?: EffectDice;
    /** Valor fixo somado ao acerto (Ritmo da Batalha) e a origem dele, para o chat */
    flatBonus?: { flat: number; notes: string[] };
    /** Quanto as passivas e os efeitos baixam a margem de crítico da arma (Forma Primordial −2); a margem sai de `effect.critChance` (20 se vazia) */
    critMarginReduction?: number;
}

/**
 * Rola o teste de acerto da arma. Numero de d20s vem de mods.attributes[hit] (>=1)
 * e o bonus do atributo/pericia equivalente. Furtivo: 1d20 a mais (vantagem, vale o maior). Os efeitos aplicados somam vantagens e
 * desvantagens (`effectDice.ts`): o saldo líquido decide quantos d20 rolar e se vale o maior ou o menor.
 */
export function rollWeaponHit(weapon: Weapon, charsheet: CharsheetDTO, options: WeaponHitOptions = {}): HitTestResult {
    const effects = options.effects ?? effectDice([], 'attack');
    const stealthDice = options.stealth ? STEALTH_EXTRA_D20 : 0;
    return rollHitTest(weapon.hit, charsheet, {
        extraDice: stealthDice + effects.advantages,
        lessDice: effects.disadvantages,
        notes: [ ...(stealthDice > 0 ? [ `furtivo: vantagem, +${stealthDice}d20` ] : []), ...effects.notes, ...(options.flatBonus?.notes ?? []) ],
        flatBonus: options.flatBonus?.flat,
        critMargin: critMargin(weapon.effect?.critChance, options.critMarginReduction)
    });
}

/**
 * Rola dano (normal ou critico) usando o roller padrao de dados.
 * Aceita expressoes como "2d6", "3d8+2", etc. Se a expressao for invalida
 * tenta interpretar valores numericos puros como dano fixo. Furtivo: o dano (normal ou critico) sai dobrado.
 */
export function rollWeaponDamage(weapon: Weapon, isCritical: boolean, options: WeaponRollOptions = {}): WeaponDamageResult | null {
    const stealth = Boolean(options.stealth);
    const factor = stealth ? STEALTH_DAMAGE_MULTIPLIER : 1;
    // Crítico: a arma rola a fórmula própria (`critValue`); sem ela, o crítico é o dano normal vezes o multiplicador (×2, ou o que uma habilidade sobe)
    const ownCritFormula = isCritical ? String(weapon.effect?.critValue ?? '').trim() : '';
    const byMultiplier = isCritical && ownCritFormula === '';
    const multiplier = byMultiplier ? (options.critMultiplier ?? DEFAULT_CRIT_MULTIPLIER) : 1;
    const formula = isCritical ? (byMultiplier ? weapon.effect?.value : ownCritFormula) : weapon.effect?.value;
    const trimmed = String(formula ?? '').trim();
    if (!trimmed) return null;

    const result = rollDice(trimmed);

    // Os acréscimos (passivas e habilidades) entram no dano; o Furtivo dobra a soma toda
    const withExtras = (rolled: number, notation: string, display: string): WeaponDamageResult => {
        const extras = rollSpecs(options.extras ?? [], rollExtraDice);
        return {
            notation,
            display,
            total: applyCritMultiplier(rolled + sumSegments(extras), multiplier) * factor,
            rolled,
            extras,
            isCritical,
            ...(byMultiplier ? { critMultiplier: multiplier } : {}),
            ...(stealth ? { stealth } : {})
        };
    };

    if (result && !result.error) return withExtras(result.total, trimmed, result.display ?? `[${result.rolls.join(', ')}]`);

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return withExtras(numeric, trimmed, `${numeric}`);

    return null;
}

export function buildHitMessageText(playerName: string, weapon: Weapon, hit: HitTestResult): string {
    const rollPart = hit.rolls.length > 1
        ? `${hit.rolls.join(', ')}: ${hit.bestRoll}`
        : `${hit.bestRoll}`;
    const sign = hit.bonus >= 0 ? '+' : '';
    // Furtivo e efeitos que dão vantagem ou desvantagem, e qual d20 vale quando a desvantagem passa das vantagens
    const notes = hit.notes ?? (hit.extraDice > 0 ? [ `furtivo: vantagem, +${hit.extraDice}d20` ] : []);
    const detail = [ ...notes, ...(hit.keep === 'lowest' ? [ 'vale o menor' ] : []) ].map(note => `, ${note}`).join('');
    const critical = hit.critical ? ` — **ACERTO CRÍTICO** (${critMarginLabel(hit.critMargin)})` : '';
    return `🎯 ${playerName} testou acerto com **${weapon.name}** (${hit.bonusLabel}${detail}): [${rollPart}] ${sign}${hit.bonus} = **${hit.total}**${critical}`;
}

/**
 * Texto do dano da arma para o chat (mensagem de dados, ver `actionRollMessage.ts`): o cartão mostra o total à vista e as
 * rolagens no dropdown, com o dano crítico marcado.
 */
export function buildDamageMessageText(playerName: string, weapon: Weapon, damage: WeaponDamageResult): string {
    return buildActionRollText({
        kind: 'arma',
        player: playerName,
        title: weapon.name,
        detail: [ damage.isCritical ? 'Dano crítico' : 'Dano', weapon.effect?.effectType ].filter(Boolean).join(' · '),
        critical: damage.isCritical,
        ...(damage.critMultiplier ? { multiplier: damage.critMultiplier } : {}),
        ...(damage.stealth ? { stealth: true } : {}),
        total: damage.total,
        cost: null,
        dt: null,
        segments: [
            { notation: damage.notation, display: damage.display, total: damage.rolled },
            ...damage.extras.map(({ notation, display, total }) => ({ notation, display, total }))
        ]
    });
}

export function buildDamageErrorText(weapon: Weapon, isCritical: boolean): string {
    const fld = isCritical ? 'crítico' : 'normal';
    return `❌ Não foi possível rolar o dano ${fld} de ${weapon.name}: fórmula inválida.`;
}

// Reexport para reuso em UIs que ja consomem rollDice
export type { DiceResult };
