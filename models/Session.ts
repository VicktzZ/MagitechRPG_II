import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Message } from './Message';
import { Type } from 'class-transformer';
import type { PerkTypeEnum, SkillTypeEnum } from '@enums/rogueliteEnum';
import type { RarityType } from './types/string';

export interface PerkFilters {
    rarities: RarityType[];
    type: PerkTypeEnum | '';
    element: string;
    spellLevel: string;
    execution: string;
    itemKinds: string[];
    skillTypes: SkillTypeEnum[];
}

export class Session {
    @IsArray()
    @IsString({ each: true })
        users: string[];
    
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => Message)
    @IsArray()
        messages?: Message[];

    // Lista de IDs de usuários que devem escolher perks
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
        pendingPerkUsers?: string[];

    // Filtros configurados pelo GM para os perks oferecidos
    @IsOptional()
        perkFilters?: PerkFilters;
    
    constructor(session?: Session) {
        Object.assign(this, session)
    }
}