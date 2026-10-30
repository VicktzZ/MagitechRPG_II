import type { Combat } from '@models';
import { guidedRule, nextGuided, ownedPassives, type PassiveSheet } from '@utils/combat/passives';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import { adminGetDoc } from '@utils/firestore/adminDocs';

/**
 * **Magia Guiada** na resolução do ataque (`resolve_attack`): a sequência de acertos de magia mora no combatente (`Combatant.guided`). Quem confirma o acerto é o mestre, então é aqui
 * que ela anda: magia que acerta o mesmo alvo com a mesma magia soma um acerto (até o limite da habilidade); acertar outro alvo ou outra magia recomeça em 1; errar ou atacar com
 * arma zera; **sofrer dano** também zera. A sequência é do jogador que tem a habilidade (a ficha é lida só quando uma magia acerta).
 */
export async function applyGuidedHits(combat: Combat, pending: PendingAttackData, outcome: { hit: boolean; dealt: number }): Promise<void> {
    const attacker = combat.combatants.find(candidate => candidate.id === pending.attackerId);
    const target = combat.combatants.find(candidate => candidate.id === pending.targetId);

    // Quem levou dano perde a sequência
    if (target && outcome.dealt > 0 && target.guided) target.guided = undefined;
    if (!attacker || attacker.type !== 'player') return;

    // Errar, atacar com arma ou fora do padrão zera (só há o que zerar se já havia sequência)
    if (pending.source !== 'spell' || !outcome.hit) {
        if (attacker.guided) attacker.guided = undefined;
        return;
    }

    const sheet = await adminGetDoc<PassiveSheet>('charsheets', attacker.id);
    const rule = guidedRule(ownedPassives(sheet));
    if (!rule) return;
    attacker.guided = nextGuided(attacker.guided, { kind: 'spellHit', targetId: pending.targetId, spellKey: pending.name }, rule.maxHits);
}
