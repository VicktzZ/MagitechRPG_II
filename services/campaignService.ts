import type { Campaign, Service } from '@types';
import { apiRequest } from '@utils/apiRequest';

const { get, post, patch, delete: del } = apiRequest<Campaign>('campaign');

export const campaignService: Service<Campaign, 'code'> = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as Campaign[]; },
    async getById(code) { return await get({ queryParams: { code } }); },
    async create(campaign) { return await post(campaign); },
    async updateById(body) { return await patch(body.id, body.data); },
    async deleteById(id) { return await del(id); }
}
