import type { Armor, Item, Weapon } from '@models';

/** Aba ativa do inventário */
export type InventoryTab = 'all' | 'weapons' | 'armors' | 'items';

/** Tipo de cada item do inventário */
export type InventoryItemType = 'weapon' | 'armor' | 'item';

/** Ordem da lista: por tipo (armas, armaduras, itens), alfabética, mais pesados ou mais raros primeiro */
export type InventorySort = 'type' | 'name' | 'weight-desc' | 'rarity-desc';

/** Item da lista filtrada, com o tipo da lista de onde veio e uma chave estável para a tela */
export interface InventoryEntry {
    item: Weapon | Armor | Item;
    type: InventoryItemType;
    key: string;
}

/** Estado do modal de doação: qual item está sendo doado */
export interface DonationModalState {
    open: boolean;
    item: any;
    type: InventoryItemType;
}
