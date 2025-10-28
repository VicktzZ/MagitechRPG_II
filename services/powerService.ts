import { SearchOptions } from '@enums'
import { Service } from '@utils/apiRequest'
import type { Power } from '@models/entities';
import type { ApiParams } from '@models/types/api';
import type { QueryParamsDto } from '@models/types/dto';

interface PoderSearchParams {
    search?: string;
    filter?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

class PowerService extends Service<Power, keyof PoderSearchParams> {
    override async fetch(params?: ApiParams<keyof PoderSearchParams, Power>) {
        const queryParams: QueryParamsDto<keyof PoderSearchParams> = {};
        const { search, filter, sort, order, page, limit } = params?.queryParams ?? {}
        
        if (params?.queryParams) {
            if (search) queryParams[SearchOptions.SEARCH] = search;
            if (filter) queryParams[SearchOptions.FILTER] = filter;
            if (sort) queryParams[SearchOptions.SORT] = sort;
            if (order) queryParams[SearchOptions.ORDER] = order;
            if (page) queryParams[SearchOptions.PAGE] = page;
            if (limit) queryParams[SearchOptions.LIMIT] = limit;
        }

        return await super.fetch({ queryParams });
    }
}

export const powerService = new PowerService('/power')