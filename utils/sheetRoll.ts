import type { RPGSystem } from '@models/entities';
import { MAX_TEST_DICE, rollD20, type TestCharsheet } from './campaignTest';
import { adjustDice, type EffectDice } from './combat/effectDice';
import { sheetExpertisePenalty } from './combat/sheetOverweight';
import { computeAttributeInfluence, findSystemAttribute } from './systemLookups';

/**
 * Rolagem de perícia pela regra do **botão da perícia na ficha** (`subcomponents/Expertise.tsx`), usada quando o
 * mestre rola pelo jogador: o modificador do atributo padrão dá os d20 (`mod + 1`; modificador negativo rola 2 e
 * vale o menor) e soma-se o valor da perícia. Em sistema customizado, a influência do atributo (dados extras e
 * bônus fixo) vem da configuração dele. Esta NÃO é a regra do teste pedido pelo mestre nem a da criatura: a regra
 * única é decisão pendente do dono (ver CLAUDE.md).
 */

export interface SheetRollPlan {
    /** Quantos d20 rolar */
    dice: number;
    /** Qual d20 vale: o maior (normal ou vantagem) ou o menor (desvantagem) */
    keep: 'highest' | 'lowest';
    /** Valor da perícia (mais o bônus do atributo, nos sistemas customizados) */
    bonus: number;
    /** De onde vêm as vantagens e desvantagens dos efeitos aplicados ("Cegueira: desvantagem, −1d20"), para o chat dizer */
    notes?: string[];
}

export interface SheetRollResult {
    rolls: number[];
    used: number;
    total: number;
}

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? value as Record<string, unknown> : {};

const clampDice = (n: number): number => Math.min(Math.max(1, Math.floor(n)), MAX_TEST_DICE);

/** Soma as vantagens e desvantagens dos efeitos aplicados (`effectDice.ts`) ao plano: o saldo líquido decide quantos d20 e qual vale */
function withEffects(plan: SheetRollPlan, effects: EffectDice | undefined): SheetRollPlan {
    if (!effects || (effects.advantages <= 0 && effects.disadvantages <= 0)) return plan;
    return { ...plan, ...adjustDice({ dice: plan.dice, keep: plan.keep }, effects, MAX_TEST_DICE), notes: effects.notes };
}

/**
 * Como rolar uma perícia da ficha. Devolve `null` quando não dá para saber: a ficha não tem a perícia, ou é de
 * sistema customizado e o sistema ainda não chegou (rolar pela regra padrão daria o resultado errado). `effects` são as vantagens
 * e desvantagens dos efeitos aplicados ao personagem para esse teste (`effectDice`): entram no saldo de d20.
 */
export function planSheetRoll(
    charsheet: TestCharsheet | null | undefined,
    expertise: string,
    rpgSystem?: Pick<RPGSystem, 'attributes'> | null,
    effects?: EffectDice
): SheetRollPlan | null {
    if (!charsheet || !expertise) return null;

    const entry = asRecord(asRecord(charsheet.expertises)[expertise]);
    if (!('value' in entry) && !('defaultAttribute' in entry)) return null;

    const base = Number(entry['value']) || 0;
    const attrRef = typeof entry['defaultAttribute'] === 'string' ? entry['defaultAttribute'] : '';

    if (charsheet.systemId) {
        if (!rpgSystem) return null;

        const attrDef = findSystemAttribute(rpgSystem, attrRef);
        const attrValue = attrDef ? Number(asRecord(charsheet.attributes)[attrDef.key]) || 0 : 0;
        const influence = computeAttributeInfluence(attrDef, attrValue, charsheet.level || 1);
        return withEffects({ dice: clampDice(1 + influence.extraDice), keep: 'highest', bonus: base + influence.bonus }, effects);
    }

    const mods = asRecord(asRecord(charsheet.mods)['attributes']);
    const mod = Number(mods[attrRef] ?? mods[attrRef.toLowerCase()]);
    const attributeMod = Number.isFinite(mod) ? mod : 0;
    // Sobrepeso: −1 por kg excedido nas perícias de DES e VIG (só no Magitech padrão; o sistema customizado voltou acima)
    const bonus = base + sheetExpertisePenalty(charsheet, attrRef);

    if (attributeMod < 0) return withEffects({ dice: 2, keep: 'lowest', bonus }, effects);
    return withEffects({ dice: clampDice(attributeMod + 1), keep: 'highest', bonus }, effects);
}

/** Rola os d20 do plano e aplica a regra de qual vale */
export function rollSheetPlan(plan: SheetRollPlan, random: () => number = Math.random): SheetRollResult {
    const rolls = Array.from({ length: plan.dice }, () => rollD20(random));
    const used = plan.keep === 'lowest' ? Math.min(...rolls) : Math.max(...rolls);
    return { rolls, used, total: used + plan.bonus };
}

interface RollTextInput {
    /** Em nome de quem se rola (o personagem) */
    who: string;
    /** Nome da perícia */
    label: string;
    plan: SheetRollPlan;
    result: SheetRollResult;
}

/**
 * Texto da rolagem no formato que o chat já reconhece (`DiceMessage`), igual ao da criatura:
 * `🎲 [Aria Valen] ATLETISMO - 2d20+3: [12, 7: 12] = 15`. Com desvantagem, o nome diz isso, para que o menor
 * d20 valendo não pareça erro.
 */
export function formatSheetRollText({ who, label, plan, result }: RollTextInput): string {
    // Desvantagem (o menor d20 vale) e a origem das vantagens e desvantagens dos efeitos, para o d20 que vale não parecer erro
    const remarks = [ ...(plan.keep === 'lowest' ? [ 'desvantagem' ] : []), ...(plan.notes ?? []) ];
    const name = `${who ? `[${who}] ` : ''}${label.toUpperCase()}${remarks.length > 0 ? ` (${remarks.join('; ')})` : ''}`;
    const notation = `${plan.dice}d20${plan.bonus >= 0 ? '+' : ''}${plan.bonus}`;
    const rollPart = result.rolls.length > 1 ? `${result.rolls.join(', ')}: ${result.used}` : `${result.used}`;

    return `🎲 ${name} - ${notation}: [${rollPart}] = ${result.total}`;
}

/** Descrição curta do plano, para a dica do botão: "2d20 (desvantagem: vale o menor) +3" */
export function describeSheetPlan(plan: SheetRollPlan): string {
    const dice = `${plan.dice}d20${plan.keep === 'lowest' ? ' (desvantagem: vale o menor)' : plan.dice > 1 ? ' (vale o maior)' : ''}`;
    return `${dice} ${plan.bonus >= 0 ? '+' : ''}${plan.bonus}`;
}
