import type { DbCharsheet } from '@models';
import type { VitalDeltas } from '@utils/vitals';
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

    /**
     * Soma variações a LP, MP e AP ({ lp: -5 } tira 5 de vida), de 0 até o máximo, numa transação no servidor:
     * várias variações seguidas, ou junto de uma mudança do jogador, não se perdem.
     */
    async adjustStats(charsheetId: string, deltas: VitalDeltas) { return (await this.post({ param: `${charsheetId}/stats`, body: deltas })).data }

    /** Alguma campanha onde a ficha joga liberou a visualização de todos os estágios das magias? (ver `utils/spellReveal.ts`) */
    async getSpellStagesRevealed(charsheetId: string) { return (await this.get({ param: `${charsheetId}/reveal-spell-stages` })).data as { revealed: boolean } }
}

export const charsheetService = new CharsheetService('/charsheet')
