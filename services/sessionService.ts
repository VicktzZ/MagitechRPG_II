import type { Campaign, ConnectSessionDto, DisconnectSessionDto } from '@types'
import { apiRequest } from '@utils/apiRequest'

const { post, delete: del } = apiRequest<Campaign>('campaign/session')

export const sessionService = {
    async connect(body: ConnectSessionDto) { return await post(body); },
    async disconnect(body: DisconnectSessionDto) { return await del(body as unknown as string); }
}