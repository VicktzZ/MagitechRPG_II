import type { Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { rollDice, type DiceResult } from '@utils/diceRoller';
import { buildActionRollText } from './actionRollMessage';
import { rollHitTest, type HitTestResult } from './hitTest';

export interface WeaponDamageResult {
    notation: string;
    display: string;
    total: number;
    isCritical: boolean;
}

/**
 * Rola o teste de acerto da arma. Numero de d20s vem de mods.attributes[hit] (>=1)
 * e o bonus do atributo/pericia equivalente.
 */
export function rollWeaponHit(weapon: Weapon, charsheet: CharsheetDTO): HitTestResult {
    return rollHitTest(weapon.hit, charsheet);
}

/**
 * Rola dano (normal ou critico) usando o roller padrao de dados.
 * Aceita expressoes como "2d6", "3d8+2", etc. Se a expressao for invalida
 * tenta interpretar valores numericos puros como dano fixo.
 */
export function rollWeaponDamage(weapon: Weapon, isCritical: boolean): WeaponDamageResult | null {
    const formula = (isCritical ? weapon.effect?.critValue : weapon.effect?.value) ?? '';
    const trimmed = String(formula).trim();
    if (!trimmed) return null;

    const result = rollDice(trimmed);

    if (result && !result.error) {
        return {
            notation: trimmed,
            display: result.display ?? `[${result.rolls.join(', ')}]`,
            total: result.total,
            isCritical
        };
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
        return {
            notation: trimmed,
            display: `${numeric}`,
            total: numeric,
            isCritical
        };
    }

    return null;
}

export function buildHitMessageText(playerName: string, weapon: Weapon, hit: HitTestResult): string {
    const rollPart = hit.rolls.length > 1
        ? `${hit.rolls.join(', ')}: ${hit.bestRoll}`
        : `${hit.bestRoll}`;
    const sign = hit.bonus >= 0 ? '+' : '';
    return `🎯 ${playerName} testou acerto com **${weapon.name}** (${hit.bonusLabel}): [${rollPart}] ${sign}${hit.bonus} = **${hit.total}**`;
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
        total: damage.total,
        cost: null,
        dt: null,
        segments: [ { notation: damage.notation, display: damage.display, total: damage.total } ]
    });
}

export function buildDamageErrorText(weapon: Weapon, isCritical: boolean): string {
    const fld = isCritical ? 'crítico' : 'normal';
    return `❌ Não foi possível rolar o dano ${fld} de ${weapon.name}: fórmula inválida.`;
}

// Reexport para reuso em UIs que ja consomem rollDice
export type { DiceResult };
