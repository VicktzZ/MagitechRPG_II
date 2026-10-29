import type { Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { rollDice, type DiceResult } from '@utils/diceRoller';
import { buildActionRollText } from './actionRollMessage';
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
    /** Atacou furtivo: `total` já é o dano rolado vezes `STEALTH_DAMAGE_MULTIPLIER` */
    stealth?: boolean;
}

export interface WeaponRollOptions {
    /** O atacante está com o efeito Furtivo (ver `stealth.ts`) */
    stealth?: boolean;
    /** O que as passivas e os efeitos de habilidade somam ao dano (`passives/rolls.ts`); o Furtivo dobra a soma toda */
    extras?: readonly ExtraSpec[];
}

export interface WeaponHitOptions extends WeaponRollOptions {
    /** Vantagens e desvantagens de ataque dos efeitos aplicados (`effectDice(efeitos, 'attack')`) */
    effects?: EffectDice;
    /** Valor fixo somado ao acerto (Ritmo da Batalha) e a origem dele, para o chat */
    flatBonus?: { flat: number; notes: string[] };
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
        flatBonus: options.flatBonus?.flat
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
    const formula = (isCritical ? weapon.effect?.critValue : weapon.effect?.value) ?? '';
    const trimmed = String(formula).trim();
    if (!trimmed) return null;

    const result = rollDice(trimmed);

    // Os acréscimos (passivas e habilidades) entram no dano; o Furtivo dobra a soma toda
    const withExtras = (rolled: number, notation: string, display: string): WeaponDamageResult => {
        const extras = rollSpecs(options.extras ?? [], rollExtraDice);
        return {
            notation,
            display,
            total: (rolled + sumSegments(extras)) * factor,
            rolled,
            extras,
            isCritical,
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
    return `🎯 ${playerName} testou acerto com **${weapon.name}** (${hit.bonusLabel}${detail}): [${rollPart}] ${sign}${hit.bonus} = **${hit.total}**`;
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
