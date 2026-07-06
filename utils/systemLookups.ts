import type { RPGSystem, SystemAttribute } from '@models/entities';
import { evaluateFormula } from './formulaEvaluator';

/**
 * Resolve uma referência de atributo (key OU name) para o atributo do sistema.
 */
export function findSystemAttribute(
    system: Pick<RPGSystem, 'attributes'> | null | undefined,
    ref: string | null | undefined
): SystemAttribute | undefined {
    if (!ref || !system?.attributes) return undefined;
    return system.attributes.find(a => a.key === ref || a.name === ref || a.abbreviation === ref);
}

/**
 * Rótulo legível de um atributo referenciado por key/name.
 * Fallback: a própria referência (compatível com Magitech, onde ref já é legível).
 */
export function resolveAttributeLabel(
    system: Pick<RPGSystem, 'attributes'> | null | undefined,
    ref: string | null | undefined,
    format: 'name' | 'abbreviation' = 'name'
): string {
    const attr = findSystemAttribute(system, ref);
    if (!attr) return ref ?? '';
    return format === 'abbreviation' ? attr.abbreviation : attr.name;
}

/**
 * Rótulo legível de uma perícia referenciada por key/name.
 */
export function resolveExpertiseLabel(
    system: Pick<RPGSystem, 'expertises'> | null | undefined,
    ref: string | null | undefined
): string {
    if (!ref || !system?.expertises) return ref ?? '';
    const exp = system.expertises.find(e => e.key === ref || e.name === ref);
    return exp?.name ?? ref;
}

/**
 * Rótulo legível do alvo de um traço (atributo, perícia ou customizado).
 */
export function resolveTraitTargetLabel(
    system: Pick<RPGSystem, 'attributes' | 'expertises'> | null | undefined,
    target: { kind: string; name: string } | null | undefined
): string {
    if (!target?.name) return '';
    if (target.kind === 'attribute') return resolveAttributeLabel(system, target.name);
    if (target.kind === 'expertise') return resolveExpertiseLabel(system, target.name);
    return target.name;
}

/**
 * Calcula a influência de um atributo num teste de perícia vinculada:
 * dados extras (modo 'advantage') ou bônus fixo (modo 'sum').
 * Prioridade: mapa manual (por valor do atributo) → fórmula → "attr" (1:1).
 */
export function computeAttributeInfluence(
    attrDef: SystemAttribute | undefined,
    attrValue: number,
    level = 1
): { extraDice: number; bonus: number } {
    const influence = attrDef?.testInfluence;
    if (!influence) return { extraDice: 0, bonus: 0 };

    let extraDice = 0;
    let bonus = 0;

    if (influence.mode !== 'none') {
        const manual = influence.manualMap?.[String(attrValue)];
        const amount = typeof manual === 'number'
            ? manual
            : evaluateFormula(
                influence.formula?.trim() || 'attr',
                { attr: attrValue, level: Math.max(1, level) },
                0
            );

        const safeAmount = Math.max(0, Math.floor(amount));
        if (influence.mode === 'advantage') extraDice += safeAmount;
        else bonus += safeAmount;
    }

    // Vantagem extra empilhável, independente do modo principal (ex: "sum" + vantagem a cada 5 pontos).
    if (influence.advantageEveryNPoints && influence.advantageEveryNPoints > 0) {
        extraDice += Math.max(0, Math.floor(attrValue / influence.advantageEveryNPoints));
    }

    return { extraDice, bonus };
}
