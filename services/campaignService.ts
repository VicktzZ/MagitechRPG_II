import type { Armor, Item, Note, Weapon, PerkFilters, CombatEffect } from '@models'
import type { Campaign, Charsheet, User } from '@models/entities'
import type { ActiveTest, CampaignData, TestData, TestResponse } from '@models/types/session'
import { Service } from '@utils/apiRequest'
import type { CreateCombatEffectPayload } from './combatEffectService'
import type { CombatEventItem } from '@utils/combat/history'
import type { AbilityUseResponse } from '@utils/combat/passives/types'

class CampaignService extends Service<Campaign, 'code' | 'userId'> {
    async listByUser(userId: string) {
        return (await this.get({ param: `?userId=${encodeURIComponent(userId)}` })).data as unknown as { asGm: Array<{ id: string, code: string }>, asPlayer: Array<{ id: string, code: string }> };
    }

    /** Atualização parcial da campanha pelo mestre ({ "session.combat": ..., custom: ... }) */
    async updateFields(campaignId: string, fields: Record<string, unknown>) { return (await this.patch({ param: `${campaignId}/fields`, body: { fields } })).data }

    async getCampaignUsers(campaignId: string): Promise<User[]> { return await this.fetch({ param: `${campaignId}/users` }) as unknown as User[] }
    /** Anotação privada do mestre sobre uma ficha (texto vazio apaga); a leitura é direto no Firestore, em tempo real */
    async saveGmNote(campaignId: string, charsheetId: string, text: string) { return (await this.put({ param: `${campaignId}/gm-notes/${charsheetId}`, body: { text } })).data as unknown as { saved: boolean } }
    /**
     * Dano ou cura rápidos de uma criatura em combate: manda só a variação (negativa = dano ou gasto) e o servidor soma ao que está
     * gravado, então cliques seguidos não se perdem. Nunca mande o valor final.
     */
    async adjustCombatantVitals(campaignId: string, combatantId: string, deltas: Partial<Record<'lp' | 'mp', number>>) { return (await this.post({ param: `${campaignId}/combat/vitals`, body: { combatantId, ...deltas } })).data }
    async createNote(campaignId: string, note: Pick<Note, 'content'>) { return (await this.post({ param: `${campaignId}/notes`, body: note })).data }
    async updateNote(campaignId: string, noteId: string, content: string) { return (await this.patch({ param: `${campaignId}/notes`, body: { noteId, content } })).data }
    async deleteNote(campaignId: string, noteId: string) { return (await this.delete({ param: `${campaignId}/notes`, body: { noteId } })).data }
    async removeUser(campaignId: string, userId: string) { return (await this.delete({ param: `${campaignId}/users`, body: { userId } })).data }
    async updateUserCharsheet(campaignId: string, charsheet: Charsheet) { return (await this.patch({ param: `${campaignId}/update-user-charsheet`, body: charsheet })).data }
    async getCharsheets(campaignId: string) { return await this.fetch({ param: `${campaignId}/charsheets` }) as unknown as Charsheet[] }
    async getAllData(campaignId: string, userId: string) { return (await this.get({ param: `${campaignId}/get-all-data?userId=${userId}` })).data as unknown as CampaignData }
    
    // Custom campaign
    async addCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', item: Weapon | Armor | Item) {
        return (await this.post({ param: `${campaignId}/custom/items`, body: { type, item } })).data
    }

    async deleteCustomItem(campaignId: string, type: 'weapon' | 'armor' | 'item', itemId: string) {
        return (await this.delete({ param: `${campaignId}/custom/items/${itemId}`, body: type })).data
    }

    // Perk offering
    async offerPerks(campaignId: string, userIds: string[], filters: PerkFilters, sharedSeed?: string) {
        return (await this.post({ param: `${campaignId}/session/offer-perks`, body: { userIds, filters, sharedSeed } })).data
    }

    async removePendingPerkUser(campaignId: string, userId: string) {
        return (await this.post({ param: `${campaignId}/session/pending-perk-user`, body: { userId } })).data
    }

    // Testes pedidos pelo mestre
    async requestTest(campaignId: string, data: TestData) {
        return (await this.post({ param: `${campaignId}/session/test-request`, body: data })).data as unknown as { success: boolean, request: ActiveTest }
    }

    async respondTest(campaignId: string, body: { requestId: string, rolls: number[], bonus: number }) {
        return (await this.post({ param: `${campaignId}/session/test-response`, body })).data as unknown as { success: boolean, response: TestResponse }
    }

    // --- Combat Effects (catalogo + aplicação em combate) ---
    async listEffects(campaignId: string, includeGlobal = true) {
        const qs = includeGlobal ? '?includeGlobal=true' : ''
        const res = (await this.get({ param: `${campaignId}/custom/effects${qs}` })).data as {
            success: boolean
            campaignEffects: CombatEffect[]
            globalEffects: CombatEffect[]
            effects: CombatEffect[]
        }
        return res
    }

    async createCampaignEffect(campaignId: string, payload: CreateCombatEffectPayload & { cloneFromId?: string }) {
        return (await this.post({ param: `${campaignId}/custom/effects`, body: payload })).data as {
            success: boolean
            effect: CombatEffect
        }
    }

    async updateCampaignEffect(campaignId: string, effectId: string, patch: Partial<CreateCombatEffectPayload>) {
        return (await this.patch({ param: `${campaignId}/custom/effects/${effectId}`, body: patch })).data as {
            success: boolean
            effect: CombatEffect
        }
    }

    async deleteCampaignEffect(campaignId: string, effectId: string) {
        return (await this.delete({ param: `${campaignId}/custom/effects/${effectId}` })).data as {
            success: boolean
        }
    }

    async applyCombatEffect(campaignId: string, payload: {
        targetId: string
        effectId: string
        level: number
        appliedByName?: string
        appliedById?: string
        /** Sobrescreve o timing default do efeito (sem afetar o catálogo) */
        timingOverride?: 'turn' | 'round'
        /** Sobrescreve a duração default do nível (sem afetar o catálogo) */
        durationOverride?: number
        /** Aplica o efeito como indefinido (só expira ao ser removido manualmente) */
        indefiniteOverride?: boolean
    }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'apply_effect', ...payload }
        })).data
    }

    async removeCombatEffect(campaignId: string, payload: { targetId: string; appliedEffectId: string }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'remove_effect', ...payload }
        })).data
    }

    /**
     * Registra MP gasto em magia no turno do combatente. O servidor recusa (409,
     * code MP_LIMIT_EXCEEDED) o que passar do limite por turno. Valor negativo estorna.
     */
    async spendCombatMp(campaignId: string, payload: { combatantId: string; value: number }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'spend_mp', ...payload }
        })).data
    }

    /** Mestre zera o MP gasto na rodada (o limite de MP por turno) de qualquer jogador ou criatura em combate */
    async resetMpLimit(campaignId: string, payload: { combatantId: string }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'reset_mp_limit', ...payload }
        })).data
    }

    /** Mestre define exatamente o MP gasto na rodada de um jogador ou criatura em combate (de 0 até o limite; o limite não muda) */
    async setMpSpent(campaignId: string, payload: { combatantId: string; value: number }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'set_mp_spent', ...payload }
        })).data
    }

    /** Gasta uma ação da rodada do combatente (`execution`: Padrão, Bônus/Livre, Movimento, Reação ou Completa); 409 `ACTION_UNAVAILABLE` se não tem */
    async spendCombatAction(campaignId: string, payload: { combatantId: string; execution: string }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'spend_action', ...payload }
        })).data
    }

    /**
     * Usa uma habilidade ativada de classe ou subclasse (`abilityKey`: `class:cura interior`). O servidor confere a ficha, os usos e o MP, gasta o MP e a ação e devolve a rolagem da
     * cura (`ability.heal`) para o chat. 409 `ABILITY_BLOCKED` (com `block`) quando não dá; `force` é do mestre e libera os usos esgotados e a cura bloqueada.
     */
    async useAbility(campaignId: string, payload: { combatantId: string; abilityKey: string; choiceId?: string; force?: boolean; targetIds?: string[] }): Promise<AbilityUseResponse> {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'use_ability', ...payload }
        })).data as unknown as AbilityUseResponse
    }

    /** Mestre renova os usos por dia das habilidades (descanso) das fichas indicadas, ou de todos os jogadores da campanha */
    async restPlayers(campaignId: string, charsheetIds?: string[]) {
        return (await this.post({
            param: `${campaignId}/rest`,
            body: charsheetIds ? { charsheetIds } : {}
        })).data
    }

    /** Mestre ajusta as ações que restam a um combatente ({ reacao: 1 } devolve a Reação); só os espaços informados mudam */
    async setCombatActions(campaignId: string, payload: { combatantId: string; actions: Partial<Record<'padrao' | 'bonus' | 'movimento' | 'reacao', number>> }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'set_actions', ...payload }
        })).data
    }

    /**
     * Mestre dá (ou tira) ações a um combatente: `delta` soma às ações de agora ({ padrao: 1 } dá uma Padrão extra, { movimento: -1 } tira uma de Movimento; sempre de 0 a 9) e
     * `perRound` muda quantas ele recupera a cada rodada ({ padrao: 2 }). O servidor soma a variação ao que o combatente tem, então um gasto simultâneo não se perde.
     */
    async adjustCombatActions(campaignId: string, payload: {
        combatantId: string;
        delta?: Partial<Record<'padrao' | 'bonus' | 'movimento' | 'reacao', number>>;
        perRound?: Partial<Record<'padrao' | 'bonus' | 'movimento' | 'reacao', number>>;
    }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'adjust_actions', ...payload }
        })).data
    }

    /** Ataque assistido: declara um ataque com alvo (o jogador com o próprio personagem; o mestre com qualquer um). O mestre resolve depois */
    async declareAttack(campaignId: string, payload: { combatantId: string; targetId: string; attack: Record<string, unknown>; damage?: number; opportunityId?: string; targetIds?: string[] }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'declare_attack', ...payload } })).data
    }

    /** O dano rolado se junta ao ataque pendente */
    async setAttackDamage(campaignId: string, payload: { attackId: string; damage: number; critical?: boolean }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'attack_damage', ...payload } })).data
    }

    /**
     * O jogador atacado declara a própria defesa (esquiva, resistência ou nenhuma) com o teste que rolou. Uma vez só: repetir dá 409
     * `DEFENSE_ALREADY_DECLARED` (o mestre troca o que quiser ao resolver).
     */
    async declareDefense(
        campaignId: string,
        payload: { attackId: string; defense: { choice: 'dodge' | 'resist' | 'none'; skill?: string; total?: number; rolls?: number[]; used?: number; bonus?: number } }
    ) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'declare_defense', ...payload } })).data
    }

    /**
     * Quem saiu do alcance corpo a corpo de inimigos declara a saída (`combatantId` é quem saiu): cada inimigo que pode reagir ganha uma oportunidade de ataque.
     * Devolve `warnings` com quem não pôde reagir (sem Reação...).
     */
    async declareLeave(campaignId: string, payload: { combatantId: string; reactorIds: string[] }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'declare_leave', ...payload } })).data as unknown as { warnings?: string[] }
    }

    /** Dispensa uma oportunidade de ataque aberta (o inimigo que ia reagir, quem se moveu ou o mestre) */
    async dismissOpportunity(campaignId: string, opportunityId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'dismiss_opportunity', opportunityId } })).data
    }

    /** Mestre marca quem não vê `combatantId` (furtivo, invisível ou fora da vista): matriz de percepção (`utils/combat/awareness.ts`). Silencioso: não vai ao log nem ao chat */
    async setUnseen(campaignId: string, payload: { combatantId: string; observerIds: string[]; cause: 'furtivo' | 'invisivel' | 'outro' }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'set_unseen', ...payload } })).data as unknown as { warnings?: string[] }
    }

    /** Mestre revela `combatantId` a alguns observadores, ou a todos se `observerIds` não vier */
    async revealUnseen(campaignId: string, payload: { combatantId: string; observerIds?: string[] }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'reveal_unseen', ...payload } })).data
    }

    /** Mestre define a iluminação da cena: ambiente manual (`utils/combat/environment.ts`). Vai ao log e ao chat quando muda */
    async setLight(campaignId: string, light: 'claro' | 'penumbra' | 'escuridao') {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'set_light', light } })).data
    }

    /** Mestre marca (`difficult: true`) ou desmarca combatentes em terreno difícil: o deslocamento deles cai pela metade, salvo imunidade */
    async setTerrain(campaignId: string, payload: { combatantIds: string[]; difficult: boolean }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'set_terrain', ...payload } })).data as unknown as { warnings?: string[] }
    }

    /** Mestre marca o lado (`ally` aliado ou `enemy` inimigo) de combatentes: auras, curas em grupo e áreas usam o lado (`utils/combat/sides.ts`) */
    async setSide(campaignId: string, payload: { combatantIds: string[]; side: 'ally' | 'enemy' }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'set_side', ...payload } })).data as unknown as { warnings?: string[] }
    }

    /** Mestre abre uma reação: o que aconteceu (`trigger`, e `subjectId` quem sofreu ou fez) e quem pode reagir; cada reator com a Reação disponível ganha uma oferta (`utils/combat/reactions.ts`). Silencioso */
    async openReaction(campaignId: string, payload: { trigger: string; subjectId?: string; text?: string; reactorIds: string[] }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'open_reaction', ...payload } })).data as unknown as { warnings?: string[] }
    }

    /** Dispensa uma oferta de reação (quem ia reagir ou o mestre) */
    async dismissReaction(campaignId: string, reactionId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'dismiss_reaction', reactionId } })).data
    }

    /** Descarta um ataque pendente (quem atacou ou o mestre) */
    async dismissAttack(campaignId: string, attackId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'dismiss_attack', attackId } })).data
    }

    /** Mestre confirma o ataque: aplica o dano final, gasta a Reação de quem esquivou e registra no log (só as linhas públicas do cálculo vão ao chat) */
    async resolveAttack(campaignId: string, payload: { attackId: string; hit: boolean; damage: number; reactionSpent?: boolean; lines?: Array<{ label: string; detail?: string; visibility: 'all' | 'gm' }> }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'resolve_attack', ...payload } })).data
    }

    /** Histórico do combate (só o mestre): os últimos eventos, o mais novo primeiro */
    async getCombatEvents(campaignId: string) {
        return (await this.get({ param: `${campaignId}/combat/events` })).data as unknown as { events: CombatEventItem[] }
    }

    /**
     * Mestre desfaz um evento do histórico: devolve só os campos que ele mudou. Se algum já mudou de novo depois, o servidor responde
     * 409 `UNDO_CONFLICT` com a lista; repita com `force: true` para desfazer mesmo assim.
     */
    async undoCombatEvent(campaignId: string, payload: { eventId: string; force?: boolean }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'undo', ...payload }
        })).data
    }

    /** Magia sustentada conjurada com sucesso em combate: vira um efeito sobre o conjurador, com manutenção a cada rodada */
    async startSustainedSpell(campaignId: string, payload: { combatantId: string; spellKey: string; spellName: string; stage: number; cost: number }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'sustain_start', ...payload }
        })).data
    }

    /** Desconjura a magia sustentada (ou todas, sem `spellKey`) */
    async endSustainedSpells(campaignId: string, payload: { combatantId: string; spellKey?: string }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'sustain_end', ...payload }
        })).data
    }

    /**
     * Mestre: adiciona jogadores (por ficha) e criaturas (por id, com cópias) a um combate em andamento. O servidor lê os dados da ficha e
     * da criatura, rola a iniciativa na fase de ação e põe cada um no lugar dela na ordem. Devolve `warnings` do que ficou de fora.
     */
    async addCombatants(campaignId: string, join: { players?: Array<{ charsheetId: string; avatar?: string }>; creatures?: Array<{ id: string; quantity?: number }> }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'add_combatants', join }
        })).data as unknown as { success: boolean; message: string; warnings?: string[] }
    }

    /** Mestre: inicia o combate com os participantes escolhidos (o formato de `buildStartPlayers` e `buildStartCreatures`); `showEnemyLp` deixa a vida das criaturas à mostra dos jogadores */
    async startCombat(campaignId: string, payload: { players: object[]; creatures: object[]; showEnemyLp?: boolean }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'start', ...payload } })).data as unknown as { success: boolean; message?: string }
    }

    /** Mestre: encerra o combate (zera os limites de MP e devolve as ações; o histórico fica para o "Desfazer") */
    async endCombat(campaignId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'end' } })).data as unknown as { success: boolean; message?: string }
    }

    /** Passa o turno (o servidor vira a rodada quando todos já passaram) */
    async nextTurn(campaignId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'next_turn' } })).data as unknown as { success: boolean; message?: string }
    }

    /** Mestre rola a iniciativa de um combatente (com `value` fixa o d20; sem ele o servidor rola) */
    async rollInitiative(campaignId: string, payload: { combatantId: string; value?: number }) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'roll_initiative', advantageType: 'normal', ...payload } })).data as unknown as { success: boolean; message?: string }
    }

    /** Mestre fecha a fase de iniciativa: a ordem de turnos fica definida e começa a fase de ação */
    async setInitiativeOrder(campaignId: string) {
        return (await this.post({ param: `${campaignId}/combat`, body: { action: 'set_initiative' } })).data as unknown as { success: boolean; message?: string }
    }

    /** Mestre: libera (true) ou restabelece (false) o limite de MP por turno de um jogador */
    async setCombatMpLimitOverride(campaignId: string, payload: { combatantId: string; enabled: boolean }) {
        return (await this.post({
            param: `${campaignId}/combat`,
            body: { action: 'set_mp_limit_override', ...payload }
        })).data
    }
}

export const campaignService = new CampaignService('/campaign')