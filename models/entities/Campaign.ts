import type { Note } from '../Note';
import type { Power } from './Power';
import type { Session } from '../Session';
import type { Creature } from '../Creature';
import type { Weapon } from '../Weapon';
import type { Armor } from '../Armor';
import type { Item } from '../Item';
import { Collection } from '@node_modules/fireorm/lib/src';
import generateEntryCode from '@utils/generateEntryCode';
import type { Skill, Dice } from '@models';

@Collection('campaigns')
export class Campaign {
    id: string;
    admin: string[] = [];
    campaignCode: string = generateEntryCode();
    createdAt: Date = new Date();
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
}