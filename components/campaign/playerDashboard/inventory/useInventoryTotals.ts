import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { Armor, Item, Weapon } from '@models';
import { useMemo } from 'react';
import { normalizeToArray } from '@utils/normalizeToArray';

/** Peso total, quantidade de itens e estado da capacidade (sobrecarga, perto do limite) do inventário */
export function useInventoryTotals() {
    const { charsheet } = useCampaignCurrentCharsheetContext();

    // Calcula o peso total do inventário dinamicamente
    const calculateTotalWeight = useMemo(() => {
        const weapons = normalizeToArray<Weapon>(charsheet.inventory.weapons);
        const armors = normalizeToArray<Armor>(charsheet.inventory.armors);
        const items = normalizeToArray<Item>(charsheet.inventory.items);
        
        const weaponsWeight = weapons.reduce((acc, w) => acc + (w.weight || 0), 0);
        const armorsWeight = armors.reduce((acc, a) => acc + (a.weight || 0), 0);
        const itemsWeight = items.reduce((acc, i) => acc + ((i.weight || 0) * (i.quantity || 1)), 0);
        return weaponsWeight + armorsWeight + itemsWeight;
    }, [ charsheet.inventory.weapons, charsheet.inventory.armors, charsheet.inventory.items ]);

    const totalItems = normalizeToArray<Weapon>(charsheet.inventory.weapons).length + 
                      normalizeToArray<Armor>(charsheet.inventory.armors).length + 
                      normalizeToArray<Item>(charsheet.inventory.items).length;
    const capacityPercent = (calculateTotalWeight / charsheet.capacity.max) * 100;
    const isOverloaded = capacityPercent > 100;
    const isNearLimit = capacityPercent > 80;
    // Papel de cor do medidor de capacidade: erro na sobrecarga, alerta perto do limite, sucesso no resto
    const capacityRole: 'error' | 'warning' | 'success' = isOverloaded ? 'error' : isNearLimit ? 'warning' : 'success';

    return { totalWeight: calculateTotalWeight, totalItems, capacityPercent, isOverloaded, isNearLimit, capacityRole };
}
