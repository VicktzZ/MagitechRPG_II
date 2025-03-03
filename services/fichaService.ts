import type { Ficha, Service, Status } from '@types';
import { apiRequest } from '@utils/apiRequest';

const { get, post, patch, delete: del, put } = apiRequest<Ficha>('ficha');

export const fichaService: Service<Ficha, 'userId'> & { updateStatus: (id: string, status: Status[]) => Promise<Ficha>} = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as Ficha[] },
    async getById(id) { return await get({ param: id }); },
    async create(ficha) { return await post(ficha); },
    async updateById(body) { return await patch(body.id, body.data); },
    async deleteById(id) { return await del(id); },
    async updateStatus(id: string, status: Status[]) {
        return await put(`${id}/status`, { status })
    }
}