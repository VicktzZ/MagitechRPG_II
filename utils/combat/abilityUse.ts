import { CombatLog, type Combat, type Combatant } from '@models';
import type { StatsEntry } from '@utils/campaignStatsHelper';
import { rollDice } from '@utils/diceRoller';
import { actionBlocks, blockReason, isBlocked } from '@utils/combat/actionFlags';
import { combatantBudget } from '@utils/combat/actionBudgets';
import { executionSlot, spendAction } from '@utils/combat/engine/actionBudget';
import { abilityStorageKey, describeAbilityUse, planAbility, buildAbilityEffect, ownedPassives, readAbilityDayUses, sheetFoc, type AbilityBlock, type AbilityEffect, type AbilityUseResult, type AbilityUses, type PassiveSheet } from '@utils/combat/passives';
import { endSustained } from '@utils/combat/sustainedEffect';
import { closeReactionsOf } from '@utils/combat/reactions';
import { AbilityDayLimitReached, consumeAbilityDayUse, refundAbilityDayUse } from '@utils/firestore/abilityUses';
import { adminGetDoc } from '@utils/firestore/adminDocs';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';
import { healCombatant, healStats } from '@utils/firestore/combatDamage';

/**
 * O jogador usa uma habilidade ativada de classe ou subclasse (`use_ability`, na rota do combate): confere se a ficha a tem, os usos por dia (na ficha) e por combate
 * (no combatente) e o MP; gasta o MP e a ação, soma o uso, cura o próprio personagem ou põe o efeito dela sobre ele, e anuncia no log. Gastar a ação é aviso, nunca trava (o
 * mestre decide), como no resto do combate. O mestre pode liberar uma habilidade de usos esgotados (`force`).
 */

export interface AbilityUseParams {
    combat: Combat;
    combatant: Combatant;
    abilityKey: string;
    choiceId?: string | null;
    /** Quem pede é o mestre */
    isGM: boolean;
    /** O mestre libera os usos esgotados e a cura bloqueada */
    force: boolean;
}

export type AbilityUseOutcome =
    | { ok: true; result: AbilityUseResult; warnings: string[]; stats: StatsEntry[] }
    | { ok: false; status: number; body: { error: string; code: string; block?: AbilityBlock; canForce?: boolean; blockedBy?: unknown } };

const failure = (status: number, error: string, code: string, extra: Partial<Extract<AbilityUseOutcome, { ok: false }>['body']> = {}): AbilityUseOutcome =>
    ({ ok: false, status, body: { error, code, ...extra } });

/** A ficha como o Firestore a devolve: o que as passivas leem, mais o MP e os usos por dia */
interface SheetDoc extends PassiveSheet {
    abilityUses?: unknown;
    stats?: { lp?: unknown; maxLp?: unknown; mp?: unknown } | null;
}

export async function runAbilityUse({ combat, combatant, abilityKey, choiceId, isGM, force }: AbilityUseParams): Promise<AbilityUseOutcome> {
    const sheet = await adminGetDoc<SheetDoc>('charsheets', combatant.id);
    if (!sheet) return failure(404, 'Ficha não encontrada', 'SHEET_NOT_FOUND');

    const passives = ownedPassives(sheet);
    const currentMp = Number(sheet.stats?.mp ?? combatant.currentMp ?? 0);
    const uses: AbilityUses = { day: readAbilityDayUses(sheet), combat: combatant.abilityUses ?? {} };
    const plan = planAbility({ key: abilityKey, choiceId, currentMp, uses, owned: passives.some(passive => passive.key === abilityKey), ignoreLimits: isGM && force });

    if (!plan.ok || !plan.def?.activation) {
        const status = plan.block === 'sem-habilidade' ? 403 : plan.block === 'nao-ativada' ? 400 : 409;
        return failure(status, plan.reason ?? 'Não foi possível usar a habilidade', 'ABILITY_BLOCKED', { block: plan.block, canForce: isGM && plan.block === 'limite' });
    }

    const { def, cost, choice } = plan;
    const activation = def.activation!;

    // Necrose, Incurável...: quem recebe a cura (aqui, ele mesmo) não a recebe. O mestre cura mesmo assim (`force`)
    if (activation.heal) {
        const blocks = actionBlocks(combatant.effects);
        if (isBlocked(blocks, 'no_healing') && !(isGM && force)) {
            return failure(409, `${blockReason(blocks, 'no_healing', combatant.name)}.${isGM ? '' : ' Peça ao mestre.'}`, 'HEALING_BLOCKED', { blockedBy: blocks.no_healing, canForce: isGM });
        }
    }

    // O uso do dia é somado primeiro, numa transação (dois cliques seguidos não passam do limite); se algo falhar depois, ele é devolvido
    const dayLimit = (activation.limits ?? []).find(limit => limit.per === 'dia');
    let dayUseTaken = false;
    if (dayLimit) {
        try {
            await consumeAbilityDayUse(combatant.id, def.key, isGM && force ? Number.MAX_SAFE_INTEGER : dayLimit.max);
            dayUseTaken = true;
        } catch (error) {
            if (error instanceof AbilityDayLimitReached) {
                return failure(409, `${def.name}: acabaram os usos do dia.`, 'ABILITY_BLOCKED', { block: 'limite', canForce: isGM });
            }
            throw error;
        }
    }

    try {
        const warnings: string[] = [];
        const stats: StatsEntry[] = [];

        // MP: sai da ficha (a conta do MP é a da ficha); zerar o MP acaba com as magias sustentadas, como em qualquer gasto
        if (cost > 0) {
            await adjustCharsheetStats(combatant.id, { mp: -cost });
            combatant.currentMp = Math.max(0, currentMp - cost);
            if (combatant.currentMp <= 0) endSustained(combat, combatant.id);
        }

        // Ação da rodada: é aviso, nunca trava
        const spent = spendAction(combatantBudget(combatant), activation.execution);
        if (spent.ok) {
            combatant.actions = spent.budget;
            if (executionSlot(activation.execution) === 'reacao') combat.reactions = closeReactionsOf(combat.reactions, combatant.id);
        } else {
            warnings.push(`${combatant.name} já não tinha a ação ${activation.execution} disponível nesta rodada.`);
        }

        // O uso neste combate
        const storage = abilityStorageKey(def.key);
        combatant.abilityUses = { ...(combatant.abilityUses ?? {}), [storage]: (combatant.abilityUses?.[storage] ?? 0) + 1 };

        // Cura em si mesmo: os dados são rolados aqui (o servidor decide), e a vida sobe até o máximo de agora
        let heal: AbilityUseResult['heal'] = null;
        if (activation.heal) {
            const foc = activation.heal.plusFoc ? sheetFoc(sheet) : 0;
            const notation = `${activation.heal.dice}${foc > 0 ? `+${foc}` : ''}`;
            const rolled = rollDice(notation);
            if (!rolled || rolled.error) throw new Error(`Fórmula de cura inválida em ${def.name}: ${notation}`);

            const change = await healCombatant(combat, combatant.id, rolled.total);
            const applied = change ? Math.max(0, (change.target.currentLp ?? 0) - change.oldLp) : 0;
            heal = { notation, display: rolled.display ?? `[${rolled.rolls.join(', ')}]`, total: rolled.total, applied };
            if (change) stats.push(...healStats(combatant, change));
        }

        // Efeito sobre o personagem; usar de novo a mesma habilidade troca o efeito anterior
        const effect: AbilityEffect | undefined = choice?.effect ?? activation.effect;
        if (effect) {
            combatant.effects = (combatant.effects ?? []).filter(applied => applied.ability?.key !== def.key);
            combatant.effects.push(buildAbilityEffect(def, effect, choice, combat.round, combatant.name, combatant.id));
        }

        const message = describeAbilityUse({ actor: combatant.name, ability: def.name, choice: choice?.label, cost, heal, effect });
        combat.logs.push(new CombatLog({
            round: combat.round,
            type: heal ? 'heal' : effect ? 'effect_applied' : 'action',
            actorId: combatant.id,
            actorName: combatant.name,
            targetId: combatant.id,
            targetName: combatant.name,
            ...(heal ? { value: heal.applied } : {}),
            message
        }));

        return {
            ok: true,
            warnings,
            stats,
            result: {
                key: def.key,
                name: def.name,
                choice: choice?.label ?? null,
                cost,
                execution: activation.execution,
                heal,
                effect: effect ? { name: choice?.label ?? def.name, description: effect.description } : null,
                message
            }
        };
    } catch (error) {
        if (dayUseTaken) await refundAbilityDayUse(combatant.id, def.key).catch(() => undefined);
        throw error;
    }
}
