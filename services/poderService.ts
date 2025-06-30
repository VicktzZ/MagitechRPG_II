import type { MagicPower, QueryParamsDto, ApiParams } from '@types'
import { SearchOptions } from '@enums'
import { Service } from '@utils/apiRequest'

interface PoderSearchParams {
    search?: string;
    filter?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

class PoderService extends Service<MagicPower, keyof PoderSearchParams> {
    override async fetch(params?: ApiParams<keyof PoderSearchParams, MagicPower>) {
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

export const poderService = new PoderService('/poder')