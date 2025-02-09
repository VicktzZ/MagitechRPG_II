import { apiRequest } from '@utils/apiRequest'
import type { Service, User } from '@types'

const { get, post, delete: del, patch } = apiRequest<User>('user')

export const userService: Service<User> = {
    async getById(id) { return await get({ param: id }) },
    async create(user) { return await post(user) },
    async updateById(body) { return await patch(body.id, body.data) },
    async deleteById(id) { return await del(id) },
   
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    async fetch() { return console.error('Function Not implemented') as unknown as User[] }
}