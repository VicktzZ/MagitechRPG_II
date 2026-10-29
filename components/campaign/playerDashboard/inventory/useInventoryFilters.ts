import { useCampaignCurrentCharsheetContext } from '@contexts';
import { sheetOverweight } from '@utils/combat/sheetOverweight';
import { useMemo, useState } from 'react';
import { capacityState, carriedWeight, collectEntries, countByType, filterAndSortEntries, heaviestEntries, totalArmorPoints } from './inventoryList';
import type { InventorySort, InventoryTab } from './inventoryTypes';

/**
 * Tudo que a tela do inventário mostra: a aba, a busca e a ordem, a lista já filtrada, as contagens e o estado da capacidade
 * (peso carregado contra `capacity.max`).
 */
export function useInventoryView() {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const [ activeTab, setActiveTab ] = useState<InventoryTab>('all');
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ sort, setSort ] = useState<InventorySort>('type');

    const { weapons, armors, items } = charsheet.inventory;
    const entries = useMemo(() => collectEntries({ weapons, armors, items }), [ weapons, armors, items ]);
    const filtered = useMemo(() => filterAndSortEntries(entries, { tab: activeTab, query: searchQuery, sort }), [ entries, activeTab, searchQuery, sort ]);

    const totalWeight = useMemo(() => carriedWeight(entries), [ entries ]);
    const capacity = capacityState(totalWeight, charsheet.capacity.max);
    const counts = useMemo(() => countByType(entries), [ entries ]);
    const armorAp = useMemo(() => totalArmorPoints(entries), [ entries ]);
    const heaviest = useMemo(() => heaviestEntries(entries, 3), [ entries ]);
    // Sobrepeso: condição derivada daqui; tira das perícias de DES e VIG (só no Magitech padrão)
    const overweightPenalty = useMemo(() => sheetOverweight(charsheet).penalty, [ charsheet ]);

    const isFiltering = searchQuery.trim() !== '' || activeTab !== 'all';
    const clearFilters = (): void => { setSearchQuery(''); setActiveTab('all') };

    return {
        entries,
        filtered,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        sort,
        setSort,
        isFiltering,
        clearFilters,
        counts,
        totalItems: entries.length,
        totalWeight,
        maxCapacity: charsheet.capacity.max,
        capacity,
        armorAp,
        heaviest,
        overweightPenalty
    };
}
