import { AutoFixNormal, Shield, ShoppingBag } from '@mui/icons-material';
import { color } from '@themes/tokens';
import type { InventoryItemType } from './inventoryTypes';

/** Cor, ícone e rótulo de cada tipo de item do inventário */
export const getItemTypeConfig = (type: InventoryItemType) => {
    switch (type) {
    case 'weapon':
        return { color: color.danger, icon: AutoFixNormal, label: 'Arma' };
    case 'armor':
        return { color: color.cyan, icon: Shield, label: 'Armadura' };
    case 'item':
        return { color: color.success, icon: ShoppingBag, label: 'Item' };
    }
};
