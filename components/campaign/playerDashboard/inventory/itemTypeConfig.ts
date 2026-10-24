import { Gavel, Inventory2, Shield } from '@mui/icons-material';
import { color } from '@themes/tokens';
import type { InventoryItemType } from './inventoryTypes';

/** Cor da marca (filete e glifo), ícone e rótulo de cada tipo de item. Os mesmos de `itemAttributes` em `@constants` */
export const getItemTypeConfig = (type: InventoryItemType) => {
    switch (type) {
    case 'weapon':
        return { color: color.danger, icon: Gavel, label: 'Arma', plural: 'Armas' };
    case 'armor':
        return { color: color.ap, icon: Shield, label: 'Armadura', plural: 'Armaduras' };
    case 'item':
        return { color: color.success, icon: Inventory2, label: 'Item', plural: 'Itens' };
    }
};

/** "12,4 kg": uma casa decimal no máximo, vírgula decimal; `suffix` já vem com o espaço ("" quando a unidade é simbólica) */
export const formatWeight = (value: number, suffix: string): string =>
    `${(Number(value) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${suffix}`;
