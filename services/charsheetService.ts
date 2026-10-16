import type { DbCharsheet } from '@models';
import { Service } from '@utils/apiRequest';

class CharsheetService extends Service<DbCharsheet, 'userId'> {
    // override async create<T>(data: Partial<T>, config?: any) { return (await this.post({ body: data, ...config })).data }
    // override async updateById<T>(data: Partial<T>, config?: any) { return (await this.put({ body: data, ...config })).data }
    async updateStatus(id: string, status: any[]) { return (await this.put({ param: id, body: { status } })).data }
    async increaseLevel(charsheetId: string, level: number) { return (await this.post({ param: `${charsheetId}/update/level`, body: { level } })).data }
    async decreaseLevel(charsheetId: string, level: number) { return (await this.post({ param: `${charsheetId}/update/level`, body: { level } })).data }

    /**
     * Atualização parcial pela API ({ "inventory.money": 10, ... }). Usada pelo mestre
     * ao editar fichas de jogadores — só o dono escreve direto no Firestore.
     */
    async updateFields(charsheetId: string, fields: Record<string, unknown>) { return (await this.patch({ param: `${charsheetId}/fields`, body: { fields } })).data }
}

export const charsheetService = new CharsheetService('/charsheet')
