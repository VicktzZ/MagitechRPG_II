import { CombatLog, type Combat, type Combatant } from '@models';
import type { StatsEntry } from '@utils/campaignStatsHelper';
import { rollDice } from '@utils/diceRoller';
import { actionBlocks, blockReason, isBlocked } from '@utils/combat/actionFlags';
import { combatantBudget } from '@utils/combat/actionBudgets';
import { executionSlot, spendAction } from '@utils/combat/engine/actionBudget';
import { abilityStorageKey, describeAbilityUse, planAbility, buildAbilityEffect, ownedPassives, readAbilityDayUses, sheetFoc, type AbilityBlock, type AbilityEffect, type AbilityUseResult, type AbilityUses, type PassiveSheet } from '@utils/combat/passives';
import { endSustained } from '@utils/combat/sustainedEffect';
import { closeReactionsOf } from '@utils/combat/reactions';
import { sanitizeAreaTargets } from '@utils/combat/sides';
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
    /** Habilidade de área: quem foi atingido, como o jogador marcou (o servidor confere o lado e o combate; ver `sides.ts`) */
    targetIds?: unknown;
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

export async function runAbilityUse({ combat, combatant, abilityKey, choiceId, isGM, force, targetIds }: AbilityUseParams): Promise<AbilityUseOutcome> {
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
    // Habilidade de reação só se usa contra um ataque (`react_attack`), não pelo quadrado da seção Ações
    if (activation.reaction) return failure(400, `${def.name} é uma reação: use-a quando um ataque contra o personagem esperar o mestre.`, 'REACTION_ONLY');

    // Habilidade de área: quem foi atingido é o que o jogador marcou, conferido pelo lado e pelo combate (o app não mede distância). Sem área, só quem usa
    const warnings: string[] = [];
    let affected: Combatant[] = [ combatant ];
    if (activation.area) {
        const picked = sanitizeAreaTargets(combat.combatants, combatant.id, activation.area, targetIds);
        if (picked.ids.length === 0) {
            return failure(400, `${def.name}: marque quem foi atingido.`, 'AREA_TARGETS_REQUIRED');
        }
        affected = picked.ids.map(id => combat.combatants.find(candidate => candidate.id === id)).filter((candidate): candidate is Combatant => Boolean(candidate));
        for (const id of picked.dropped) {
            const name = combat.combatants.find(candidate => candidate.id === id)?.name;
            warnings.push(name ? `${name} não pode ser atingido por ${def.name} (lado errado ou passou do limite de alvos).` : 'Um dos alvos marcados não está mais no combate.');
        }
    }

    // Necrose, Incurável...: quem recebe a cura não a recebe. O mestre cura mesmo assim (`force`). Em área, quem tem o bloqueio fica sem a cura (aviso) e o resto recebe
    let healable = affected;
    if (activation.heal) {
        const forced = isGM && force;
        const blockedTargets = forced ? [] : affected.filter(target => isBlocked(actionBlocks(target.effects), 'no_healing'));
        if (!activation.area && blockedTargets.length > 0) {
            const blocks = actionBlocks(combatant.effects);
            return failure(409, `${blockReason(blocks, 'no_healing', combatant.name)}.${isGM ? '' : ' Peça ao mestre.'}`, 'HEALING_BLOCKED', { blockedBy: blocks.no_healing, canForce: isGM });
        }
        healable = affected.filter(target => !blockedTargets.includes(target));
        for (const target of blockedTargets) warnings.push(`${blockReason(actionBlocks(target.effects), 'no_healing', target.name)}: ele não recebeu a cura.`);
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

        // Cura: os dados são rolados aqui (o servidor decide), uma rolagem por alvo, e a vida sobe até o máximo de agora
        let heal: AbilityUseResult['heal'] = null;
        const heals: NonNullable<AbilityUseResult['heals']> = [];
        const healedBy = new Map<string, number>();
        if (activation.heal) {
            const foc = activation.heal.plusFoc ? sheetFoc(sheet) : 0;
            const notation = `${activation.heal.dice}${foc > 0 ? `+${foc}` : ''}`;

            for (const target of healable) {
                const rolled = rollDice(notation);
                if (!rolled || rolled.error) throw new Error(`Fórmula de cura inválida em ${def.name}: ${notation}`);

                const change = await healCombatant(combat, target.id, rolled.total);
                const applied = change ? Math.max(0, (change.target.currentLp ?? 0) - change.oldLp) : 0;
                const display = rolled.display ?? `[${rolled.rolls.join(', ')}]`;
                healedBy.set(target.id, applied);
                heals.push({ id: target.id, name: target.name, notation, display, total: rolled.total, applied });
                if (change) stats.push(...healStats(combatant, change));
            }
            // Habilidade de uma pessoa só: a cura é a dela (o cartão do chat); em área, cada alvo tem a sua em `heals`
            if (!activation.area && heals[0]) heal = { notation, display: heals[0].display, total: heals[0].total, applied: heals[0].applied };
        }

        // Efeito sobre cada alvo (quem usa, se não houver área); usar de novo a mesma habilidade troca o efeito anterior que o mesmo personagem pôs ali
        const effect: AbilityEffect | undefined = choice?.effect ?? activation.effect;
        if (effect) {
            // "Só um alvo de cada vez": o efeito que o mesmo personagem pôs antes sai de quem o tinha, seja quem for
            if (effect.exclusive) {
                for (const other of combat.combatants) {
                    other.effects = (other.effects ?? []).filter(applied => !(applied.ability?.key === def.key && (applied.appliedById ?? combatant.id) === combatant.id));
                }
            }
            for (const target of affected) {
                target.effects = (target.effects ?? []).filter(applied => !(applied.ability?.key === def.key && (applied.appliedById ?? combatant.id) === combatant.id));
                target.effects.push(buildAbilityEffect(def, effect, choice, combat.round, combatant.name, combatant.id));
            }
        }

        const targetNames = activation.area ? affected.map(target => target.name) : [];
        const message = describeAbilityUse({
            actor: combatant.name, ability: def.name, choice: choice?.label, cost, heal, effect,
            ...(activation.area ? { targets: targetNames, healed: [ ...healedBy ].map(([ id, applied ]) => ({ name: affected.find(target => target.id === id)?.name ?? id, applied })) } : {})
        });
        combat.logs.push(new CombatLog({
            round: combat.round,
            type: heal || heals.length > 0 ? 'heal' : effect ? 'effect_applied' : 'action',
            actorId: combatant.id,
            actorName: combatant.name,
            targetId: affected.length === 1 ? affected[0]!.id : combatant.id,
            targetName: affected.length === 1 ? affected[0]!.name : combatant.name,
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
                ...(activation.area ? { targets: affected.map(target => ({ id: target.id, name: target.name, ...(healedBy.has(target.id) ? { healed: healedBy.get(target.id) } : {}) })), heals } : {}),
                message
            }
        };
    } catch (error) {
        if (dayUseTaken) await refundAbilityDayUse(combatant.id, def.key).catch(() => undefined);
        throw error;
    }
}
