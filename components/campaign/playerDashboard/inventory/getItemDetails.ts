import type { InventoryItemType } from './inventoryTypes';
import { formatWeight } from './itemTypeConfig';

/** Um campo do grid de detalhes de um item (`highlight` destaca o valor principal) */
export interface ItemDetail {
    label: string;
    value: string;
    highlight?: boolean;
}

/** Campos mostrados no grid de detalhes de cada tipo de item (lê com cuidado: fichas antigas não têm todos os campos) */
export function getItemDetails(item: any, type: InventoryItemType, weightUnitSuffix: string): ItemDetail[] {
    switch (type) {
    case 'weapon':
        return [
            { label: 'Dano', value: item.effect?.value ?? '-', highlight: true },
            { label: 'Crítico', value: item.effect?.critValue ? `${item.effect.critValue} (${item.effect.critChance ?? '-'})` : '-' },
            { label: 'Tipo', value: item.effect?.effectType || item.kind || '-' },
            { label: 'Categoria', value: item.categ || '-' },
            { label: 'Alcance', value: item.range || '-' },
            { label: 'Peso', value: formatWeight(item.weight || 0, weightUnitSuffix) }
        ];
    case 'armor':
        return [
            { label: 'Defesa', value: `+${item.ap || item.value || 0} AP`, highlight: true },
            { label: 'Tipo', value: item.kind || '-' },
            { label: 'Categoria', value: item.categ || '-' },
            { label: 'Penalidade', value: `${item.displacementPenalty ?? 0}m` },
            { label: 'Peso', value: formatWeight(item.weight || 0, weightUnitSuffix) }
        ];
    case 'item':
        return [
            { label: 'Tipo', value: item.kind || '-' },
            { label: 'Peso', value: formatWeight(item.weight || 0, weightUnitSuffix) },
            { label: 'Quantidade', value: `x${item.quantity ?? 1}`, highlight: true }
        ];
    }
}
