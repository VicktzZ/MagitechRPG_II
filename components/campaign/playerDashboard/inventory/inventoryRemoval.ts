import type { Armor, Item, Weapon } from '@models';
import { normalizeToArray } from '@utils/normalizeToArray';
import { armorPoints, withoutItem } from './inventoryList';
import type { InventoryItemType } from './inventoryTypes';

interface RemovalSheet {
    inventory: { weapons?: unknown; armors?: unknown; items?: unknown };
    stats?: { ap?: number; maxAp?: number } | null;
    capacity: { max?: number; cargo: number };
}

/** A armadura base do personagem: tirar uma armadura nunca deixa os pontos abaixo disto */
const BASE_AP = 5;

/**
 * Os caminhos da ficha a gravar quando um item sai do inventário (por remover ou por doar):
 * - a lista do tipo sem o item;
 * - armadura: tira os pontos de armadura que ela dava (atual e máximo, nunca abaixo da base);
 * - item de Capacidade: diminui a capacidade máxima em vez de mexer na carga (ele nunca pesou na mochila);
 * - os demais: diminui a carga pelo peso (vezes a quantidade nos itens), sem passar de zero.
 */
export function buildRemovalUpdate(sheet: RemovalSheet, item: any, type: InventoryItemType): Record<string, unknown> {
    const update: Record<string, unknown> = {};

    switch (type) {
    case 'weapon':
        update['inventory.weapons'] = withoutItem(normalizeToArray<Weapon>(sheet.inventory.weapons), item);
        break;
    case 'armor': {
        update['inventory.armors'] = withoutItem(normalizeToArray<Armor>(sheet.inventory.armors), item);
        const points = armorPoints(item);
        update['stats.ap'] = Math.max(BASE_AP, (sheet.stats?.ap || BASE_AP) - points);
        update['stats.maxAp'] = Math.max(BASE_AP, (sheet.stats?.maxAp || BASE_AP) - points);
        break;
    }
    case 'item':
        update['inventory.items'] = withoutItem(normalizeToArray<Item>(sheet.inventory.items), item);
        if (item.kind === 'Capacidade') {
            const max = Math.max(0, (sheet.capacity?.max || 0) - Math.abs(item.weight || 0));
            update['capacity.max'] = parseFloat(max.toFixed(1));
        }
        break;
    }

    if (type !== 'item' || item.kind !== 'Capacidade') {
        const weight = (item.weight || 0) * (item.quantity || 1);
        update['capacity.cargo'] = parseFloat(Math.max(0, sheet.capacity.cargo - weight).toFixed(1));
    }

    return update;
}
