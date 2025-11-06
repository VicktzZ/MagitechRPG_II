export interface UpdateByIdDto<T> {
    id: string;
    data: T;
}

export interface ConnectSessionDto {
    campaignCode: string;
    userId: string;
    isGM: boolean;
    charsheetId: string;
}

export interface DisconnectSessionDto {
    campaignCode: string;
    userId: string;
}

export type QueryParamsDto<T extends string, K extends string | number | boolean = string> = Partial<Record<T, K>>;