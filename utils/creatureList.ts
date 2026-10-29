import type { Creature } from '@models';
import { matchesSearch } from './searchText';

/**
 * A lista de criaturas customizadas do mestre (seção do dashboard): busca, filtro por tipo e ordem. Funções puras sobre a criatura como a campanha guarda (campos que faltam
 * ou vêm em formato antigo não quebram nada), no estilo de `expertiseList.ts` e `inventoryList.ts`.
 */

export type CreatureSort = 'name' | 'recent' | 'level-desc' | 'level-asc' | 'lp-desc' | 'type';

export const DEFAULT_CREATURE_SORT: CreatureSort = 'name';

export const CREATURE_SORT_OPTIONS: ReadonlyArray<{ value: CreatureSort; label: string }> = [
    { value: 'name', label: 'Nome (A → Z)' },
    { value: 'recent', label: 'Mais recentes' },
    { value: 'level-desc', label: 'Maior nível' },
    { value: 'level-asc', label: 'Menor nível' },
    { value: 'lp-desc', label: 'Mais vida' },
    { value: 'type', label: 'Tipo' }
];

export const isCreatureSort = (value: unknown): value is CreatureSort => CREATURE_SORT_OPTIONS.some(option => option.value === value);

/** Valor do filtro "criaturas sem tipo" (o tipo é texto livre e pode estar vazio) */
export const NO_TYPE = '__sem-tipo__';

export const NO_TYPE_LABEL = 'Sem tipo';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const asNumber = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const namesOf = (value: unknown): string[] => (Array.isArray(value) ? value.filter(isRecord).map(entry => asText(entry['name'])).filter(Boolean) : []);

/** O tipo da criatura (ou `NO_TYPE` se ela não tem) */
export const creatureTypeKey = (creature: Creature): string => asText((creature as unknown as Record<string, unknown>)['type']) || NO_TYPE;

/** O nível, vida máxima e nome da criatura como número e texto seguros */
export const creatureLevel = (creature: Creature): number => asNumber((creature as unknown as Record<string, unknown>)['level']);

export function creatureMaxLp(creature: Creature): number {
    const stats = (creature as unknown as Record<string, unknown>)['stats'];
    if (!isRecord(stats)) return 0;
    return asNumber(stats['maxLp']) || asNumber(stats['lp']);
}

/** Tudo em que a busca olha: nome, tipo, descrição e os nomes das habilidades, magias e dados da criatura */
export function creatureSearchText(creature: Creature): string {
    const raw = creature as unknown as Record<string, unknown>;
    return [ asText(raw['name']), asText(raw['type']), asText(raw['description']), ...namesOf(raw['skills']), ...namesOf(raw['spells']), ...namesOf(raw['dices']) ].join(' ');
}

const compareNames = (a: Creature, b: Creature): number =>
    asText((a as unknown as Record<string, unknown>)['name']).localeCompare(asText((b as unknown as Record<string, unknown>)['name']), 'pt-BR', { sensitivity: 'base' });

interface CreatureListOptions {
    /** Busca (sem acento nem caixa); vazia mostra todas */
    query?: string;
    /** Só deste tipo (`NO_TYPE` para as sem tipo); `null` ou ausente mostra todos */
    type?: string | null;
    sort?: CreatureSort;
}

/** As criaturas que passam na busca e no filtro de tipo, na ordem pedida (empate pelo nome). A lista recebida não é alterada */
export function filterAndSortCreatures(creatures: readonly Creature[], { query = '', type = null, sort = DEFAULT_CREATURE_SORT }: CreatureListOptions = {}): Creature[] {
    const indexed = creatures.map((creature, index) => ({ creature, index }));
    const kept = indexed.filter(({ creature }) => (type === null || creatureTypeKey(creature) === type) && matchesSearch(creatureSearchText(creature), query));

    kept.sort((a, b) => {
        switch (sort) {
        case 'recent':
            return b.index - a.index;
        case 'level-desc':
            return creatureLevel(b.creature) - creatureLevel(a.creature) || compareNames(a.creature, b.creature);
        case 'level-asc':
            return creatureLevel(a.creature) - creatureLevel(b.creature) || compareNames(a.creature, b.creature);
        case 'lp-desc':
            return creatureMaxLp(b.creature) - creatureMaxLp(a.creature) || compareNames(a.creature, b.creature);
        case 'type': {
            const typeA = creatureTypeKey(a.creature);
            const typeB = creatureTypeKey(b.creature);
            // As sem tipo vão para o fim
            if (typeA === NO_TYPE && typeB !== NO_TYPE) return 1;
            if (typeB === NO_TYPE && typeA !== NO_TYPE) return -1;
            return typeA.localeCompare(typeB, 'pt-BR', { sensitivity: 'base' }) || compareNames(a.creature, b.creature);
        }
        default:
            return compareNames(a.creature, b.creature);
        }
    });

    return kept.map(({ creature }) => creature);
}

export interface CreatureTypeCount {
    /** O texto do tipo, ou `NO_TYPE` */
    type: string;
    label: string;
    count: number;
}

/** Os tipos que existem entre as criaturas, com quantas há de cada, do mais comum ao menos (empate pelo nome); as sem tipo vão por último */
export function creatureTypeCounts(creatures: readonly Creature[]): CreatureTypeCount[] {
    const counts = new Map<string, number>();
    for (const creature of creatures) {
        const key = creatureTypeKey(creature);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts, ([ type, count ]) => ({ type, label: type === NO_TYPE ? NO_TYPE_LABEL : type, count })).sort((a, b) => {
        if (a.type === NO_TYPE) return 1;
        if (b.type === NO_TYPE) return -1;
        return b.count - a.count || a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' });
    });
}

export interface CreatureListSummary {
    total: number;
    /** Nível médio, com uma casa decimal; 0 sem criaturas */
    averageLevel: number;
    highestLevel: number;
}

export function summarizeCreatures(creatures: readonly Creature[]): CreatureListSummary {
    if (creatures.length === 0) return { total: 0, averageLevel: 0, highestLevel: 0 };
    const levels = creatures.map(creatureLevel);
    return {
        total: creatures.length,
        averageLevel: Math.round((levels.reduce((sum, level) => sum + level, 0) / levels.length) * 10) / 10,
        highestLevel: Math.max(...levels)
    };
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Quantas cópias dessa criatura estão no combate agora (o combatente leva o id da criatura, com sufixo `-n` nas cópias) */
export function creatureCopiesInCombat(creatureId: string, combatants: ReadonlyArray<{ id?: string; type?: string }> | undefined): number {
    const copy = new RegExp(`^${escapeRegExp(creatureId)}-\\d+$`);
    return (combatants ?? []).filter(combatant => combatant.type === 'creature' && typeof combatant.id === 'string' && (combatant.id === creatureId || copy.test(combatant.id))).length;
}

/**
 * O corpo para criar uma cópia da criatura (a rota `POST` dá o id novo): mesmos atributos, perícias, habilidades, magias, dados e defesas, com o nome "Goblin (cópia)" ou
 * "Goblin (cópia 2)" se já existir. Os ids de habilidades, magias e dados vão iguais (são locais à criatura).
 */
export function duplicateCreatureBody(creature: Creature, existingNames: readonly string[]): Record<string, unknown> {
    const rest = Object.fromEntries(Object.entries(creature as unknown as Record<string, unknown>).filter(([ key ]) => key !== 'id'));
    const base = asText(rest['name']) || 'Criatura';
    const taken = new Set(existingNames.map(name => name.trim().toLowerCase()));

    let name = `${base} (cópia)`;
    for (let copy = 2; taken.has(name.toLowerCase()); copy++) name = `${base} (cópia ${copy})`;

    return { ...JSON.parse(JSON.stringify(rest)) as Record<string, unknown>, name };
}
