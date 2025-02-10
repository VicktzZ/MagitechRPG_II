export interface UpdateByIdDto<T> {
    id: string;
    data: T;
}

export interface ConnectSessionDto {
    campaignCode: string;
    userId: string;
    isGM: boolean;
}

export interface DisconnectSessionDto {
    campaignCode: string;
    userId: string;
}

export type QueryParamsDto<T extends string> = Partial<Record<T, string>>;