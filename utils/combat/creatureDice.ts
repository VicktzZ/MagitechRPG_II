import { buildActionRollText, type ActionRollSegment } from './actionRollMessage';
import { completeCreatureExpertises } from './creatureExpertises';

/**
 * Dados customizáveis das criaturas: o mestre cadastra, na criatura, rolagens que ela usa ("Mordida: 2d6 + 3", "Rajada: 1d10 + FOC") e rola em um clique, na ficha da criatura ou
 * na janela dela em combate; o resultado vai ao chat como cartão de dados. É o mesmo formato do dado personalizado do jogador (`models/Dice.ts`: dados, bônus fixo, atributo e
 * perícia somados), sem os efeitos sobre os pontos vitais. O atributo soma o **valor** dele na criatura (como no dado do jogador, que soma o valor da ficha) e a perícia soma o valor
 * dela. Este módulo é puro: limpa o que vem do cliente, rola e monta a mensagem.
 */

/** Quantos dados cada criatura pode ter */
export const MAX_CREATURE_DICES = 20;
export const MAX_DICE_CONFIGS = 6;
export const MAX_DICE_MODIFIERS = 6;
export const MAX_DICE_QUANTITY = 99;
export const MAX_DICE_FACES = 1000;
export const MAX_DICE_BONUS = 999;
export const MAX_DICE_NAME = 60;
export const MAX_DICE_DESCRIPTION = 300;

export interface CreatureDiceConfig {
    faces: number;
    quantity: number;
}

/** Um termo somado ao total: um bônus fixo, o valor de um atributo da criatura ou o valor de uma perícia dela (só um dos três por termo) */
export interface CreatureDiceModifier {
    bonus?: number;
    attribute?: string;
    expertise?: string;
}

export interface CreatureDice {
    id: string;
    name: string;
    description: string;
    dices: CreatureDiceConfig[];
    modifiers: CreatureDiceModifier[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const asText = (value: unknown, max: number): string => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Inteiro entre `min` e `max`, ou `null` se não é um número inteiro nessa faixa (texto numérico vale) */
function asInt(value: unknown, min: number, max: number): number | null {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

function sanitizeConfigs(raw: unknown): CreatureDiceConfig[] {
    if (!Array.isArray(raw)) return [];
    const configs: CreatureDiceConfig[] = [];
    for (const entry of raw) {
        if (!isRecord(entry)) continue;
        const faces = asInt(entry['faces'], 2, MAX_DICE_FACES);
        const quantity = asInt(entry['quantity'], 1, MAX_DICE_QUANTITY);
        if (faces !== null && quantity !== null) configs.push({ faces, quantity });
        if (configs.length >= MAX_DICE_CONFIGS) break;
    }
    return configs;
}

function sanitizeModifiers(raw: unknown): CreatureDiceModifier[] {
    if (!Array.isArray(raw)) return [];
    const modifiers: CreatureDiceModifier[] = [];
    for (const entry of raw) {
        if (!isRecord(entry)) continue;
        // Um termo é um só dos três; se vierem vários, vale o primeiro na ordem atributo, perícia, bônus
        const attribute = asText(entry['attribute'], 30);
        const expertise = asText(entry['expertise'], 60);
        const bonus = asInt(entry['bonus'], -MAX_DICE_BONUS, MAX_DICE_BONUS);
        if (attribute) modifiers.push({ attribute });
        else if (expertise) modifiers.push({ expertise });
        else if (bonus !== null && bonus !== 0) modifiers.push({ bonus });
        if (modifiers.length >= MAX_DICE_MODIFIERS) break;
    }
    return modifiers;
}

/**
 * Limpa a lista de dados que vem do cliente: descarta o que não tem nome nem dado válido, corta os tamanhos, mantém só inteiros nas faixas (2 a 1000 faces, 1 a 99 dados,
 * bônus de -999 a 999) e dá um id único a cada um. Até 20 dados.
 */
export function sanitizeCreatureDices(raw: unknown): CreatureDice[] {
    if (!Array.isArray(raw)) return [];

    const seen = new Set<string>();
    const dices: CreatureDice[] = [];
    for (const [ index, entry ] of raw.entries()) {
        if (!isRecord(entry)) continue;
        const name = asText(entry['name'], MAX_DICE_NAME);
        const configs = sanitizeConfigs(entry['dices']);
        if (!name || configs.length === 0) continue;

        let id = asText(entry['id'], 64) || `dice-${index}`;
        if (seen.has(id)) id = `${id}-${index}`;
        seen.add(id);

        dices.push({ id, name, description: asText(entry['description'], MAX_DICE_DESCRIPTION), dices: configs, modifiers: sanitizeModifiers(entry['modifiers']) });
        if (dices.length >= MAX_CREATURE_DICES) break;
    }
    return dices;
}

/** "2d6 + 1d8 + 3 + FOC": a expressão do dado em texto, para a lista e a pré-visualização */
export function describeCreatureDice(dice: Pick<CreatureDice, 'dices' | 'modifiers'>): string {
    const parts = dice.dices.map(config => `${config.quantity}d${config.faces}`);
    for (const modifier of dice.modifiers) {
        if (modifier.attribute) parts.push(modifier.attribute.toUpperCase());
        else if (modifier.expertise) parts.push(modifier.expertise);
        else if (modifier.bonus !== undefined) parts.push(modifier.bonus < 0 ? `- ${Math.abs(modifier.bonus)}` : String(modifier.bonus));
    }
    // Um bônus negativo já traz o sinal: "2d6 + - 3" vira "2d6 - 3"
    return parts.join(' + ').replace(/\+ -/g, '-');
}

export interface CreatureDiceRoll {
    dice: CreatureDice;
    total: number;
    /** Um trecho por grupo de dados rolado (a notação, os valores e a soma) e por termo somado, na ordem do dado */
    segments: ActionRollSegment[];
}

interface DiceSource {
    attributes?: object;
    expertises?: object;
}

const asNumber = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

/**
 * Rola o dado da criatura. Atributo ou perícia que a criatura não tem somam 0. `random` é injetável para o teste.
 */
export function rollCreatureDice(dice: CreatureDice, creature: DiceSource | null | undefined, random: () => number = Math.random): CreatureDiceRoll {
    const segments: ActionRollSegment[] = [];
    let total = 0;

    for (const config of dice.dices) {
        const rolls = Array.from({ length: config.quantity }, () => Math.floor(random() * config.faces) + 1);
        const sum = rolls.reduce((acc, value) => acc + value, 0);
        total += sum;
        segments.push({ notation: `${config.quantity}d${config.faces}`, display: `[${rolls.join(', ')}]`, total: sum });
    }

    const expertises = completeCreatureExpertises<{ value?: unknown }>(creature?.expertises);
    for (const modifier of dice.modifiers) {
        let label: string;
        let value: number;
        if (modifier.attribute) {
            label = modifier.attribute.toUpperCase();
            value = asNumber((creature?.attributes as Record<string, unknown> | undefined)?.[modifier.attribute]);
        } else if (modifier.expertise) {
            label = modifier.expertise;
            value = asNumber(expertises[modifier.expertise]?.value);
        } else {
            label = 'Bônus';
            value = asNumber(modifier.bonus);
        }
        total += value;
        segments.push({ notation: label, display: String(value), total: value });
    }

    return { dice, total, segments };
}

/** O texto do cartão de dados do chat (`[AÇÃO] efeito`): o nome do dado, de quem é, o total à vista e cada trecho rolado num dropdown */
export function buildCreatureDiceText(creatureName: string, roll: CreatureDiceRoll): string {
    return buildActionRollText({
        kind: 'efeito',
        player: creatureName,
        title: roll.dice.name,
        detail: roll.dice.description ? `Dado da criatura · ${roll.dice.description}` : 'Dado da criatura',
        critical: false,
        total: roll.total,
        cost: null,
        dt: null,
        segments: roll.segments
    });
}
