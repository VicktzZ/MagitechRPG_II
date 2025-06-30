import type { Campaign, ConnectSessionDto, DisconnectSessionDto } from '@types'
import { Service } from '@utils/apiRequest'

class SessionService extends Service<Campaign> {
    async connect(body: ConnectSessionDto) { return await this.post({ param: 'connect', body }) }
    async disconnect(body: DisconnectSessionDto) { return await this.post({ param: 'disconnect', body }) }
}

export const sessionService = new SessionService('/session')