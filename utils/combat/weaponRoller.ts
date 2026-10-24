import type { Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { rollDice, type DiceResult } from '@utils/diceRoller';
import { buildActionRollText } from './actionRollMessage';
import { rollHitTest, type HitTestResult } from './hitTest';
import { STEALTH_DAMAGE_MULTIPLIER, STEALTH_EXTRA_D20 } from './stealth';

export interface WeaponDamageResult {
    notation: string;
    display: string;
    /** O dano final; com o efeito Furtivo é o dobro do rolado */
    total: number;
    isCritical: boolean;
    /** Atacou furtivo: `total` já é o dano rolado vezes `STEALTH_DAMAGE_MULTIPLIER` */
    stealth?: boolean;
}

export interface WeaponRollOptions {
    /** O atacante está com o efeito Furtivo (ver `stealth.ts`) */
    stealth?: boolean;
}

/**
 * Rola o teste de acerto da arma. Numero de d20s vem de mods.attributes[hit] (>=1)
 * e o bonus do atributo/pericia equivalente. Furtivo: 1d20 a mais (vantagem, vale o maior).
 */
export function rollWeaponHit(weapon: Weapon, charsheet: CharsheetDTO, options: WeaponRollOptions = {}): HitTestResult {
    return rollHitTest(weapon.hit, charsheet, { extraDice: options.stealth ? STEALTH_EXTRA_D20 : 0 });
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

    if (result && !result.error) {
        return {
            notation: trimmed,
            display: result.display ?? `[${result.rolls.join(', ')}]`,
            total: result.total * factor,
            isCritical,
            ...(stealth ? { stealth } : {})
        };
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
        return {
            notation: trimmed,
            display: `${numeric}`,
            total: numeric * factor,
            isCritical,
            ...(stealth ? { stealth } : {})
        };
    }

    return null;
}

export function buildHitMessageText(playerName: string, weapon: Weapon, hit: HitTestResult): string {
    const rollPart = hit.rolls.length > 1
        ? `${hit.rolls.join(', ')}: ${hit.bestRoll}`
        : `${hit.bestRoll}`;
    const sign = hit.bonus >= 0 ? '+' : '';
    const advantage = hit.extraDice > 0 ? `, furtivo: vantagem, +${hit.extraDice}d20` : '';
    return `🎯 ${playerName} testou acerto com **${weapon.name}** (${hit.bonusLabel}${advantage}): [${rollPart}] ${sign}${hit.bonus} = **${hit.total}**`;
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
        segments: [ { notation: damage.notation, display: damage.display, total: damage.stealth ? damage.total / STEALTH_DAMAGE_MULTIPLIER : damage.total } ]
    });
}

export function buildDamageErrorText(weapon: Weapon, isCritical: boolean): string {
    const fld = isCritical ? 'crítico' : 'normal';
    return `❌ Não foi possível rolar o dano ${fld} de ${weapon.name}: fórmula inválida.`;
}

// Reexport para reuso em UIs que ja consomem rollDice
export type { DiceResult };
