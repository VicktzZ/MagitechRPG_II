import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { Armor, Item, Weapon } from '@models';
import { useMemo, useState } from 'react';
import type { InventoryEntry, InventoryTab } from './inventoryTypes';
import { normalizeToArray } from '@utils/normalizeToArray';

/** Aba ativa e busca do inventário, com a lista de itens já filtrada e sem repetições */
export function useInventoryFilters() {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const [ activeTab, setActiveTab ] = useState<InventoryTab>('all');
    const [ searchQuery, setSearchQuery ] = useState('');

    // Filtra itens baseado na busca e tab ativa
    const filteredItems = useMemo(() => {
        let items: InventoryEntry[] = [];

        if (activeTab === 'all' || activeTab === 'weapons') {
            items = items.concat(normalizeToArray<Weapon>(charsheet.inventory.weapons).map(w => ({ item: w, type: 'weapon' as const })));
        }
        if (activeTab === 'all' || activeTab === 'armors') {
            items = items.concat(normalizeToArray<Armor>(charsheet.inventory.armors).map(a => ({ item: a, type: 'armor' as const })));
        }
        if (activeTab === 'all' || activeTab === 'items') {
            items = items.concat(normalizeToArray<Item>(charsheet.inventory.items).map(i => ({ item: i, type: 'item' as const })));
        }

        // Filtro por busca
        if (searchQuery) {
            const term = searchQuery.toLowerCase();
            items = items.filter(({ item }) => (item?.name ?? '').toLowerCase().includes(term));
        }

        // Deduplica por chave composta (type + name) para evitar repetições visuais
        const seen = new Set<string>();
        const unique = items.filter(({ item, type }) => {
            const key = `${type}::${item?.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return unique;
    }, [
        activeTab,
        searchQuery,
        charsheet.inventory.weapons,
        charsheet.inventory.armors,
        charsheet.inventory.items
    ]);

    return { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredItems };
}
