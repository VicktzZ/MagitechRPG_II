import type { Ficha, Status } from '@types';
import { Service } from '@utils/apiRequest';

class FichaService extends Service<Ficha, 'userId'> {
    async updateStatus(id: string, status: Status[]) { return await this.put({ param: id, body: { status } }) }
    async increaseLevel(fichaId: string, level: number) { return await this.post({ param: `${fichaId}/update/level`, body: { level } }) }
    async decreaseLevel(fichaId: string, level: number) { return await this.post({ param: `${fichaId}/update/level`, body: { level } }) }
}

export const fichaService = new FichaService('/ficha')
