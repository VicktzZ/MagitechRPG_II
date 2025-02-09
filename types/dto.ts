export interface UpdateByIdDto<T> {
    id: string;
    data: T;
}

export interface ConnectSessionDto {
    campaignCode: string;
    playerId: string;
    isGM: boolean;
}

export interface DisconnectSessionDto {
    campaignCode: string;
    playerId: string;
}

export type QueryParamsDto<T extends string> = Partial<Record<T, string>>;