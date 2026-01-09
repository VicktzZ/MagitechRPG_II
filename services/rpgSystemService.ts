import type { RPGSystem } from '@models/entities'
import { Service } from '@utils/apiRequest'

class RPGSystemService extends Service<RPGSystem, 'userId' | 'isPublic'> {
    /**
     * Lista todos os sistemas disponíveis para um usuário
     * Inclui sistemas públicos e sistemas privados do próprio usuário
     */
    async listAvailable(userId: string) {
        return (await this.get({ param: `?userId=${encodeURIComponent(userId)}` })).data as unknown as RPGSystem[];
    }

    /**
     * Lista apenas sistemas públicos
     */
    async listPublic() {
        return (await this.get({ param: '?isPublic=true' })).data as unknown as RPGSystem[];
    }

    /**
     * Lista sistemas criados por um usuário específico
     */
    async listByCreator(creatorId: string) {
        return (await this.get({ param: `?creatorId=${encodeURIComponent(creatorId)}` })).data as unknown as RPGSystem[];
    }

    /**
     * Duplica um sistema existente
     */
    async duplicate(systemId: string, newName: string, creatorId: string) {
        return (await this.post({ 
            param: `${systemId}/duplicate`, 
            body: { name: newName, creatorId } 
        })).data as unknown as RPGSystem;
    }
}

export const rpgSystemService = new RPGSystemService('/rpg-system')
