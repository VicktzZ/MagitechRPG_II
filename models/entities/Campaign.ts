import type { Note } from '../Note';
import type { Power } from './Power';
import type { Session } from '../Session';
import type { CampaignWidget } from '../CampaignWidget';
import type { Creature } from '../Creature';
import type { Weapon } from '../Weapon';
import type { Armor } from '../Armor';
import type { Item } from '../Item';
import { Collection } from 'fireorm';
import generateEntryCode from '@utils/generateEntryCode';
import type { Skill, Dice } from '@models';
import type { RarityType } from '@models/types/string';

export interface ShopConfig {
    isOpen: boolean;
    itemCount: number;
    rarities: RarityType[];
    types: string[];
    itemKinds: string[];
    priceMultiplier: number;
    currency?: 'SCRAP' | 'YEN';
    items?: any[];
    itemsGeneratedAt?: string;
    lastUpdated?: string;
    // Controle de visibilidade por jogador
    visibleToAll?: boolean;
    visibleToPlayers?: string[]; // IDs dos jogadores que podem ver a loja
}

@Collection('campaigns')
export class Campaign {
    id: string;
    admin: string[] = [];
    campaignCode: string = generateEntryCode();
    createdAt: string = new Date().toISOString();
    title: string;
    description: string;
    players: Array<{ userId: string, charsheetId: string }> = [];
    mode: 'Classic' | 'Roguelite' = 'Classic';
    notes: Note[] = [];
    session: Session;
    custom: {
        magias: Power[];
        creatures: Creature[];
        skills: Skill[];
        dices: Dice[];
        items: {
            weapon: Weapon[];
            armor: Armor[];
            item: Item[];
        };
    } = {
            magias: [],
            creatures: [],
            skills: [],
            dices: [],
            items: {
                weapon: [],
                armor: [],
                item: []
            }
        };
        
    shop?: ShopConfig;

    /**
     * ID do sistema de RPG customizado usado nesta campanha.
     * Se não definido, usa o sistema padrão Magitech.
     */
    systemId?: string;

    /**
     * Widget genérico compartilhado da campanha — painel flutuante visível
     * a todos os jogadores, administrado pelo mestre. Pode representar uma
     * nave, um local (taverna), um objetivo a defender etc.
     */
    widget?: CampaignWidget;

    /**
     * Estado da campanha. 'finished' = arquivada: sessões bloqueadas,
     * estatísticas congeladas. Pode ser reaberta pelo mestre.
     * undefined = 'active' (compatibilidade com campanhas antigas).
     */
    status?: 'active' | 'finished';

    /** Data de finalização da campanha */
    finishedAt?: string;
    
    constructor(campaign?: Partial<Campaign>) {
        Object.assign(this, campaign)
    }
}