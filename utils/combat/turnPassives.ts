import type { Combat, Combatant } from '@models';
import { combatantBudget, MAX_ACTIONS_PER_SLOT } from '@utils/combat/actionBudgets';
import { ownedPassives, regenPlans, stealthGrants, type ActionGrant, type PassiveSheet } from '@utils/combat/passives';
import { hasStealthEffect } from '@utils/combat/stealth';
import { rollDice } from '@utils/diceRoller';
import { adminGetDoc } from '@utils/firestore/adminDocs';
import { healCombatant } from '@utils/firestore/combatDamage';

/**
 * O que as passivas de classe fazem no combate por conta própria, na hora certa: regenerar LP no começo do turno (Regeneração Furiosa) e dar ações extras a quem é furtivo
 * (Ligeireza no começo do turno, Disfarce ao entrar em furtividade). Devolve as frases que a rota junta ao anúncio da vez (o chat mostra só o último log, então o aviso vai
 * dentro dele). Erro aqui nunca derruba o turno: a passiva só deixa de valer.
 */

const joinLines = (lines: readonly string[]): string => (lines.length > 0 ? `\n${lines.join('\n')}` : '');

function addActions(combatant: Combatant, grants: readonly ActionGrant[]): string[] {
    const lines: string[] = [];
    for (const grant of grants) {
        const budget = combatantBudget(combatant);
        const next = {
            ...budget,
            padrao: Math.min(MAX_ACTIONS_PER_SLOT, budget.padrao + grant.padrao),
            movimento: Math.min(MAX_ACTIONS_PER_SLOT, budget.movimento + grant.movimento)
        };
        combatant.actions = next;
        const parts = [ grant.padrao > 0 ? `+${grant.padrao} ação Padrão` : '', grant.movimento > 0 ? `+${grant.movimento} ações de Movimento` : '' ].filter(Boolean);
        lines.push(`**${combatant.name}** está furtivo: ${grant.source} dá ${parts.join(' e ')}.`);
    }
    return lines;
}

/** O começo do turno do combatente: regenera LP e dá as ações extras da furtividade. Devolve as frases para o anúncio da vez (vazio se nada aconteceu) */
export async function applyTurnStartPassives(combat: Combat, combatant: Combatant | undefined): Promise<string> {
    if (!combatant || combatant.type !== 'player') return '';

    try {
        const sheet = await adminGetDoc<PassiveSheet>('charsheets', combatant.id);
        const passives = ownedPassives(sheet);
        if (passives.length === 0) return '';

        // O LP da ficha é o que vale (o do combatente pode estar velho)
        combatant.currentLp = Number(sheet?.stats?.lp ?? combatant.currentLp ?? 0);
        const context = { sheet, stealthy: hasStealthEffect(combatant.effects) };
        const lines: string[] = [];

        for (const plan of regenPlans(passives, context)) {
            const rolled = rollDice(plan.dice);
            if (!rolled || rolled.error) continue;
            const amount = Math.min(rolled.total, plan.room);
            if (amount <= 0) continue;
            const change = await healCombatant(combat, combatant.id, amount);
            const healed = change ? Math.max(0, (change.target.currentLp ?? 0) - change.oldLp) : 0;
            if (healed > 0) lines.push(`**${combatant.name}** regenerou **${healed} de LP** (${plan.source}).`);
            context.sheet = { ...sheet, stats: { ...sheet?.stats, lp: combatant.currentLp } };
        }

        lines.push(...addActions(combatant, stealthGrants(passives, 'turnStart', context)));
        return joinLines(lines);
    } catch (error) {
        console.error('[Combat API] Erro ao aplicar as passivas do começo do turno:', error);
        return '';
    }
}

/**
 * O combatente entrou em furtividade (o efeito Furtivo foi aplicado) no turno dele: Disfarce dá +1 ação Padrão. Só vale no turno de quem fica furtivo. Devolve a frase para
 * o log do efeito (vazia se nada aconteceu).
 */
export async function applyStealthEntryPassives(combat: Combat, combatant: Combatant): Promise<string> {
    if (combatant.type !== 'player' || combat.phase !== 'ACTION' || combat.combatants[combat.currentTurnIndex]?.id !== combatant.id) return '';

    try {
        const sheet = await adminGetDoc<PassiveSheet>('charsheets', combatant.id);
        const lines = addActions(combatant, stealthGrants(ownedPassives(sheet), 'enter', { sheet, stealthy: true }));
        return joinLines(lines);
    } catch (error) {
        console.error('[Combat API] Erro ao aplicar as passivas da furtividade:', error);
        return '';
    }
}
