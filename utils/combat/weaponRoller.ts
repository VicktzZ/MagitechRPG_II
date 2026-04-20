import type { Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import type { Attributes } from '@models/Attributes';
import type { Expertises } from '@models/Expertises';
import { rollDice, type DiceResult } from '@utils/diceRoller';

export type WeaponHitResult = {
    notation: string;
    rolls: number[];
    bestRoll: number;
    bonus: number;
    bonusLabel: string;
    total: number;
};

export type WeaponDamageResult = {
    notation: string;
    display: string;
    total: number;
    isCritical: boolean;
};

const HIT_TO_EXPERTISE: Partial<Record<keyof Attributes, keyof Expertises>> = {
    'vig': 'Luta',
    'des': 'Pontaria',
    'foc': 'Magia'
};

const ATTRIBUTE_LABELS: Record<keyof Attributes, string> = {
    vig: 'VIG',
    des: 'DES',
    foc: 'FOC',
    log: 'LOG',
    sab: 'SAB',
    car: 'CAR'
};

export interface ResolvedWeaponBonus {
    value: number;
    label: string;
}

/**
 * Resolve qual bonus aplicar ao teste de acerto.
 * Prefere a pericia equivalente (Luta/Pontaria/Magia) se existir;
 * caso contrario usa o atributo direto referenciado em weapon.hit.
 */
export function resolveWeaponHitBonus(weapon: Weapon, charsheet: CharsheetDTO): ResolvedWeaponBonus {
    const hitAttr = weapon.hit;
    const expertiseKey = hitAttr ? HIT_TO_EXPERTISE[hitAttr] : undefined;

    if (expertiseKey && charsheet.expertises?.[expertiseKey]) {
        const value = Number(charsheet.expertises[expertiseKey].value ?? 0);
        return { value, label: expertiseKey as string };
    }

    if (hitAttr && charsheet.attributes?.[hitAttr] !== undefined) {
        return {
            value: Number(charsheet.attributes[hitAttr] ?? 0),
            label: ATTRIBUTE_LABELS[hitAttr] ?? String(hitAttr).toUpperCase()
        };
    }

    return { value: 0, label: '—' };
}

/**
 * Rola o teste de acerto da arma. Numero de d20s vem de mods.attributes[hit] (>=1)
 * e o bonus do atributo/pericia equivalente.
 */
export function rollWeaponHit(weapon: Weapon, charsheet: CharsheetDTO): WeaponHitResult {
    const hitAttr = weapon.hit;
    let numDice = Number(charsheet.mods?.attributes?.[hitAttr] ?? 1);
    if (!Number.isFinite(numDice) || numDice < 1) numDice = 1;

    const rolls: number[] = [];
    for (let i = 0; i < numDice; i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }

    const bestRoll = rolls.length > 1 ? Math.max(...rolls) : rolls[0];
    const { value: bonus, label: bonusLabel } = resolveWeaponHitBonus(weapon, charsheet);
    const total = bestRoll + bonus;

    return {
        notation: `${numDice}d20${bonus >= 0 ? '+' : ''}${bonus}`,
        rolls,
        bestRoll,
        bonus,
        bonusLabel,
        total
    };
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

export function buildHitMessageText(playerName: string, weapon: Weapon, hit: WeaponHitResult): string {
    const rollPart = hit.rolls.length > 1
        ? `${hit.rolls.join(', ')}: ${hit.bestRoll}`
        : `${hit.bestRoll}`;
    const sign = hit.bonus >= 0 ? '+' : '';
    return `🎯 ${playerName} testou acerto com **${weapon.name}** (${hit.bonusLabel}): [${rollPart}] ${sign}${hit.bonus} = **${hit.total}**`;
}

export function buildDamageMessageText(playerName: string, weapon: Weapon, damage: WeaponDamageResult): string {
    const prefix = damage.isCritical ? '💥' : '⚔️';
    const action = damage.isCritical ? 'acertou um **crítico** com' : 'usou';
    const dmgType = weapon.effect?.effectType ? ` (${weapon.effect.effectType})` : '';
    return `${prefix} ${playerName} ${action} **${weapon.name}**${dmgType}: **${damage.total}** de dano [${damage.notation}: ${damage.display}]`;
}

export function buildDamageErrorText(weapon: Weapon, isCritical: boolean): string {
    const fld = isCritical ? 'crítico' : 'normal';
    return `❌ Não foi possível rolar o dano ${fld} de ${weapon.name}: fórmula inválida.`;
}

// Reexport para reuso em UIs que ja consomem rollDice
export type { DiceResult };
