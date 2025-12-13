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
            agi?: number;
        };
        inventory?: {
            money?: number;
        };
        attributes?: {
            agi?: number;
            des?: number;
            for?: number;
            int?: number;
            sab?: number;
            car?: number;
        };
        session?: Array<{
            campaignCode: string;
            stats?: {
                lp?: number;
                maxLp?: number;
                mp?: number;
                maxMp?: number;
            };
        }>;
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
