import { BaseCharsheet, type Race } from '@models';
import { Collection } from 'fireorm';
import type { Skill } from '../Skill';

@Collection('charsheets')
export class Charsheet extends BaseCharsheet {
    race: Race['name'];
    traits: string[] = [];
    skills: {
        lineage: Skill[];
        class: Skill[];
        subclass: Skill[];
        bonus: Skill[];
        powers: string[];
        race: Skill[];
    } = {
            lineage: [],
            class: [],
            subclass: [],
            bonus: [],
            powers: [],
            race: []
        };
        
    spells: string[] = [];
    
    constructor(charsheet?: Partial<Charsheet>) {
        super(charsheet)
        Object.assign(this, charsheet)
    }
}