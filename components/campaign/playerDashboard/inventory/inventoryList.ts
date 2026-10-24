import type { Armor, Item, Weapon } from '@models';
import type { RarityType } from '@models/types/string';
import { matchesSearch } from '@utils/searchText';
import { normalizeToArray } from '@utils/normalizeToArray';
import type { InventoryEntry, InventoryItemType, InventorySort, InventoryTab } from './inventoryTypes';

/** Quanto o item pesa na mochila: arma e armadura pelo peso, item pelo peso vezes a quantidade; item de Capacidade soma à capacidade máxima e não pesa */
export function entryWeight({ item, type }: Pick<InventoryEntry, 'item' | 'type'>): number {
    if (type === 'item') {
        const stack = item as Item;
        if (stack.kind === 'Capacidade') return 0;
        return (Number(stack.weight) || 0) * (Number(stack.quantity) || 1);
    }
    return Number(item.weight) || 0;
}

/** Pontos de armadura que a armadura dá (`ap`, ou `value` nas fichas antigas) */
export function armorPoints(item: object): number {
    const armor = item as { ap?: number; value?: number };
    return Number(armor.ap || armor.value || 0) || 0;
}

/**
 * Todos os itens da ficha numa lista só, com o tipo e uma chave estável. O mesmo item gravado duas vezes (mesmo id) aparece uma vez;
 * itens diferentes com o mesmo nome (duas pistolas) aparecem os dois, porque são dois itens.
 */
export function collectEntries(inventory: { weapons?: unknown; armors?: unknown; items?: unknown } | null | undefined): InventoryEntry[] {
    const groups: Array<[ InventoryItemType, Array<Weapon | Armor | Item> ]> = [
        [ 'weapon', normalizeToArray<Weapon>(inventory?.weapons) ],
        [ 'armor', normalizeToArray<Armor>(inventory?.armors) ],
        [ 'item', normalizeToArray<Item>(inventory?.items) ]
    ];

    const entries: InventoryEntry[] = [];
    const seen = new Set<string>();

    for (const [ type, items ] of groups) {
        items.forEach((item, index) => {
            if (!item) return;
            const id = typeof item.id === 'string' && item.id ? item.id : '';
            if (id) {
                const unique = `${type}::${id}`;
                if (seen.has(unique)) return;
                seen.add(unique);
            }
            entries.push({ item, type, key: `${type}:${id || item.name || 'sem-nome'}:${index}` });
        });
    }
    return entries;
}

export const carriedWeight = (entries: readonly InventoryEntry[]): number => entries.reduce((sum, entry) => sum + entryWeight(entry), 0);

/** Soma dos pontos de armadura das armaduras da ficha */
export const totalArmorPoints = (entries: readonly InventoryEntry[]): number =>
    entries.reduce((sum, entry) => sum + (entry.type === 'armor' ? armorPoints(entry.item) : 0), 0);

export const countByType = (entries: readonly InventoryEntry[]): Record<InventoryItemType, number> => ({
    weapon: entries.filter(entry => entry.type === 'weapon').length,
    armor: entries.filter(entry => entry.type === 'armor').length,
    item: entries.filter(entry => entry.type === 'item').length
});

export const INVENTORY_SORT_OPTIONS: ReadonlyArray<{ value: InventorySort; label: string }> = [
    { value: 'type', label: 'Por tipo' },
    { value: 'name', label: 'Nome A → Z' },
    { value: 'weight-desc', label: 'Mais pesados' },
    { value: 'rarity-desc', label: 'Mais raros' }
];

export const isInventorySort = (value: unknown): value is InventorySort => INVENTORY_SORT_OPTIONS.some(option => option.value === value);

/** Da mais comum à mais rara; raridades que o sistema não conhece ficam no meio */
const RARITY_ORDER: RarityType[] = [ 'Comum', 'Incomum', 'Raro', 'Mágico', 'Épico', 'Lendário', 'Especial', 'Único', 'Amaldiçoado' ];

export function rarityRank(rarity: unknown): number {
    const index = RARITY_ORDER.indexOf(rarity as RarityType);
    return index === -1 ? 2 : index;
}

const TYPE_ORDER: Record<InventoryItemType, number> = { weapon: 0, armor: 1, item: 2 };
const byName = (a: InventoryEntry, b: InventoryEntry): number => (a.item.name ?? '').localeCompare(b.item.name ?? '', 'pt-BR', { sensitivity: 'base' });

interface InventoryListOptions {
    tab?: InventoryTab;
    query?: string;
    sort?: InventorySort;
}

const TAB_TYPE: Record<Exclude<InventoryTab, 'all'>, InventoryItemType> = { weapons: 'weapon', armors: 'armor', items: 'item' };

/** Itens da aba ativa que casam com a busca (nome, tipo do item e raridade), na ordem pedida; empate sempre pelo nome */
export function filterAndSortEntries(entries: readonly InventoryEntry[], { tab = 'all', query = '', sort = 'type' }: InventoryListOptions = {}): InventoryEntry[] {
    const list = entries.filter(entry => {
        if (tab !== 'all' && entry.type !== TAB_TYPE[tab]) return false;
        const { item } = entry;
        return matchesSearch(`${item.name ?? ''} ${item.kind ?? ''} ${item.rarity ?? ''}`, query);
    });

    return list.sort((a, b) => {
        switch (sort) {
        case 'name':
            return byName(a, b);
        case 'weight-desc':
            return entryWeight(b) - entryWeight(a) || byName(a, b);
        case 'rarity-desc':
            return rarityRank(b.item.rarity) - rarityRank(a.item.rarity) || byName(a, b);
        default:
            return TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || byName(a, b);
        }
    });
}

/** Os itens que mais pesam (para sugerir o que largar quando a mochila está cheia) */
export function heaviestEntries(entries: readonly InventoryEntry[], count = 3): InventoryEntry[] {
    return [ ...entries ].filter(entry => entryWeight(entry) > 0).sort((a, b) => entryWeight(b) - entryWeight(a) || byName(a, b)).slice(0, count);
}

export type CapacityState = 'ok' | 'near' | 'over';

/** Estado da capacidade: acima de 100% é sobrecarga e acima de 80% está perto do limite; capacidade 0 (ficha sem limite) nunca avisa */
export function capacityState(weight: number, max: number): { percent: number; state: CapacityState } {
    const limit = Number(max) || 0;
    const percent = limit > 0 ? (weight / limit) * 100 : 0;
    return { percent, state: percent > 100 ? 'over' : percent > 80 ? 'near' : 'ok' };
}

/**
 * A lista sem o item removido. Com id, sai o item de mesmo id (a lista pode tê-lo gravado duas vezes); sem id (ficha antiga) sai só aquele
 * item, pela referência ou, na falta dela, o primeiro de mesmo nome, em vez de apagar todos os que também não têm id.
 */
export function withoutItem<T extends { id?: string; name?: string }>(list: readonly T[], target: T): T[] {
    if (target.id) return list.filter(item => item.id !== target.id);
    const index = list.includes(target) ? list.indexOf(target) : list.findIndex(item => !item.id && item.name === target.name);
    return list.filter((_, position) => position !== index);
}
