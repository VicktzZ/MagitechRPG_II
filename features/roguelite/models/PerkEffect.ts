import { IsNumber, IsString, IsOptional } from 'class-validator';

// Tipo que representa todos os caminhos possíveis de propriedades do Charsheet
interface CharsheetPaths {
    // Propriedades diretas do BaseCharsheet
    id: string;
    playerName: string;
    userId: string;
    name: string;
    class: string;
    race: string;
    lineage: string;
    anotacoes: string;
    elementalMastery: string;
    subclass: string;
    createdAt: string;
    age: number;
    ORMLevel: number;
    displacement: number;
    spellSpace: number;
    mpLimit: number;
    overall: number;
    level: number;
    mode: 'Apocalypse' | 'Classic';
    gender: 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido';
    financialCondition: 'Miserável' | 'Pobre' | 'Estável' | 'Rico';
    status: string[];
    
    // Propriedades aninhadas de Stats
    'stats.lp': number;
    'stats.mp': number;
    'stats.ap': number;
    'stats.maxLp': number;
    'stats.maxMp': number;
    'stats.maxAp': number;
    
    // Propriedades aninhadas de Attributes
    'attributes.for': number;
    'attributes.agi': number;
    'attributes.int': number;
    'attributes.pre': number;
    'attributes.vig': number;
    
    // Propriedades aninhadas de Points
    'points.lp': number;
    'points.mp': number;
    'points.ap': number;
    'points.exp': number;
    'points.pts': number;
    
    // Propriedades aninhadas de Expertises (principais)
    'expertises.atletismo': number;
    'expertises.acrobacia': number;
    'expertises.furtividade': number;
    'expertises.percepcao': number;
    'expertises.sobrevivencia': number;
    'expertises.ocultismo': number;
    'expertises.investigacao': number;
    'expertises.natureza': number;
    'expertises.intimidacao': number;
    'expertises.diplomacia': number;
    'expertises.enganacao': number;
    'expertises.prestigitacao': number;
    'expertises.luta': number;
    
    // Capacity
    'capacity.cargo': number;
    'capacity.max': number;
    
    // Ammo Counter
    'ammoCounter.current': number;
    'ammoCounter.max': number;
    
    // Propriedades do Charsheet específico
    traits: string[];
    spells: string[];
    
    // Skills (arrays)
    'skills.lineage': any[];
    'skills.class': any[];
    'skills.subclass': any[];
    'skills.bonus': any[];
    'skills.powers': string[];
    'skills.race': any[];
    
    // Propriedades de sessão
    'session': Array<{
        campaignCode: string;
        stats?: {
            maxLp: number;
            maxMp: number;
            maxAp: number;
            lp: number;
            mp: number;
            ap: number;
        }
    }>;
}

export class PerkEffect {
    @IsString() type: 'heal' | 'damage' | 'add' | 'set' | 'multiply' | 'percentage';
    @IsString() target: keyof CharsheetPaths;
    value: number | string; // Permite tanto valores fixos quanto expressões como "0.5" ou "1d6+1"
    @IsOptional() @IsString() description?: string;
    // Para operações complexas
    @IsOptional() @IsString() formula?: string; // Ex: "maxLp * 0.5" ou "1d6+1"
    @IsOptional() @IsNumber() min?: number; // Valor mínimo permitido após a operação
    @IsOptional() @IsNumber() max?: number; // Valor máximo permitido após a operação
    // Para expertises
    @IsOptional() @IsString() expertiseName?: string; // Nome da expertise (ex: "Atletismo", "Diplomacia")
}