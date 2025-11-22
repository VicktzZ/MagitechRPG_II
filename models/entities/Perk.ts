import { v4 as uuid } from 'uuid';
import type { RarityType } from '@models/types/string';
import type { PerkEffect } from '../../features/roguelite/models/PerkEffect';
import { Collection } from 'fireorm';

@Collection('perks')
export class Perk<T = any> {
    id: string = uuid();
    name: string;
    description: string;
    rarity: RarityType = 'Comum';
    perkType: string;
    levelRequired?: number;
    data?: T;
    effects?: PerkEffect[]; // Efeitos que o perk causa na ficha
    weight?: number; // Peso de 0-100 para controlar probabilidade (padrão: 50)
    origin?: string; // Origem do perk
    
    constructor(perk?: Partial<Perk<T>>) {
        Object.assign(this, perk);
    }
}