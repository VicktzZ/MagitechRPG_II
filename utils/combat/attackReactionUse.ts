import { CombatLog, type Combat, type Combatant } from '@models';
import { combatantBudget } from '@utils/combat/actionBudgets';
import { buildAttackReaction, counterOf, planAttackReaction, settleReactions, type AttackReaction, type AttackReactionBlock, type ReactionOutcome } from '@utils/combat/attackReactions';
import { executionSlot, spendAction } from '@utils/combat/engine/actionBudget';
import { abilityStorageKey, buildAbilityEffect, findPassiveByKey, ownedPassives, readAbilityDayUses, type AbilityUses, type PassiveDef, type PassiveSheet } from '@utils/combat/passives';
import { addOpportunities, type OpportunityData } from '@utils/combat/opportunities';
import { addPendingReaction, type PendingAttackData } from '@utils/combat/pendingAttacks';
import { closeReactionsOf } from '@utils/combat/reactions';
import { endSustained } from '@utils/combat/sustainedEffect';
import { AbilityDayLimitReached, consumeAbilityDayUse, refundAbilityDayUse } from '@utils/firestore/abilityUses';
import { adminGetDoc } from '@utils/firestore/adminDocs';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';
import { v4 as uuidv4 } from 'uuid';

/**
 * Reagir no meio do ataque, a parte do servidor (`react_attack` e a resolução das reações armadas em `resolve_attack`). O jogador atacado declara a reação antes de o mestre
 * resolver; o servidor confere a habilidade, os usos e o MP, **copia os efeitos do catálogo** para o ataque pendente (o cliente só diz qual habilidade) e:
 *  - reação **imediata** (`now`): paga já (MP, Reação, o uso do dia e do combate);
 *  - reação **armada** (`miss`, `damaged`, `dodged`...): só confere que dá para pagar; o custo sai na resolução, se a condição se cumprir.
 * Como em todo o combate, gastar a ação é aviso, nunca trava (o mestre decide).
 */

interface SheetDoc extends PassiveSheet {
    abilityUses?: unknown;
    stats?: { lp?: unknown; maxLp?: unknown; mp?: unknown } | null;
}

export type AttackReactionOutcome =
    | { ok: true; combat: Combat; reaction: AttackReaction; warnings: string[] }
    | { ok: false; status: number; body: { error: string; code: string; block?: AttackReactionBlock } };

const failure = (status: number, error: string, code: string, block?: AttackReactionBlock): AttackReactionOutcome => ({ ok: false, status, body: { error, code, ...(block ? { block } : {}) } });

type ChargeResult = { ok: true; warnings: string[]; refund: () => Promise<void> } | { ok: false; reason: string };

/**
 * Paga o custo de uma habilidade de reação: o uso do dia (numa transação), o MP da ficha, a ação (aviso) e o uso deste combate. Se algo falha no meio o uso do dia é devolvido.
 * `ignoreLimits` é o mestre liberando.
 */
async function chargeReaction(combat: Combat, combatant: Combatant, def: PassiveDef, cost: number, currentMp: number, ignoreLimits: boolean): Promise<ChargeResult> {
    const activation = def.activation!;
    const warnings: string[] = [];

    const dayLimit = (activation.limits ?? []).find(limit => limit.per === 'dia');
    let dayUseTaken = false;
    if (dayLimit) {
        try {
            await consumeAbilityDayUse(combatant.id, def.key, ignoreLimits ? Number.MAX_SAFE_INTEGER : dayLimit.max);
            dayUseTaken = true;
        } catch (error) {
            if (error instanceof AbilityDayLimitReached) return { ok: false, reason: `${def.name}: acabaram os usos do dia.` };
            throw error;
        }
    }

    try {
        if (cost > 0) {
            await adjustCharsheetStats(combatant.id, { mp: -cost });
            combatant.currentMp = Math.max(0, currentMp - cost);
            if (combatant.currentMp <= 0) endSustained(combat, combatant.id);
        }

        const spent = spendAction(combatantBudget(combatant), activation.execution);
        if (spent.ok) {
            combatant.actions = spent.budget;
            if (executionSlot(activation.execution) === 'reacao') combat.reactions = closeReactionsOf(combat.reactions, combatant.id);
        } else {
            warnings.push(`${combatant.name} já não tinha a ação ${activation.execution} disponível nesta rodada.`);
        }

        const storage = abilityStorageKey(def.key);
        combatant.abilityUses = { ...(combatant.abilityUses ?? {}), [storage]: (combatant.abilityUses?.[storage] ?? 0) + 1 };
    } catch (error) {
        if (dayUseTaken) await refundAbilityDayUse(combatant.id, def.key).catch(() => undefined);
        throw error;
    }

    return { ok: true, warnings, refund: async () => { if (dayUseTaken) await refundAbilityDayUse(combatant.id, def.key); } };
}

interface ReactParams {
    combat: Combat;
    pending: PendingAttackData;
    reactor: Combatant;
    abilityKey: string;
    isGM: boolean;
    /** O mestre libera os usos esgotados */
    force: boolean;
}

/** O jogador atacado reage ao ataque pendente com uma habilidade de reação: confere, paga (se imediata) e guarda a reação no ataque */
export async function runAttackReaction({ combat, pending, reactor, abilityKey, isGM, force }: ReactParams): Promise<AttackReactionOutcome> {
    const sheet = await adminGetDoc<SheetDoc>('charsheets', reactor.id);
    if (!sheet) return failure(404, 'Ficha não encontrada', 'SHEET_NOT_FOUND');

    const passives = ownedPassives(sheet);
    const currentMp = Number(sheet.stats?.mp ?? reactor.currentMp ?? 0);
    const uses: AbilityUses = { day: readAbilityDayUses(sheet), combat: reactor.abilityUses ?? {} };
    const plan = planAttackReaction({ key: abilityKey, attack: pending, currentMp, uses, owned: passives.some(passive => passive.key === abilityKey), ignoreLimits: isGM && force });

    if (!plan.ok || !plan.def) {
        const status = plan.block === 'sem-habilidade' ? 403 : plan.block === 'nao-ativada' || plan.block === 'nao-e-reacao' ? 400 : 409;
        return failure(status, plan.reason ?? 'Não foi possível reagir', 'REACTION_BLOCKED', plan.block);
    }

    const reaction = buildAttackReaction(plan.def, { id: reactor.id, name: reactor.name }, uuidv4(), new Date().toISOString());
    if (!reaction) return failure(400, 'Esta habilidade não é uma reação a ataque', 'REACTION_BLOCKED', 'nao-e-reacao');

    const warnings: string[] = [];
    if (!reaction.armed) {
        const charged = await chargeReaction(combat, reactor, plan.def, plan.cost, currentMp, isGM && force);
        if (!charged.ok) return failure(409, charged.reason, 'REACTION_BLOCKED', 'limite');
        warnings.push(...charged.warnings);
    }

    const updated = addPendingReaction(combat.pendingAttacks, pending.id, reaction);
    if (!updated) {
        return failure(404, 'Ataque pendente não encontrado (o mestre pode já tê-lo resolvido)', 'ATTACK_GONE');
    }
    combat.pendingAttacks = updated;

    combat.logs.push(new CombatLog({
        round: combat.round,
        type: 'action',
        actorId: reactor.id,
        actorName: reactor.name,
        targetId: pending.attackerId,
        targetName: pending.attackerName,
        message: reaction.armed
            ? `**${reactor.name}** se prepara para reagir ao ataque de **${pending.attackerName}** com **${reaction.name}**.`
            : `**${reactor.name}** reagiu ao ataque de **${pending.attackerName}** com **${reaction.name}**${plan.cost > 0 ? ` gastando ${plan.cost} MP` : ''}.`
    }));

    return { ok: true, combat, reaction, warnings };
}

export interface SettleResult {
    warnings: string[];
}

/**
 * Liquida as reações do ataque na resolução: as armadas que se cumpriram pagam agora (se não der para pagar, a reação não vale e vira aviso), e as que dão um contra-ataque abrem
 * a oportunidade de contra-atacar quem atacou. Chamada pela rota `resolve_attack` antes de tirar o ataque da lista.
 */
export async function settleAttackReactions(combat: Combat, pending: PendingAttackData, outcome: ReactionOutcome): Promise<SettleResult> {
    const warnings: string[] = [];
    const settled = settleReactions(pending.reactions, outcome);
    if (settled.length === 0) return { warnings };

    const reactor = combat.combatants.find(candidate => candidate.id === pending.targetId);
    const attacker = combat.combatants.find(candidate => candidate.id === pending.attackerId);
    const now = new Date().toISOString();

    for (const { reaction, fires, mustPay } of settled) {
        if (!fires) {
            if (reaction.armed) {
                combat.logs.push(new CombatLog({
                    round: combat.round, type: 'action', actorId: pending.targetId, actorName: pending.targetName,
                    message: `${pending.targetName} não precisou de ${reaction.name}: a condição não se cumpriu e nada foi gasto.`
                }));
            }
            continue;
        }

        if (mustPay) {
            const def = findPassiveByKey(reaction.key);
            if (!reactor || !def?.activation) {
                warnings.push(`${reaction.name}: o personagem já não está no combate.`);
                continue;
            }
            const sheet = await adminGetDoc<SheetDoc>('charsheets', reactor.id);
            const currentMp = Number(sheet?.stats?.mp ?? reactor.currentMp ?? 0);
            const cost = def.activation.cost?.mp ?? 0;
            const owned = Boolean(sheet) && ownedPassives(sheet).some(passive => passive.key === reaction.key);
            if (!sheet || !owned || cost > currentMp) {
                const why = owned ? `${cost} MP e o personagem tem ${Math.max(0, Math.floor(currentMp))}` : 'a ficha já não tem a habilidade';
                warnings.push(`${reaction.name}: não deu para pagar o custo (${why}). A reação não vale.`);
                continue;
            }
            const charged = await chargeReaction(combat, reactor, def, cost, currentMp, false);
            if (!charged.ok) {
                warnings.push(`${charged.reason} A reação não vale.`);
                continue;
            }
            warnings.push(...charged.warnings);
            combat.logs.push(new CombatLog({
                round: combat.round, type: 'action', actorId: reactor.id, actorName: reactor.name,
                message: `**${reactor.name}** usou **${reaction.name}**${cost > 0 ? ` gastando ${cost} MP` : ''}.`
            }));
        }

        // Contra-ataque: a oportunidade de atacar quem atacou, com os bônus da habilidade
        const counter = counterOf(reaction);
        if (counter && reactor && attacker) {
            const opportunity: OpportunityData = {
                id: uuidv4(),
                moverId: attacker.id,
                moverName: attacker.name,
                reactorId: reactor.id,
                reactorName: reactor.name,
                counter,
                createdAt: now
            };
            combat.opportunities = addOpportunities(combat.opportunities, [ opportunity ]);
            combat.logs.push(new CombatLog({
                round: combat.round, type: 'action', actorId: reactor.id, actorName: reactor.name, targetId: attacker.id, targetName: attacker.name,
                message: `**${reactor.name}** ganhou um contra-ataque contra **${attacker.name}** (${reaction.name}).`
            }));
        }
    }
    return { warnings };
}

/**
 * O contra-ataque acertou: o efeito da habilidade (o estado de choque do Xeque-Mate) vai para o alvo dele. Chamada pela rota `resolve_attack` quando o ataque resolvido é um
 * contra-ataque (`pending.counter`) e o mestre confirmou o acerto.
 */
export function applyCounterOnHit(combat: Combat, pending: PendingAttackData): string | null {
    const counter = pending.counter;
    if (!counter?.onHit) return null;

    const def = findPassiveByKey(counter.abilityKey);
    const target = combat.combatants.find(candidate => candidate.id === pending.targetId);
    const source = combat.combatants.find(candidate => candidate.id === pending.attackerId);
    if (!def || !target || !source) return null;

    target.effects = (target.effects ?? []).filter(applied => !(applied.ability?.key === def.key && (applied.appliedById ?? source.id) === source.id));
    target.effects.push(buildAbilityEffect(def, counter.onHit, null, combat.round, source.name, source.id));
    return `**${target.name}** ficou sob **${def.name}**: ${counter.onHit.description}`;
}
