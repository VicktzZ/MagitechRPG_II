import { Collection } from 'fireorm'

@Collection('skills')
export class SkillEntity {
    id: string;
    name: string;
    description: string;
    type: 'Poder Mágico' | 'Classe' | 'Linhagem' | 'Subclasse' | 'Bônus' | 'Profissão' | 'Exclusivo' | 'Raça' | 'Talento';
    origin: string;
    level?: number;
    effects?: number[];
    rarity?: string;

    constructor(skill?: Partial<SkillEntity>) {
        Object.assign(this, skill);
    }
}