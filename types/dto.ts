import type { DeepOverride } from './deepOverride';
import type { Classes, Ficha, LineageNames, OccupationNames } from './ficha';

type Id = string;

export interface UpdateByIdDto<T> {
    id: Id;
    data: T;
}

export interface ConnectSessionDto {
    campaignCode: string;
    userId: Id;
    isGM: boolean;
}

export interface DisconnectSessionDto {
    campaignCode: string;
    userId: Id;
}

export type FichaDto = DeepOverride<Ficha, {
    lineage: LineageNames | OccupationNames,
    class: Classes,
    skills: {
        powers: Id[]
    },
    magics: Id[]
}>

export type QueryParamsDto<T extends string, K extends string | number | boolean = string> = Partial<Record<T, K>>;