import type { Armor, Item, Weapon } from '@models';

/** Aba ativa do inventário */
export type InventoryTab = 'all' | 'weapons' | 'armors' | 'items';

/** Tipo de cada item do inventário */
export type InventoryItemType = 'weapon' | 'armor' | 'item';

/** Item da lista filtrada, com o tipo da lista de onde veio */
export interface InventoryEntry {
    item: Weapon | Armor | Item;
    type: InventoryItemType;
}

/** Estado do modal de doação: qual item está sendo doado */
export interface DonationModalState {
    open: boolean;
    item: any;
    type: InventoryItemType;
}
