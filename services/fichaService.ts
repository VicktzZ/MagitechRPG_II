import type { Ficha, Status } from '@types';
import { Service } from '@utils/apiRequest';

class FichaService extends Service<Ficha, 'userId'> {
    // override async create<T>(data: Partial<T>, config?: any) { return (await this.post({ body: data, ...config })).data }
    // override async updateById<T>(data: Partial<T>, config?: any) { return (await this.put({ body: data, ...config })).data }
    async updateStatus(id: string, status: Status[]) { return (await this.put({ param: id, body: { status } })).data }
    async increaseLevel(fichaId: string, level: number) { return (await this.post({ param: `${fichaId}/update/level`, body: { level } })).data }
    async decreaseLevel(fichaId: string, level: number) { return (await this.post({ param: `${fichaId}/update/level`, body: { level } })).data }
}

export const fichaService = new FichaService('/ficha')
