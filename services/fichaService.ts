import type { Ficha, Service } from '@types';
import { apiRequest } from '@utils/apiRequest';

const { get, post, patch, delete: del } = apiRequest<Ficha>('ficha');

export const fichaService: Service<Ficha, 'userId'> = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as Ficha[] },
    async getById(id) { return await get({ param: id }); },
    async create(ficha) { return await post(ficha); },
    async updateById(body) { return await patch(body.id, body.data); },
    async deleteById(id) { return await del(id); }
}