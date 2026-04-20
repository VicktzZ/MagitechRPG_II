import type { Combat, Combatant, AppliedEffect, CombatEffectLevel } from '@models'
import { CombatLog } from '@models'
import { charsheetRepository } from '@repositories'
import { rollDice } from '@utils/diceRoller'
import { getEffectDisplayName } from '@utils/combatEffectLabels'

export type TickTrigger =
    | {
        type: 'turn_advance'
        newCombatantId: string
        previousCombatantId?: string
    }
    | {
        type: 'effect_applied'
        combatantId: string
        appliedEffectId: string
    }

export interface TickOutcome {
    combatantId: string
    combatantName: string
    appliedEffectId: string
    category: 'damage' | 'heal' | 'info'
    rolled: number
    rollDisplay: string
    expired: boolean
}

export interface ProcessTicksResult {
    outcomes: TickOutcome[]
    charsheetsToSync: Set<string>
}

function shouldTick(
    applied: AppliedEffect,
    combatant: Combatant,
    trigger: TickTrigger
): boolean {
    // Efeitos indefinidos continuam ticando (para aplicar dano/cura por tick),
    // só não expiram. Se não for indefinido e remaining esgotou, pula.
    if (!applied.indefinite && applied.remaining <= 0) return false

    if (trigger.type === 'effect_applied') {
        if (trigger.combatantId !== combatant.id) return false
        return applied.id === trigger.appliedEffectId
    }

    const timing = applied.snapshot?.timing ?? 'turn'

    if (timing === 'turn') return true

    if (timing === 'round') {
        return trigger.newCombatantId === combatant.id
    }

    return false
}

function formatRollDisplay(formula: string, total: number, display?: string): string {
    if (display) return `${display} = ${total}`
    return `${formula} = ${total}`
}

function buildTickMessage(
    combatant: Combatant,
    applied: AppliedEffect,
    rolled: number,
    rollText: string
): string {
    const effect = applied.snapshot
    const fullName = getEffectDisplayName(effect, applied.level)

    let remainingTxt: string
    if (applied.indefinite) {
        remainingTxt = ' · ∞ (indefinido)'
    } else {
        const remaining = Math.max(0, applied.remaining - 1)
        remainingTxt = remaining > 0
            ? ` · ${remaining} ${effect.timing === 'turn' ? 'turno(s)' : 'rodada(s)'} restante(s)`
            : ' · efeito expirado'
    }

    if (effect.category === 'damage') {
        return `${effect.icon} **${combatant.name}** sofreu ${rolled} de dano por **${fullName}** (${rollText})${remainingTxt}`
    }
    if (effect.category === 'heal') {
        return `${effect.icon} **${combatant.name}** recuperou ${rolled} pontos por **${fullName}** (${rollText})${remainingTxt}`
    }
    return `${effect.icon} **${combatant.name}** continua sob efeito de **${fullName}**${remainingTxt}`
}

function applyValueToCombatant(
    combatant: Combatant,
    applied: AppliedEffect,
    rolled: number
): void {
    const category = applied.snapshot.category

    if (category === 'damage') {
        const lp = typeof combatant.currentLp === 'number' ? combatant.currentLp : 0
        combatant.currentLp = Math.max(0, lp - rolled)
        return
    }

    if (category === 'heal') {
        const lp = typeof combatant.currentLp === 'number' ? combatant.currentLp : 0
        const maxLp = typeof combatant.maxLp === 'number' && combatant.maxLp > 0 ? combatant.maxLp : Number.MAX_SAFE_INTEGER
        combatant.currentLp = Math.min(maxLp, lp + rolled)
    }
}

/**
 * Processa ticks de efeitos em TODOS os combatentes do combate.
 *
 * Regras (acordadas no plano):
 *  - `timing='turn'`  -> tick a cada turn_advance (qualquer novo combatente entrar no turno atual)
 *  - `timing='round'` -> tick somente quando o próprio combatente afetado inicia seu turno novamente
 *  - `trigger.type='effect_applied'` é usado para disparar o tick inicial imediato de efeitos turn ao aplicar
 *
 * Mutação direta em `combat.combatants[*].effects`, `.currentLp` e `combat.logs`.
 * Retorna a lista de outcomes + a lista de charsheetIds que precisam ser sincronizados.
 */
export function processEffectTicks(combat: Combat, trigger: TickTrigger): ProcessTicksResult {
    const outcomes: TickOutcome[] = []
    const charsheetsToSync = new Set<string>()

    if (!combat?.combatants?.length) {
        return { outcomes, charsheetsToSync }
    }

    for (const combatant of combat.combatants) {
        if (!Array.isArray(combatant.effects) || combatant.effects.length === 0) continue

        for (const applied of combatant.effects) {
            if (!applied?.snapshot) continue
            if (!shouldTick(applied, combatant, trigger)) continue

            const levels = applied.snapshot.levels || []
            const levelConfig: CombatEffectLevel | undefined = levels[applied.level - 1]

            let rolled = 0
            let rollText = '0'

            if (levelConfig?.formula) {
                const result = rollDice(String(levelConfig.formula))
                if (result && !result.error) {
                    rolled = Math.max(0, Math.floor(result.total))
                    rollText = formatRollDisplay(levelConfig.formula, rolled, result.display)
                } else {
                    rollText = `${levelConfig.formula} (erro ao rolar)`
                }
            }

            applyValueToCombatant(combatant, applied, rolled)

            // Efeitos indefinidos não decrementam remaining — só param ao serem removidos manualmente.
            if (!applied.indefinite) {
                applied.remaining = Math.max(0, applied.remaining - 1)
            }
            applied.lastTickAtRound = combat.round
            applied.lastTickAtTurnIndex = combat.currentTurnIndex

            const message = buildTickMessage(combatant, applied, rolled, rollText)

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'effect_tick',
                actorId: 'effect-system',
                actorName: applied.snapshot.name,
                targetId: combatant.id,
                targetName: combatant.name,
                value: rolled,
                message
            }))

            if (combatant.type === 'player' && applied.snapshot.category !== 'info') {
                charsheetsToSync.add(combatant.id)
            }

            outcomes.push({
                combatantId: combatant.id,
                combatantName: combatant.name,
                appliedEffectId: applied.id,
                category: applied.snapshot.category,
                rolled,
                rollDisplay: rollText,
                expired: !applied.indefinite && applied.remaining <= 0
            })
        }

        const expired = combatant.effects.filter(e => !e.indefinite && e.remaining <= 0)
        if (expired.length > 0) {
            for (const exp of expired) {
                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'effect_expired',
                    actorId: 'effect-system',
                    actorName: exp.snapshot?.name || 'Efeito',
                    targetId: combatant.id,
                    targetName: combatant.name,
                    message: `⏳ Efeito **${getEffectDisplayName(exp.snapshot, exp.level)}** expirou em **${combatant.name}**.`
                }))
            }
            combatant.effects = combatant.effects.filter(e => e.indefinite || e.remaining > 0)
        }
    }

    return { outcomes, charsheetsToSync }
}

/**
 * Sincroniza as LPs atualizadas dos combatentes (tipo player) de volta no charsheet real,
 * para que o LP persista fora do combate também.
 */
export async function syncPlayerCharsheets(combat: Combat, charsheetIds: Iterable<string>): Promise<void> {
    for (const id of charsheetIds) {
        const combatant = combat.combatants.find(c => c.id === id)
        if (!combatant || combatant.type !== 'player') continue

        try {
            const charsheet = await charsheetRepository.findById(id)
            if (!charsheet) continue

            await charsheetRepository.update({
                ...charsheet,
                stats: {
                    ...charsheet.stats,
                    lp: combatant.currentLp ?? charsheet.stats?.lp ?? 0
                }
            })
        } catch (error) {
            console.error('[processEffectTicks] Erro ao sincronizar charsheet:', id, error)
        }
    }
}
