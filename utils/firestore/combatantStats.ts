import type { Campaign } from '@models/entities';
import { badRequest, notFound } from '@utils/api/errors';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import { applyCombatantDeltas, type CombatantVitalChange } from '@utils/combatantVitals';
import type { VitalDeltas } from '@utils/vitals';
import { adminUpdateDocInTransaction } from './adminDocs';

/**
 * Soma as variações à vida e à mana de uma criatura em combate, numa transação: o combate é lido e gravado sem que outra
 * escrita passe no meio, então cliques seguidos do mestre não se perdem. Grava só `session.combat.combatants` (a lista inteira,
 * porque o Firestore não altera um item de lista por caminho; os outros combatentes saem como estavam) e não registra no log do combate:
 * é o ajuste rápido do mestre, não um ataque (o diálogo de combate é quem narra dano e cura).
 * Jogadores não passam por aqui: a vida deles é da ficha (`adjustCharsheetStats`).
 */
export async function adjustCombatantVitals(campaignId: string, combatantId: string, deltas: VitalDeltas): Promise<CombatantVitalChange> {
    return await adminUpdateDocInTransaction<CombatantVitalChange, Campaign>('campaigns', campaignId, data => {
        if (!data) throw notFound('Campanha não encontrada');

        const combat = data.session?.combat;
        if (!combat?.isActive) throw badRequest('Não há combate ativo');

        const combatants = Array.isArray(combat.combatants) ? combat.combatants : [];
        const index = combatants.findIndex(combatant => combatant.id === combatantId);
        if (index === -1) throw notFound('Combatente não encontrado');

        const target = combatants[index];
        if (target.type !== 'creature') throw badRequest('Só criaturas se ajustam por aqui: a vida do jogador é da ficha');

        const creature = findBaseCreature(target.id, data.custom?.creatures ?? []);
        const { combatant, changes } = applyCombatantDeltas(target, creature, deltas);

        const next = [ ...combatants ];
        next[index] = combatant;

        return { fields: { 'session.combat.combatants': next }, result: changes };
    });
}
