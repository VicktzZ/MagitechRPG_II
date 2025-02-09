import { apiRequest } from '@utils/apiRequest';
import type { Magia, Service } from '@types';
import type { SearchOptions } from '@enums';

const { get, post, patch, delete: del } = apiRequest<Magia>('magia');

export const magiaService: Service<Magia, SearchOptions> = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as Magia[]; },
    async getById(id) { return await get({ param: id }); },
    async create(magia) { return await post(magia); },
    async updateById(body) { return await patch(body.id, body.data); },
    async deleteById(id) { return await del(id); }
}
