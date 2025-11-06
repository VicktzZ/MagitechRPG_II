import type { DbCharsheet } from '@models';
import { Service } from '@utils/apiRequest';

class CharsheetService extends Service<DbCharsheet, 'userId'> {
    // override async create<T>(data: Partial<T>, config?: any) { return (await this.post({ body: data, ...config })).data }
    // override async updateById<T>(data: Partial<T>, config?: any) { return (await this.put({ body: data, ...config })).data }
    async updateStatus(id: string, status: any[]) { return (await this.put({ param: id, body: { status } })).data }
    async increaseLevel(charsheetId: string, level: number) { return (await this.post({ param: `${charsheetId}/update/level`, body: { level } })).data }
    async decreaseLevel(charsheetId: string, level: number) { return (await this.post({ param: `${charsheetId}/update/level`, body: { level } })).data }
}

export const charsheetService = new CharsheetService('/charsheet')
