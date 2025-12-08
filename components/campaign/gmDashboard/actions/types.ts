import type { PerkFilters } from '@models';
import type { RarityType } from '@models/types/string';

export interface PlayerInfo {
    id: string;
    name: string;
    avatar?: string;
    charsheet?: {
        id: string;
        name: string;
        level?: number;
        stats?: {
            lp?: number;
            maxLp?: number;
            mp?: number;
            maxMp?: number;
        };
        inventory?: {
            money?: number;
        };
    };
}

export interface ShopConfig {
    itemCount: number;
    rarities: RarityType[];
    types: string[];
    itemKinds: string[];
    priceMultiplier: number;
    visibleToAll: boolean;
    visibleToPlayers: string[];
}

export type MassActionType = 'restoreLP' | 'restoreMP' | 'addMoney';

export interface BaseDialogProps {
    open: boolean;
    onClose: () => void;
}

export interface PlayerSelectionDialogProps extends BaseDialogProps {
    players: PlayerInfo[];
}

export { type PerkFilters, type RarityType };
