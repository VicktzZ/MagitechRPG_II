import { apiRequest } from '@utils/apiRequest'
import type { MagicPower, Service } from '@types'
import type { SearchOptions } from '@enums'

const { get, post, delete: del, patch } = apiRequest<MagicPower>('poder')

export const poderService: Service<MagicPower, SearchOptions> = {
    async fetch(queryParams) { return await get({ queryParams }) as unknown as MagicPower[] },
    async getById(id) { return await get({ param: id }) },
    async create(poder) { return await post({ body: poder }) },
    async updateById(body) { return await patch(body.id, body.data) },
    async deleteById(id) { return await del(id) }
}
