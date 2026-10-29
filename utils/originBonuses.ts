import { lineageExpertises, occupationsExpertises } from '@constants/lineageExpertises';
import { negativeTraits, positiveTraits } from '@constants/traits';
import type { RPGSystem } from '@models/entities';

type BonusMap = Record<string, number>;

export interface OriginBonusSheet {
    mode?: string;
    class?: string;
    lineage?: string;
    occupation?: string;
    traits?: unknown[];
}

export interface OriginBonuses {
    attributes: BonusMap;
    expertises: BonusMap;
}

interface BonusTrait {
    name: string;
    value: number;
    target?: { kind: string; name: string };
}

function addBonuses(target: BonusMap, bonuses?: Record<string, number> | null): void {
    if (!bonuses) return;
    Object.entries(bonuses).forEach(([ key, value ]) => {
        if (typeof value === 'number' && value !== 0) {
            target[key] = (target[key] ?? 0) + value;
        }
    });
}

function addTraitBonuses(result: OriginBonuses, traits: unknown[] | undefined, pool: BonusTrait[]): void {
    (traits ?? []).forEach(selected => {
        const name = typeof selected === 'string' ? selected : (selected as { name?: string } | null)?.name;
        const trait = name ? pool.find(t => t.name === name) : undefined;
        if (!trait?.target?.name || !trait.value) return;

        // Mesma regra de LevelAndInfo: 'attribute' altera atributo, o resto altera perícia
        const target = trait.target.kind === 'attribute' ? result.attributes : result.expertises;
        target[trait.target.name] = (target[trait.target.name] ?? 0) + trait.value;
    });
}

/**
 * Bônus fixos que a ficha recebe da origem (classe, linhagem/profissão e traços).
 * Esses valores são concedidos, não comprados com pontos — portanto nunca podem
 * ser "devolvidos" como pontos de atributo/perícia ao reduzir o valor.
 *
 * `system` deve ser o sistema customizado da ficha, ou null para o Magitech padrão.
 */
export function computeOriginBonuses(sheet: OriginBonusSheet, system: RPGSystem | null): OriginBonuses {
    const result: OriginBonuses = { attributes: {}, expertises: {} };

    if (system) {
        const cls = system.classes?.find(c => c.name === sheet.class || c.key === sheet.class);
        addBonuses(result.attributes, cls?.attributeBonus);
        addBonuses(result.expertises, cls?.expertiseBonus);

        const lineage = system.lineages?.find(l => l.name === sheet.lineage || l.key === sheet.lineage);
        addBonuses(result.attributes, lineage?.attributeBonus);
        addBonuses(result.expertises, lineage?.expertiseBonus);

        const occupation = system.occupations?.find(o => o.name === sheet.occupation || o.key === sheet.occupation);
        addBonuses(result.expertises, occupation?.expertiseBonus);

        addTraitBonuses(result, sheet.traits, [
            ...(system.traits?.positive ?? []),
            ...(system.traits?.negative ?? [])
        ]);
        return result;
    }

    const lineageTable: Record<string, { tests?: Record<string, number> } | undefined> =
        sheet.mode === 'Classic' ? lineageExpertises : occupationsExpertises;
    addBonuses(result.expertises, sheet.lineage ? lineageTable[sheet.lineage]?.tests : undefined);
    addTraitBonuses(result, sheet.traits, [ ...positiveTraits, ...negativeTraits ] as BonusTrait[]);

    return result;
}
