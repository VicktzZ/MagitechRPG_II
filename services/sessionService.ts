import type { Campaign, ConnectSessionDto, DisconnectSessionDto } from '@types'
import { apiRequest } from '@utils/apiRequest'

const { url: sessionApi } = apiRequest<Campaign>('session')

export const sessionService = {
    async connect(body: ConnectSessionDto) { return await sessionApi('connect').post(body); },
    async disconnect(body: DisconnectSessionDto) { return await sessionApi('disconnect').post(body as unknown as string); }
}