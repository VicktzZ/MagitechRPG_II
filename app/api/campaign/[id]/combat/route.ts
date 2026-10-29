import { type NextRequest, NextResponse } from 'next/server'
import { charsheetRepository, combatEffectRepository } from '@repositories'
import { adminUpdateDoc } from '@utils/firestore/adminDocs'
import { Combat, Combatant, CombatLog, AppliedEffect, Message, type Creature } from '@models'
import { triggerPusher } from '@utils/pusher'
import { PusherEvent } from '@enums'
import { processEffectTicks, refreshPlayerCombatantsLp, syncPlayerCharsheets } from '@utils/combat/processEffectTicks'
import { getEffectDisplayName } from '@utils/combatEffectLabels'
import { v4 as uuidv4 } from 'uuid'
import { stripUndefined } from '@utils/firestore/stripUndefined'
import { appendCampaignMessage } from '@utils/firestore/campaignMessages'
import { recordCampaignStats, type StatsEntry } from '@utils/campaignStatsHelper'
import { badRequest, findCampaignOrThrow, forbidden, handleRouteError, readJsonBody, requireCampaignMember, requireUser } from '@utils/api'
import { acquireCombatLock, type CombatLock } from '@utils/firestore/combatLock'
import { evaluateMpSpend, getCreatureMpLimit, getMpLimit, isCreatureMpLimitEnforced, isMpLimitEnforced } from '@utils/mpLimit'
import { combatantVitals } from '@utils/combatantVitals'
import { insertCombatant, nextCreatureInstance } from '@utils/combat/addCombatants'
import {
    addReactions, closeReactionsOf, dropReactionsFor, planOpenReaction, reactionsAfterAttack, removeReaction, sanitizeReactionReactorIds, sanitizeReactionText, sanitizeTrigger
} from '@utils/combat/reactions'
import {
    LIGHT_LABEL, LIGHT_RULE, defaultEnvironment, dropTerrainFor, readEnvironment, sanitizeLight, sanitizeTerrainIds, setTerrain
} from '@utils/combat/environment'
import {
    creatureInitiativeDice, describeInitiativeEffects, describeInitiativeRolls, initiativeWithEffects, playerInitiativeDice, resolveInitiative, type InitiativeDice
} from '@utils/combat/initiativeRoll'
import { resetRoundWindows } from '@utils/combat/roundWindow'
import { actionBlocks, blockReason, isBlocked } from '@utils/combat/actionFlags'
import { applyBudgetPatch, combatantBudget, describeBudget } from '@utils/combat/actionBudgets'
import { executionSlot, spendAction } from '@utils/combat/engine/actionBudget'
import { sustainedUpkeepFor } from '@utils/combat/sustainedSpells'
import { applySustainedUpkeep, endSustained, startSustained } from '@utils/combat/sustainedUpkeep'
import { findBaseCreature } from '@utils/combatCreatureLookup'
import { damageCombatant, damageStats, healCombatant, healStats } from '@utils/firestore/combatDamage'
import {
    addPendingAttacks, buildAttackLogMessage, dropPendingFor, removePendingAttack, sanitizeAttackDeclaration, sanitizeDefenseDeclaration, sanitizeExplainLines, sanitizeTargetIds, setPendingDamage,
    setPendingDefense, MAX_ATTACK_TARGETS
} from '@utils/combat/pendingAttacks'
import { addUnseen, dropUnseenFor, planHide, revealUnseen, sanitizeHiddenCause, sanitizeObserverIds } from '@utils/combat/awareness'
import { addOpportunities, dropOpportunitiesFor, findOpportunity, planLeaveReach, removeOpportunity, sanitizeReactorIds } from '@utils/combat/opportunities'
import { diffSheetVitals, diffSnapshots, snapshotCombat, summarizeChanges, type CombatSnapshot, type SheetVitals } from '@utils/combat/history'
import { deleteCombatEvents, getCombatEvent, isCombatEventId, markCombatEventUndone, readPlayerVitals, recordCombatEvent } from '@utils/firestore/combatEvents'
import { undoCombatEvent } from '@utils/firestore/combatUndo'

/** Ações que conduzem o combate — exclusivas do mestre */
const GM_ONLY_ACTIONS: CombatAction[] = [
    'start', 'end', 'set_initiative', 'add_creature', 'add_combatants', 'remove_combatant', 'apply_effect', 'remove_effect',
    'set_mp_limit_override', 'reset_mp_limit', 'set_mp_spent', 'set_actions', 'undo', 'resolve_attack', 'set_unseen', 'reveal_unseen', 'set_light', 'set_terrain', 'open_reaction'
]

/** Ações que entram no histórico do combate (o mestre pode desfazê-las): as que mudam o rumo da luta, não o controle de MP e de ações */
const RECORDED_ACTIONS: CombatAction[] = [
    'next_turn', 'apply_damage', 'apply_heal', 'apply_effect', 'remove_effect', 'add_creature', 'add_combatants', 'remove_combatant', 'set_initiative', 'end', 'resolve_attack'
]

/** Dessas, as que também mexem na vida e na mana das fichas dos jogadores (o histórico guarda o antes e o depois delas) */
const SHEET_ACTIONS: CombatAction[] = [ 'next_turn', 'apply_damage', 'apply_heal', 'apply_effect', 'resolve_attack' ]

/** Ações de jogador que só valem no turno do próprio personagem */
const OWN_TURN_ACTIONS: CombatAction[] = [ 'next_turn', 'apply_damage', 'apply_heal' ]

const KNOWN_ACTIONS: CombatAction[] = [
    ...GM_ONLY_ACTIONS, ...OWN_TURN_ACTIONS, 'roll_initiative', 'spend_mp', 'spend_action', 'sustain_start', 'sustain_end', 'declare_attack', 'attack_damage', 'dismiss_attack', 'declare_defense',
    'declare_leave', 'dismiss_opportunity', 'dismiss_reaction'
]

type CombatAction = 
    | 'start'           // Iniciar combate
    | 'end'             // Encerrar combate
    | 'roll_initiative' // Rolar iniciativa para um combatente
    | 'set_initiative'  // Definir ordem de iniciativa (após todos rolarem)
    | 'next_turn'       // Passar para o próximo turno
    | 'apply_damage'    // Aplicar dano a um alvo
    | 'apply_heal'      // Aplicar cura a um alvo
    | 'add_creature'    // Adicionar criatura ao combate (dados vindos do cliente)
    | 'add_combatants'  // Adicionar jogadores e criaturas da campanha a um combate em andamento
    | 'remove_combatant' // Remover combatente
    | 'apply_effect'    // Aplicar efeito de pipeline a um combatente
    | 'remove_effect'   // Remover efeito de pipeline de um combatente
    | 'spend_mp'        // Registrar MP gasto em magia (valida o limite por turno; valor negativo estorna)
    | 'set_mp_limit_override' // Mestre libera/restabelece o limite de MP por turno de um jogador
    | 'reset_mp_limit'  // Mestre zera o MP gasto na rodada de um jogador ou criatura
    | 'set_mp_spent'    // Mestre define exatamente o MP gasto na rodada (de 0 até o limite, que não muda)
    | 'spend_action'    // Gasta uma ação da rodada (Padrão, Bônus, Movimento, Reação ou Completa); o jogador só gasta as do próprio personagem
    | 'set_actions'     // Mestre ajusta as ações que restam a um combatente (devolver uma ação, dar extras)
    | 'sustain_start'   // Jogador conjurou com sucesso uma magia sustentada em combate: ela vira um efeito sobre ele
    | 'sustain_end'     // Desconjurar uma magia sustentada (ou todas, sem spellKey)
    | 'undo'            // Mestre desfaz um evento do histórico do combate (devolve só os campos que ele mudou)
    | 'declare_attack'  // Ataque assistido: o jogador (ou o mestre) declara um ataque com alvo; fica pendente até o mestre resolver
    | 'attack_damage'   // O dano rolado se junta ao ataque pendente
    | 'dismiss_attack'  // Descarta um ataque pendente (quem atacou ou o mestre)
    | 'declare_defense' // O jogador atacado escolhe e rola a própria defesa (esquiva, resistência ou nenhuma); o mestre parte dela ao resolver
    | 'declare_leave'   // Quem sai do alcance corpo a corpo de inimigos declara a saída: cada inimigo ganha uma oportunidade de ataque
    | 'dismiss_opportunity' // Dispensa uma oportunidade aberta (o inimigo que ia reagir, quem se moveu ou o mestre)
    | 'resolve_attack'  // Mestre confirma o ataque: aplica o dano, gasta a Reação de quem esquivou e registra no log
    | 'set_unseen'      // Mestre marca quem não vê um combatente escondido (furtivo, invisível...): matriz de percepção
    | 'reveal_unseen'   // Mestre revela o combatente escondido a alguns observadores, ou a todos
    | 'set_light'       // Mestre define a iluminação da cena (claro, penumbra ou escuridão): ambiente manual
    | 'set_terrain'     // Mestre marca (ou desmarca) combatentes em terreno difícil: ambiente manual
    | 'open_reaction'   // Mestre abre uma reação: o que aconteceu e quem pode reagir (cada reator com a Reação disponível ganha uma oferta)
    | 'dismiss_reaction' // Dispensa uma oferta de reação (quem ia reagir ou o mestre)

interface CombatRequest {
    action: CombatAction
    combatantId?: string       // ID do combatente que está agindo
    targetId?: string          // ID do alvo (para dano/cura)
    /** Para declare_attack: outros alvos do mesmo ataque (ataque em área); cada alvo ganha o seu ataque pendente */
    targetIds?: unknown
    value?: number             // Valor (dano, cura, resultado de dado)
    players?: Array<{          // Jogadores para iniciar combate
        odacId: string
        charsheetId: string
        name: string
        agility: number
        dexterity: number // DES para desempate
        avatar?: string
        lp: number
        maxLp: number
        mp?: number
        maxMp?: number
    }>
    creatures?: Array<{        // Criaturas para adicionar ao combate
        id: string
        name: string
        agility: number
        dexterity?: number
        lp: number
        maxLp: number
        mp?: number
        maxMp?: number
    }>
    /** Para add_combatants: quem entra no combate em andamento (os dados vêm da campanha e das fichas, não do cliente) */
    join?: {
        players?: Array<{ charsheetId: string; avatar?: string }>
        creatures?: Array<{ id: string; quantity?: number }>
    }
    showEnemyLp?: boolean     // Se mostra LP dos inimigos para jogadores
    advantageType?: 'normal' | 'advantage' | 'disadvantage' // Para rolagem de iniciativa

    // Para apply_effect / remove_effect
    effectId?: string
    level?: number
    appliedEffectId?: string
    appliedByName?: string
    appliedById?: string
    /** Sobrescreve o timing do efeito ao aplicar (sem mudar o catálogo) */
    timingOverride?: 'turn' | 'round'
    /** Sobrescreve a duração do efeito ao aplicar (sem mudar o catálogo) */
    durationOverride?: number
    /** Aplica o efeito como indefinido (só expira ao ser removido manualmente) */
    indefiniteOverride?: boolean

    /** Para set_mp_limit_override: true libera o limite, false restabelece */
    enabled?: boolean

    /** Para spend_action: a execução que gasta a ação ("Padrão", "Bônus"/"Livre", "Movimento", "Reação", "Completa") */
    execution?: string
    /** Para set_actions: as ações que restam, por espaço ({ padrao: 0, bonus: 1, movimento: 1, reacao: 1 }); só os espaços informados mudam */
    actions?: Record<string, number>

    /** Para sustain_start / sustain_end: a magia sustentada (id ou nome), o estágio conjurado e o custo total de MP dele */
    spellKey?: string
    spellName?: string
    stage?: number
    cost?: number

    /** Para declare_attack: o ataque (arma/magia, natureza, tipo, total do acerto, d20 e bônus); o servidor limpa (`sanitizeAttackDeclaration`) */
    attack?: unknown
    /** Para attack_damage, dismiss_attack, declare_defense e resolve_attack: o ataque pendente */
    attackId?: string
    /** Para declare_defense: a escolha e o teste rolado; o servidor limpa (`sanitizeDefenseDeclaration`) */
    defense?: unknown
    /** Para declare_leave: quem estava ao alcance corpo a corpo e pode reagir (`combatantId` é quem saiu); para open_reaction: quem pode reagir */
    reactorIds?: unknown
    /** Para open_reaction: o que disparou a reação ("attacked", "hit", "miss", "critical", "damaged", "downed", "cast", "status", "moved" ou "other"), quem sofreu ou fez
     *  (`subjectId`, dispensável no "other") e um detalhe em texto */
    trigger?: unknown
    subjectId?: string
    text?: unknown
    /** Para dismiss_reaction: a oferta aberta */
    reactionId?: string
    /** Para set_light: a iluminação da cena ("claro", "penumbra" ou "escuridao") */
    light?: unknown
    /** Para set_terrain: os combatentes marcados e se estão (true) ou saíram (false) do terreno difícil */
    combatantIds?: unknown
    difficult?: unknown
    /** Para set_unseen e reveal_unseen: quem não vê o combatente (`combatantId` é quem está escondido). Em reveal_unseen, sem a lista revela a todos */
    observerIds?: unknown
    /** Para set_unseen: por que ele não é visto ("furtivo", "invisivel" ou "outro") */
    cause?: unknown
    /** Para dismiss_opportunity e declare_attack (ataque de oportunidade): a oportunidade aberta */
    opportunityId?: string
    /** Para attack_damage: o dano foi crítico */
    critical?: boolean
    /** Para resolve_attack: acertou, o dano final (o mestre pode trocar o que o motor propôs), se o alvo gastou a Reação esquivando e as linhas públicas do cálculo */
    hit?: boolean
    damage?: number
    reactionSpent?: boolean
    lines?: unknown

    /** Para undo: o evento do histórico a desfazer; `force` desfaz mesmo que algum campo tenha mudado de novo depois (sobrescreve) */
    eventId?: string
    force?: boolean
}

/** Máximo de jogadores (e de criaturas diferentes) por chamada, e de cópias de uma criatura, ao entrar num combate em andamento */
const MAX_JOIN_ENTRIES = 20
const MAX_CREATURE_COPIES = 99

interface Newcomer {
    combatant: Combatant
    dice: InitiativeDice
}

/**
 * Põe quem chegou no combate em andamento e registra no log. Na fase de ação a ordem já está definida, então cada um rola a
 * iniciativa na hora e entra no lugar dela (ver `insertCombatant`); na fase de iniciativa entra pendente e rola como os outros.
 */
function joinCombat(combat: Combat, newcomers: Newcomer[]): void {
    for (const { combatant, dice } of newcomers) {
        if (combat.phase === 'ACTION') {
            const { rolls, roll, total } = resolveInitiative(dice)
            combatant.initiativeBonus = dice.expertiseValue
            combatant.initiativeRoll = roll
            combatant.initiativeTotal = total
            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'initiative',
                actorId: combatant.id,
                actorName: combatant.name,
                value: total,
                message: `🎲 **${combatant.name}** rolou iniciativa: ${dice.numDice}d20 (${describeInitiativeRolls({ rolls, roll })}) + ${dice.expertiseValue} AGI = **${total}**`
            }))
        }

        const { index, afterCurrent } = insertCombatant(combat, combatant)
        const where = combat.phase !== 'ACTION'
            ? 'e precisa rolar a iniciativa.'
            : afterCurrent
                ? `e age logo depois de **${combat.combatants[combat.currentTurnIndex]?.name ?? 'quem está agindo'}**.`
                : `e age na posição ${index + 1} da ordem.`

        combat.logs.push(new CombatLog({
            round: combat.round,
            type: 'action',
            actorId: 'system',
            actorName: 'Sistema',
            message: `➕ **${combatant.name}** entrou no combate ${where}`
        }))
    }
}

function getActionMessage(action: CombatAction): string {
    const messages: Record<CombatAction, string> = {
        start: 'Combate iniciado',
        end: 'Combate encerrado',
        roll_initiative: 'Iniciativa rolada',
        set_initiative: 'Ordem de iniciativa definida',
        next_turn: 'Turno passado',
        apply_damage: 'Dano aplicado',
        apply_heal: 'Cura aplicada',
        add_creature: 'Criatura adicionada',
        add_combatants: 'Combatentes adicionados',
        remove_combatant: 'Combatente removido',
        apply_effect: 'Efeito aplicado',
        remove_effect: 'Efeito removido',
        spend_mp: 'MP registrado',
        set_mp_limit_override: 'Limite de MP atualizado',
        reset_mp_limit: 'Limite de MP resetado',
        set_mp_spent: 'MP gasto definido',
        spend_action: 'Ação gasta',
        set_actions: 'Ações ajustadas',
        sustain_start: 'Magia sustentada ativa',
        sustain_end: 'Magia sustentada encerrada',
        undo: 'Evento desfeito',
        declare_attack: 'Ataque declarado',
        attack_damage: 'Dano do ataque registrado',
        dismiss_attack: 'Ataque descartado',
        declare_defense: 'Defesa declarada',
        declare_leave: 'Saída de alcance declarada',
        dismiss_opportunity: 'Oportunidade dispensada',
        resolve_attack: 'Ataque resolvido',
        set_unseen: 'Percepção atualizada',
        reveal_unseen: 'Escondido revelado',
        set_light: 'Iluminação atualizada',
        set_terrain: 'Terreno atualizado',
        open_reaction: 'Reação aberta',
        dismiss_reaction: 'Reação dispensada'
    }
    return messages[action] || 'Ação executada'
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Uma ação de combate por vez em cada campanha (utils/firestore/combatLock.ts); solta no `finally`
    let lock: CombatLock | null = null

    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign, isGM } = await requireCampaignMember(id, user)

        const body: CombatRequest = await readJsonBody(request)
        const { action } = body

        if (!KNOWN_ACTIONS.includes(action)) {
            throw badRequest('Ação de combate desconhecida')
        }
        if (body.value !== undefined && (typeof body.value !== 'number' || !Number.isFinite(body.value) || Math.abs(body.value) > 100_000)) {
            throw badRequest('Valor inválido')
        }
        if (!isGM && GM_ONLY_ACTIONS.includes(action)) {
            throw forbidden('Apenas o mestre pode fazer isso no combate')
        }

        // A vez desta ação: sem a trava, duas ações quase juntas leem o mesmo combate e a última a gravar apaga a outra. O que foi lido
        // antes de pegar a trava pode estar velho, então a campanha é relida com a trava na mão.
        lock = await acquireCombatLock(campaign.id)
        Object.assign(campaign, await findCampaignOrThrow(campaign.id))

        if (campaign.status === 'finished') {
            return NextResponse.json({ error: 'Campanha finalizada — ações de combate bloqueadas' }, { status: 403 })
        }

        // Eventos de estatística acumulados durante a ação
        const statsEntries: StatsEntry[] = []
        // Avisos que não impedem a ação (ex: jogador que já estava no combate), devolvidos ao cliente
        const warnings: string[] = []

        // Inicializa combat se não existir
        if (!campaign.session) {
            campaign.session = { users: [], messages: [] } as any
        }
        if (!campaign.session.combat) {
            campaign.session.combat = new Combat()
        }

        const combat = campaign.session.combat

        if (!isGM) {
            // Combatente de jogador pertence ao usuário se a ficha dele está na campanha
            const ownsCombatant = (c?: Combatant) => Boolean(c && c.type === 'player' && (
                c.odacId === user.id ||
                campaign.players?.some(p => p.userId === user.id && p.charsheetId === c.id)
            ))

            if (action === 'roll_initiative') {
                const target = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (target && !ownsCombatant(target)) {
                    throw forbidden('Você só pode rolar a iniciativa do seu personagem')
                }
            }

            if (action === 'spend_mp') {
                const target = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (target && !ownsCombatant(target)) {
                    throw forbidden('Você só pode gastar MP do seu personagem')
                }
            }

            if (action === 'spend_action') {
                const target = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (target && !ownsCombatant(target)) {
                    throw forbidden('Você só pode gastar ações do seu personagem')
                }
            }

            if (action === 'declare_attack') {
                const attacker = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (!attacker || !ownsCombatant(attacker)) {
                    throw forbidden('Você só pode atacar com o seu personagem')
                }
            }

            if (action === 'attack_damage' || action === 'dismiss_attack') {
                const pending = combat.pendingAttacks?.find(entry => entry.id === body.attackId)
                const attacker = pending && combat.combatants?.find(c => c.id === pending.attackerId)
                if (pending && !ownsCombatant(attacker)) {
                    throw forbidden('Esse ataque não é do seu personagem')
                }
            }

            if (action === 'declare_defense') {
                const pending = combat.pendingAttacks?.find(entry => entry.id === body.attackId)
                const defender = pending && combat.combatants?.find(c => c.id === pending.targetId)
                if (pending && !ownsCombatant(defender)) {
                    throw forbidden('Você só pode se defender dos ataques ao seu personagem')
                }
            }

            if (action === 'declare_leave') {
                const mover = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (!mover || !ownsCombatant(mover)) {
                    throw forbidden('Você só pode declarar a saída do seu personagem')
                }
            }

            if (action === 'dismiss_opportunity') {
                const opportunity = combat.opportunities?.find(entry => entry.id === body.opportunityId)
                const mover = opportunity && combat.combatants?.find(c => c.id === opportunity.moverId)
                const reactor = opportunity && combat.combatants?.find(c => c.id === opportunity.reactorId)
                if (opportunity && !ownsCombatant(mover) && !ownsCombatant(reactor)) {
                    throw forbidden('Essa oportunidade não é do seu personagem')
                }
            }

            if (action === 'dismiss_reaction') {
                const reaction = combat.reactions?.find(entry => entry.id === body.reactionId)
                const reactor = reaction && combat.combatants?.find(c => c.id === reaction.reactorId)
                if (reaction && !ownsCombatant(reactor)) {
                    throw forbidden('Essa reação não é do seu personagem')
                }
            }

            if (action === 'sustain_start' || action === 'sustain_end') {
                const target = combat.combatants?.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
                if (target && !ownsCombatant(target)) {
                    throw forbidden('Você só pode mexer nas magias sustentadas do seu personagem')
                }
            }

            if (OWN_TURN_ACTIONS.includes(action) && !ownsCombatant(combat.combatants?.[combat.currentTurnIndex])) {
                throw forbidden('Não é o turno do seu personagem')
            }
        }

        // Ações que alteram LP partem do LP atual das fichas, não do snapshot do início do combate
        if (combat.isActive && [ 'next_turn', 'apply_damage', 'apply_heal', 'apply_effect', 'resolve_attack' ].includes(action)) {
            await refreshPlayerCombatantsLp(combat)
        }

        const logsBefore = combat.logs?.length ?? 0

        // Histórico: a foto de antes (depois de sincronizar a vida das fichas, que não é obra do evento) e a vida e mana das fichas
        const recording = RECORDED_ACTIONS.includes(action) && combat.isActive
        let snapshotBefore: CombatSnapshot | null = null
        let sheetsBefore: SheetVitals | null = null
        if (recording) {
            snapshotBefore = snapshotCombat(combat)
            sheetsBefore = SHEET_ACTIONS.includes(action) ? await readPlayerVitals(combat) : null
        }
        // Evento desfeito por esta ação (marcado só depois de o combate ser salvo)
        let undoneEventId: string | null = null

        switch (action) {
        case 'start': {
            if (combat.isActive) {
                return NextResponse.json({ error: 'Já existe um combate ativo' }, { status: 400 })
            }

            const { players = [], creatures = [] } = body

            // Cria combatentes a partir dos jogadores
            const playerCombatants: Combatant[] = players.map(p => new Combatant({
                id: p.charsheetId,
                name: p.name,
                type: 'player',
                odacId: p.odacId,
                avatar: p.avatar,
                initiativeBonus: p.agility || 0,
                dexterity: p.dexterity || 0,
                currentLp: p.lp,
                maxLp: p.maxLp,
                currentMp: p.mp,
                maxMp: p.maxMp,
                effects: []
            }))

            // Cria combatentes a partir das criaturas
            const creatureCombatants: Combatant[] = creatures.map(c => new Combatant({
                id: c.id,
                name: c.name,
                type: 'creature',
                initiativeBonus: c.agility || 0,
                dexterity: c.dexterity || 0,
                currentLp: c.lp,
                maxLp: c.maxLp,
                currentMp: c.mp,
                maxMp: c.maxMp,
                effects: []
            }))

            combat.isActive = true
            combat.phase = 'INITIATIVE'
            combat.round = 1
            combat.currentTurnIndex = 0
            combat.combatants = [ ...playerCombatants, ...creatureCombatants ]
            combat.logs = []
            combat.pendingAttacks = []
            combat.opportunities = []
            combat.unseen = []
            combat.reactions = []
            combat.environment = defaultEnvironment()
            combat.startedAt = new Date().toISOString()
            combat.showEnemyLp = body.showEnemyLp ?? false

            // Log de início
            combat.logs.push(new CombatLog({
                round: 1,
                type: 'phase_change',
                actorId: 'system',
                actorName: 'Sistema',
                message: `⚔️ **Combate iniciado!**\nRound 1 — Fase de Iniciativa\n${combat.combatants.length} combatentes participando.`
            }))

            statsEntries.push({ gm: true, inc: { combatsStarted: 1 } })

            break
        }

        case 'end': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            combat.isActive = false
            combat.phase = 'ENDED'
            combat.endedAt = new Date().toISOString()

            // Limpa efeitos ativos ao encerrar combate
            for (const c of combat.combatants) {
                if (Array.isArray(c.effects) && c.effects.length > 0) {
                    c.effects = []
                }
            }
            resetRoundWindows(combat.combatants)
            combat.pendingAttacks = []
            combat.opportunities = []
            combat.unseen = []
            combat.reactions = []
            combat.environment = defaultEnvironment()

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'phase_change',
                actorId: 'system',
                actorName: 'Sistema',
                message: `🏁 **Combate encerrado!**\nDuração: ${combat.round} round${combat.round > 1 ? 's' : ''}.`
            }))

            break
        }

        case 'roll_initiative': {
            if (!combat.isActive || combat.phase !== 'INITIATIVE') {
                return NextResponse.json({ error: 'Não é possível rolar iniciativa agora' }, { status: 400 })
            }

            const { combatantId , value } = body
            
            // Busca combatente por id ou odacId (para jogadores)
            const combatant = combat.combatants.find(c => 
                c.id === combatantId || c.odacId === combatantId
            )
            
            console.log('[Combat API] roll_initiative:', {
                combatantId,
                found: !!combatant,
                combatantName: combatant?.name,
                combatantType: combatant?.type,
                allCombatantIds: combat.combatants.map(c => ({ id: c.id, odacId: c.odacId, name: c.name }))
            })
            
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado' }, { status: 404 })
            }

            let dice = playerInitiativeDice(null)

            try {
                if (combatant.type === 'player') {
                    dice = playerInitiativeDice(await charsheetRepository.findById(combatant.id))
                } else if (combatant.type === 'creature') {
                    dice = creatureInitiativeDice(findBaseCreature(combatant.id, (campaign as any).custom?.creatures || []))
                }
            } catch (err) {
                console.error('[Combat API] Erro ao calcular iniciativa avançada:', err)
            }

            // Efeitos aplicados (Velocidade, Cegueira...): bônus fixo na iniciativa e vantagem ou desvantagem nos d20 (Fase 6.3)
            dice = initiativeWithEffects(dice, combatant.effects)

            // Se um valor foi passado (rolado manualmente), usa ele como resultado do dado
            const { rolls, roll, total: rolledTotal } = resolveInitiative(dice, { manual: value })
            const { numDice, expertiseValue } = dice
            const effectBonus = dice.effectBonus ?? 0
            const effectsPart = effectBonus !== 0 ? ` ${effectBonus > 0 ? '+' : '−'} ${Math.abs(effectBonus)} efeitos` : ''

            combatant.initiativeBonus = expertiseValue + effectBonus
            combatant.initiativeRoll = roll
            combatant.initiativeTotal = rolledTotal
            
            console.log('[Combat API] Iniciativa atualizada:', {
                name: combatant.name,
                roll,
                numDice,
                expertiseValue,
                total: combatant.initiativeTotal
            })

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'initiative',
                actorId: combatant.id,
                actorName: combatant.name,
                value: combatant.initiativeTotal,
                message: `🎲 **${combatant.name}** rolou iniciativa: ${numDice}d20 (${describeInitiativeRolls({ rolls, roll })}) + ${expertiseValue} AGI${effectsPart}`
                    + ` = **${combatant.initiativeTotal}**${describeInitiativeEffects(dice)}`
            }))

            if (combatant.type === 'player') {
                statsEntries.push({
                    charsheetId: combatant.id,
                    userId: combatant.odacId,
                    charsheetName: combatant.name,
                    inc: { 'dice.totalRolls': 1 },
                    max: { 'dice.highestRoll': combatant.initiativeTotal }
                })
            }

            break
        }

        case 'set_initiative': {
            if (!combat.isActive || combat.phase !== 'INITIATIVE') {
                return NextResponse.json({ error: 'Não é possível definir iniciativa agora' }, { status: 400 })
            }

            // Verifica se todos rolaram
            const allRolled = combat.combatants.every(c => c.initiativeRoll > 0)
            if (!allRolled) {
                return NextResponse.json({ 
                    error: 'Nem todos os combatentes rolaram iniciativa',
                    pendingCombatants: combat.combatants.filter(c => c.initiativeRoll === 0).map(c => c.name)
                }, { status: 400 })
            }

            // Ordena por iniciativa (maior primeiro), desempate por DEX
            combat.combatants.sort((a, b) => {
                if (b.initiativeTotal !== a.initiativeTotal) {
                    return b.initiativeTotal - a.initiativeTotal
                }
                // Desempate por DES
                return (b.dexterity || 0) - (a.dexterity || 0)
            })
            combat.phase = 'ACTION'
            combat.currentTurnIndex = 0

            // Formata a ordem de iniciativa de forma legível
            const orderLines = combat.combatants.map((c, i) => 
                `${i + 1}º ${c.name} — Iniciativa: ${c.initiativeTotal}`
            ).join('\n')
            
            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'phase_change',
                actorId: 'system',
                actorName: 'Sistema',
                message: `📋 **Ordem de Iniciativa**\n${orderLines}\n\n🎯 Vez de **${combat.combatants[0].name}**!`
            }))

            break
        }

        case 'next_turn': {
            if (!combat.isActive || combat.phase !== 'ACTION') {
                return NextResponse.json({ error: 'Não é possível passar turno agora' }, { status: 400 })
            }

            const currentCombatant = combat.combatants[combat.currentTurnIndex]
            if (currentCombatant) {
                currentCombatant.hasActed = true
            }
            // As oportunidades de ataque só duram o turno de quem se moveu, e as ofertas de reação o turno em andamento
            combat.opportunities = []
            combat.reactions = []

            // Verifica se todos agiram (recalcula após marcar o atual)
            const allActed = combat.combatants.every(c => c.hasActed)
            
            console.log('[Combat API] next_turn:', {
                currentIndex: combat.currentTurnIndex,
                currentName: currentCombatant?.name,
                allActed,
                combatantsStatus: combat.combatants.map(c => ({ name: c.name, hasActed: c.hasActed }))
            })
            
            if (allActed) {
                // Novo round - volta para iniciativa
                combat.round++
                statsEntries.push({ gm: true, inc: { combatRoundsRun: 1 } })
                combat.combatants.forEach(c => {
                    c.hasActed = false
                    c.initiativeRoll = 0
                    c.initiativeTotal = 0
                })
                combat.phase = 'INITIATIVE'
                combat.currentTurnIndex = 0
                // A rodada virou: o limite de MP por turno de todos recomeça e as magias sustentadas cobram a manutenção (já no limite novo)
                resetRoundWindows(combat.combatants)
                await applySustainedUpkeep(combat)

                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'phase_change',
                    actorId: 'system',
                    actorName: 'Sistema',
                    message: `🔄 **Round ${combat.round}!**\nFase de Iniciativa — todos devem rolar novamente.`
                }))

                // Efeitos timing='turn' também decrementam quando o round reinicia
                const nextCombatantId = combat.combatants[0]?.id
                if (nextCombatantId) {
                    const tickRes = processEffectTicks(combat, {
                        type: 'turn_advance',
                        newCombatantId: nextCombatantId,
                        previousCombatantId: currentCombatant?.id
                    })
                    if (tickRes.charsheetsToSync.size > 0) {
                        await syncPlayerCharsheets(combat, tickRes.charsheetsToSync)
                    }
                }
            } else {
                // Próximo combatente que ainda não agiu
                let nextIndex = (combat.currentTurnIndex + 1) % combat.combatants.length
                let attempts = 0
                const maxAttempts = combat.combatants.length
                
                while (combat.combatants[nextIndex].hasActed && attempts < maxAttempts) {
                    nextIndex = (nextIndex + 1) % combat.combatants.length
                    attempts++
                }
                
                // Se todos já agiram (fallback de segurança)
                if (attempts >= maxAttempts) {
                    combat.round++
                    statsEntries.push({ gm: true, inc: { combatRoundsRun: 1 } })
                    combat.combatants.forEach(c => {
                        c.hasActed = false
                        c.initiativeRoll = 0
                        c.initiativeTotal = 0
                    })
                    combat.phase = 'INITIATIVE'
                    combat.currentTurnIndex = 0
                    resetRoundWindows(combat.combatants)
                    await applySustainedUpkeep(combat)

                    combat.logs.push(new CombatLog({
                        round: combat.round,
                        type: 'phase_change',
                        actorId: 'system',
                        actorName: 'Sistema',
                        message: `🔄 **Round ${combat.round}!**\nFase de Iniciativa — todos devem rolar novamente.`
                    }))
                } else {
                    combat.currentTurnIndex = nextIndex

                    const nextCombatant = combat.combatants[nextIndex]
                    // Efeito que faz perder o turno (Paralisia, Atordoamento, Medo...): o aviso entra no anúncio da vez, antes de o tick tirar o efeito. É aviso, o
                    // mestre decide (o catálogo às vezes diz "chance de pular o turno")
                    const skipReason = blockReason(actionBlocks(nextCombatant.effects), 'skip_turn', `**${nextCombatant.name}**`)
                    combat.logs.push(new CombatLog({
                        round: combat.round,
                        type: 'turn_pass',
                        actorId: currentCombatant?.id || 'system',
                        actorName: currentCombatant?.name || 'Sistema',
                        message: `➡️ **${currentCombatant?.name || 'Alguém'}** passou o turno.\n🎯 Vez de **${nextCombatant.name}**!${skipReason ? `\n⏭️ ${skipReason}.` : ''}`
                    }))

                    // Processa tick de efeitos ao avançar o turno
                    const tickRes = processEffectTicks(combat, {
                        type: 'turn_advance',
                        newCombatantId: nextCombatant.id,
                        previousCombatantId: currentCombatant?.id
                    })
                    if (tickRes.charsheetsToSync.size > 0) {
                        await syncPlayerCharsheets(combat, tickRes.charsheetsToSync)
                    }
                }
            }

            break
        }

        case 'apply_damage': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId, targetId, value: damage } = body
            if (!targetId || damage === undefined) {
                return NextResponse.json({ error: 'Alvo e valor de dano são obrigatórios' }, { status: 400 })
            }

            const attacker = combat.combatants.find(c => c.id === combatantId)
            const change = await damageCombatant(combat, targetId, damage)

            if (!change) {
                return NextResponse.json({ error: 'Alvo não encontrado' }, { status: 404 })
            }
            const { target } = change

            // Mensagem de dano - não revela LP restante para ninguém
            const damageMessage = `⚔️ **${attacker?.name || 'Desconhecido'}** causou **${damage} de dano** em **${target.name}**!`

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'damage',
                actorId: attacker?.id || 'unknown',
                actorName: attacker?.name || 'Desconhecido',
                targetId: target.id,
                targetName: target.name,
                value: damage,
                message: damageMessage
            }))

            statsEntries.push(...damageStats(attacker, change, damage))

            break
        }

        case 'apply_heal': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId: healerId, targetId: healTargetId, value: heal } = body
            if (!healTargetId || heal === undefined) {
                return NextResponse.json({ error: 'Alvo e valor de cura são obrigatórios' }, { status: 400 })
            }

            const healer = combat.combatants.find(c => c.id === healerId)

            // Necrose, Incurável... (flag `no_healing`): a cura é bloqueada. O mestre pode curar mesmo assim (`force`); o jogador não
            const healBlocks = actionBlocks(combat.combatants.find(c => c.id === healTargetId)?.effects)
            if (isBlocked(healBlocks, 'no_healing') && !(isGM && body.force === true)) {
                const healTargetName = combat.combatants.find(c => c.id === healTargetId)?.name ?? 'O alvo'
                return NextResponse.json({
                    error: `${blockReason(healBlocks, 'no_healing', healTargetName)}.${isGM ? '' : ' Peça ao mestre.'}`,
                    code: 'HEALING_BLOCKED',
                    blockedBy: healBlocks.no_healing,
                    canForce: isGM
                }, { status: 409 })
            }
            const healChange = await healCombatant(combat, healTargetId, heal)

            if (!healChange) {
                return NextResponse.json({ error: 'Alvo não encontrado' }, { status: 404 })
            }
            const healTarget = healChange.target

            // Mensagem de cura - não revela LP restante para ninguém
            const healMessage = `💚 **${healer?.name || 'Desconhecido'}** curou **${heal} de LP** em **${healTarget.name}**!`

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'heal',
                actorId: healer?.id || 'unknown',
                actorName: healer?.name || 'Desconhecido',
                targetId: healTarget.id,
                targetName: healTarget.name,
                value: heal,
                message: healMessage
            }))

            statsEntries.push(...healStats(healer, healChange))

            break
        }

        case 'add_creature':
        case 'add_combatants': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const campaignCreatures: Creature[] = (campaign as any).custom?.creatures || []
            const newcomers: Newcomer[] = []

            if (action === 'add_creature') {
                // Entrada antiga: a criatura vem pronta do cliente (só o mestre chega aqui)
                for (const creature of body.creatures ?? []) {
                    if (typeof creature?.id !== 'string' || typeof creature.name !== 'string') continue
                    const { id: instanceId, name } = nextCreatureInstance(combat.combatants, creature.id, creature.name)
                    newcomers.push({
                        combatant: new Combatant({
                            id: instanceId,
                            name,
                            type: 'creature',
                            initiativeBonus: creature.agility || 0,
                            dexterity: creature.dexterity || 0,
                            currentLp: creature.lp,
                            maxLp: creature.maxLp,
                            currentMp: creature.mp,
                            maxMp: creature.maxMp,
                            effects: []
                        }),
                        dice: creatureInitiativeDice(campaignCreatures.find(c => c.id === creature.id))
                    })
                    // as cópias seguintes da mesma criatura nesta chamada precisam enxergar as anteriores
                    combat.combatants.push(newcomers[newcomers.length - 1].combatant)
                }
                for (const { combatant } of newcomers) combat.combatants.splice(combat.combatants.indexOf(combatant), 1)
            } else {
                const join = body.join ?? {}
                const joiningPlayers = Array.isArray(join.players) ? join.players : []
                const joiningCreatures = Array.isArray(join.creatures) ? join.creatures : []

                if (joiningPlayers.length + joiningCreatures.length === 0) {
                    throw badRequest('Selecione ao menos um combatente')
                }
                if (joiningPlayers.length > MAX_JOIN_ENTRIES || joiningCreatures.length > MAX_JOIN_ENTRIES) {
                    throw badRequest('Combatentes demais de uma vez')
                }

                // Jogadores: os dados vêm da ficha, e a ficha tem de ser de alguém da campanha
                for (const entry of joiningPlayers) {
                    if (typeof entry?.charsheetId !== 'string') throw badRequest('Jogador inválido')
                    const member = campaign.players?.find(p => p.charsheetId === entry.charsheetId)
                    if (!member) {
                        warnings.push('Esse jogador não faz parte da campanha.')
                        continue
                    }
                    if (combat.combatants.some(c => c.id === entry.charsheetId)) {
                        warnings.push(`${combat.combatants.find(c => c.id === entry.charsheetId)?.name ?? 'O jogador'} já está no combate.`)
                        continue
                    }
                    const charsheet = await charsheetRepository.findById(entry.charsheetId)
                    if (!charsheet) {
                        warnings.push('Não achei a ficha de um dos jogadores.')
                        continue
                    }
                    const dice = playerInitiativeDice(charsheet)
                    newcomers.push({
                        combatant: new Combatant({
                            id: entry.charsheetId,
                            name: charsheet.name,
                            type: 'player',
                            odacId: member.userId,
                            avatar: typeof entry.avatar === 'string' ? entry.avatar : undefined,
                            initiativeBonus: dice.expertiseValue,
                            dexterity: Number((charsheet as any).attributes?.des ?? 0) || 0,
                            currentLp: charsheet.stats?.lp,
                            maxLp: charsheet.stats?.maxLp,
                            currentMp: charsheet.stats?.mp,
                            maxMp: charsheet.stats?.maxMp,
                            effects: []
                        }),
                        dice
                    })
                }

                // Criaturas: os dados vêm da criatura da campanha; cada cópia ganha id e nome próprios
                const planned: Combatant[] = []
                for (const entry of joiningCreatures) {
                    if (typeof entry?.id !== 'string') throw badRequest('Criatura inválida')
                    const base = campaignCreatures.find(c => c.id === entry.id)
                    if (!base) {
                        warnings.push('Uma das criaturas não existe mais na campanha.')
                        continue
                    }
                    const quantity: unknown = entry.quantity === undefined ? 1 : entry.quantity
                    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CREATURE_COPIES) {
                        throw badRequest(`A quantidade de ${base.name} deve ficar entre 1 e ${MAX_CREATURE_COPIES}`)
                    }
                    const dice = creatureInitiativeDice(base)
                    for (let copy = 0; copy < quantity; copy++) {
                        const { id: instanceId, name } = nextCreatureInstance([ ...combat.combatants, ...planned ], base.id, base.name)
                        const combatant = new Combatant({
                            id: instanceId,
                            name,
                            type: 'creature',
                            initiativeBonus: dice.expertiseValue,
                            dexterity: Number(base.attributes?.des ?? 0) || 0,
                            currentLp: base.stats?.lp,
                            maxLp: base.stats?.maxLp ?? base.stats?.lp,
                            currentMp: base.stats?.mp,
                            maxMp: base.stats?.maxMp ?? base.stats?.mp,
                            effects: []
                        })
                        planned.push(combatant)
                        newcomers.push({ combatant, dice })
                    }
                }
            }

            if (newcomers.length === 0) {
                return NextResponse.json({ error: warnings.join(' ') || 'Nenhum combatente para adicionar', warnings }, { status: 400 })
            }

            joinCombat(combat, newcomers)

            const addedCreatures = newcomers.filter(n => n.combatant.type === 'creature').length
            if (addedCreatures > 0) {
                statsEntries.push({ gm: true, inc: { creaturesAdded: addedCreatures } })
            }

            break
        }

        case 'remove_combatant': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId: removeId } = body
            const removeIndex = combat.combatants.findIndex(c => c.id === removeId)
            
            if (removeIndex === -1) {
                return NextResponse.json({ error: 'Combatente não encontrado' }, { status: 404 })
            }

            const removed = combat.combatants.splice(removeIndex, 1)[0]
            combat.pendingAttacks = dropPendingFor(combat.pendingAttacks, removed.id)
            combat.opportunities = dropOpportunitiesFor(combat.opportunities, removed.id)
            combat.unseen = dropUnseenFor(combat.unseen, removed.id)
            combat.environment = dropTerrainFor(combat.environment, removed.id)
            combat.reactions = dropReactionsFor(combat.reactions, removed.id)
            
            // Ajusta índice atual se necessário
            if (combat.currentTurnIndex >= combat.combatants.length) {
                combat.currentTurnIndex = 0
            }

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'action',
                actorId: 'system',
                actorName: 'Sistema',
                message: `➖ **${removed.name}** saiu do combate.`
            }))

            break
        }

        case 'apply_effect': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const {
                targetId,
                effectId,
                level = 1,
                appliedByName,
                appliedById,
                timingOverride,
                durationOverride,
                indefiniteOverride
            } = body

            if (!targetId || !effectId) {
                return NextResponse.json({ error: 'targetId e effectId são obrigatórios' }, { status: 400 })
            }

            const target = combat.combatants.find(c => c.id === targetId)
            if (!target) {
                return NextResponse.json({ error: 'Combatente alvo não encontrado' }, { status: 404 })
            }

            const effect = await combatEffectRepository.findById(effectId)
            if (!effect) {
                return NextResponse.json({ error: 'Efeito não encontrado no catálogo' }, { status: 404 })
            }

            // Se o efeito não usa níveis, força level=1
            const usesLevels = effect.usesLevels !== false
            const safeLevel = usesLevels ? Math.max(1, Math.floor(level)) : 1
            const levelConfig = effect.levels?.[safeLevel - 1]
            if (!levelConfig) {
                return NextResponse.json({ error: `Nível ${safeLevel} não configurado neste efeito` }, { status: 400 })
            }

            if (!Array.isArray(target.effects)) target.effects = []

            // Snapshot do efeito com possíveis overrides de timing
            // `stripUndefined` garante que o Firestore não receba campos `undefined`.
            const snapshot = stripUndefined(JSON.parse(JSON.stringify(effect)))
            if (timingOverride === 'turn' || timingOverride === 'round') {
                snapshot.timing = timingOverride
            }
            const effectiveTiming: 'turn' | 'round' = snapshot.timing

            // Duração efetiva (override ou default do nível).
            // Se `indefiniteOverride === true` ou o próprio nível é `indefinite`, tratamos como indefinido.
            const effectIsIndefinite = indefiniteOverride === true || levelConfig.indefinite === true
            const effectiveDuration = effectIsIndefinite
                ? 0
                : (
                    typeof durationOverride === 'number'
                    && Number.isFinite(durationOverride)
                    && durationOverride > 0
                )
                    ? Math.max(1, Math.floor(durationOverride))
                    : levelConfig.duration

            const newApplied = new AppliedEffect(stripUndefined({
                id: uuidv4(),
                effectId: effect.id,
                snapshot,
                level: safeLevel,
                remaining: effectiveDuration,
                indefinite: effectIsIndefinite || undefined,
                appliedAtRound: combat.round,
                appliedByName,
                appliedById
            }))

            target.effects.push(newApplied)

            const fullName = getEffectDisplayName(effect, safeLevel)
            const durationTxt = effectIsIndefinite
                ? '∞ (indefinido)'
                : `${effectiveDuration} ${effectiveTiming === 'turn' ? 'turno(s)' : 'rodada(s)'}`
            const wasCustomized =
                (timingOverride && timingOverride !== effect.timing)
                || (!effectIsIndefinite && durationOverride && durationOverride !== levelConfig.duration)
                || (indefiniteOverride === true && !levelConfig.indefinite)
            const customTag = wasCustomized ? ' _(customizado)_' : ''

            const formulaTxt = levelConfig.formula && levelConfig.formula !== '0'
                ? `${levelConfig.formula} · `
                : ''

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'effect_applied',
                actorId: appliedById || 'gm',
                actorName: appliedByName || 'GM',
                targetId: target.id,
                targetName: target.name,
                message: `${effect.icon} **${target.name}** ganhou o efeito **${fullName}** (${formulaTxt}${durationTxt})${customTag}.`
            }))

            // timing='turn' aplica o primeiro tick imediatamente
            if (effectiveTiming === 'turn') {
                const tickRes = processEffectTicks(combat, {
                    type: 'effect_applied',
                    combatantId: target.id,
                    appliedEffectId: newApplied.id
                })
                if (tickRes.charsheetsToSync.size > 0) {
                    await syncPlayerCharsheets(combat, tickRes.charsheetsToSync)
                }
            }

            statsEntries.push({ gm: true, inc: { effectsApplied: 1 } })

            break
        }

        case 'remove_effect': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { targetId, appliedEffectId } = body
            if (!targetId || !appliedEffectId) {
                return NextResponse.json({ error: 'targetId e appliedEffectId são obrigatórios' }, { status: 400 })
            }

            const target = combat.combatants.find(c => c.id === targetId)
            if (!target) {
                return NextResponse.json({ error: 'Combatente alvo não encontrado' }, { status: 404 })
            }

            const idx = (target.effects || []).findIndex(e => e.id === appliedEffectId)
            if (idx === -1) {
                return NextResponse.json({ error: 'Efeito aplicado não encontrado' }, { status: 404 })
            }

            const removed = target.effects.splice(idx, 1)[0]
            const fullName = removed.snapshot ? getEffectDisplayName(removed.snapshot, removed.level) : 'efeito'

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'effect_removed',
                actorId: 'gm',
                actorName: 'GM',
                targetId: target.id,
                targetName: target.name,
                message: `🧹 Efeito **${fullName}** removido de **${target.name}**.`
            }))

            break
        }

        case 'spend_mp': {
            // Fora do combate não há limite por turno: nada é registrado (e nada falha, para quem ainda tem o combate antigo na tela)
            if (!combat.isActive) {
                return NextResponse.json({ success: true, combat, enforced: false })
            }

            const { combatantId, value: amount } = body
            if (typeof amount !== 'number' || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000) {
                throw badRequest('Valor de MP inválido')
            }

            const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado' }, { status: 404 })
            }

            // Criatura: o limite sai do nível e do Foco da criatura de origem, e o MP dela mora no combatente (só o mestre chega aqui)
            if (combatant.type !== 'player') {
                const creature = findBaseCreature(combatant.id, campaign.custom?.creatures ?? [])
                const vitals = combatantVitals(combatant, creature)
                if (amount > 0 && vitals.mp < amount) {
                    return NextResponse.json({ error: `MP insuficiente (${vitals.mp} de ${amount})` }, { status: 400 })
                }

                const creatureDecision = evaluateMpSpend({
                    spent: combatant.mpSpentThisTurn ?? 0,
                    amount,
                    limit: creature ? getCreatureMpLimit(creature) : 0,
                    enforced: creature ? isCreatureMpLimitEnforced(creature, campaign.mode) : false,
                    override: combatant.mpLimitOverride
                })
                if (!creatureDecision.allowed) {
                    return NextResponse.json({
                        error: creatureDecision.message,
                        code: 'MP_LIMIT_EXCEEDED',
                        spent: creatureDecision.spent,
                        limit: creatureDecision.limit
                    }, { status: 409 })
                }

                combatant.mpSpentThisTurn = creatureDecision.spent
                combatant.maxMp = vitals.maxMp
                combatant.currentMp = Math.min(vitals.maxMp, Math.max(0, vitals.mp - amount))
                break
            }

            const sheet = await charsheetRepository.findById(combatant.id)
            const enforced = sheet ? isMpLimitEnforced(sheet, campaign.mode) : false
            const decision = evaluateMpSpend({
                spent: combatant.mpSpentThisTurn ?? 0,
                amount,
                limit: sheet ? getMpLimit(sheet) : 0,
                enforced,
                override: combatant.mpLimitOverride
            })

            if (!decision.allowed) {
                return NextResponse.json({
                    error: decision.message,
                    code: 'MP_LIMIT_EXCEEDED',
                    spent: decision.spent,
                    limit: decision.limit
                }, { status: 409 })
            }

            combatant.mpSpentThisTurn = decision.spent

            break
        }

        case 'reset_mp_limit': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId } = body
            const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado no combate' }, { status: 404 })
            }

            combatant.mpSpentThisTurn = 0

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'action',
                actorId: 'gm',
                actorName: 'Mestre',
                targetId: combatant.id,
                targetName: combatant.name,
                message: `🔄 O mestre resetou o limite de MP por turno de **${combatant.name}**.`
            }))

            break
        }

        case 'spend_action': {
            // Fora do combate não há orçamento de ações: nada é registrado (e nada falha)
            if (!combat.isActive) {
                return NextResponse.json({ success: true, combat, enforced: false })
            }

            const { combatantId, execution } = body
            const slot = executionSlot(execution)
            if (!slot) {
                throw badRequest('Ação inválida: use Padrão, Bônus, Movimento, Reação ou Completa')
            }

            const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado' }, { status: 404 })
            }

            // Paralisia (flag `no_actions`): o combatente não pode agir. Mesma resposta de "sem a ação", que os clientes já tratam como aviso (o mestre decide)
            const actionBlocked = actionBlocks(combatant.effects)
            if (isBlocked(actionBlocked, 'no_actions')) {
                return NextResponse.json({
                    error: `${blockReason(actionBlocked, 'no_actions', combatant.name)}`,
                    code: 'ACTION_UNAVAILABLE',
                    blockedBy: actionBlocked.no_actions,
                    missing: [ slot ]
                }, { status: 409 })
            }

            const spent = spendAction(combatantBudget(combatant), execution)
            if (!spent.ok) {
                return NextResponse.json({
                    error: `${combatant.name} não tem a ação ${String(execution)} disponível nesta rodada`,
                    code: 'ACTION_UNAVAILABLE',
                    missing: spent.missing
                }, { status: 409 })
            }

            combatant.actions = spent.budget
            // Gastou a Reação: as ofertas de reação dele se fecham (ele já reagiu, ou esquivou)
            if (slot === 'reacao') combat.reactions = closeReactionsOf(combat.reactions, combatant.id)

            break
        }

        case 'set_actions': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const combatant = combat.combatants.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado no combate' }, { status: 404 })
            }

            const next = applyBudgetPatch(combatantBudget(combatant), body.actions)
            if (!next) {
                throw badRequest('Ações inválidas: informe Padrão, Bônus, Movimento ou Reação com inteiros de 0 a 9')
            }

            combatant.actions = next

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'action',
                actorId: 'gm',
                actorName: 'Mestre',
                targetId: combatant.id,
                targetName: combatant.name,
                message: `✏️ O mestre ajustou as ações de **${combatant.name}**: ${describeBudget(next)}.`
            }))

            break
        }

        case 'set_mp_spent': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId, value: spentValue } = body
            if (typeof spentValue !== 'number' || !Number.isInteger(spentValue) || spentValue < 0 || spentValue > 1000) {
                throw badRequest('Valor de MP gasto inválido')
            }

            const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado no combate' }, { status: 404 })
            }

            // O limite (o máximo) não muda aqui: só o gasto atual, de 0 até ele. Jogador: ficha; criatura: a criatura de origem
            let limit = 0
            let enforced = false
            if (combatant.type === 'player') {
                const sheet = await charsheetRepository.findById(combatant.id)
                limit = sheet ? getMpLimit(sheet) : 0
                enforced = sheet ? isMpLimitEnforced(sheet, campaign.mode) : false
            } else {
                const creature = findBaseCreature(combatant.id, campaign.custom?.creatures ?? [])
                limit = creature ? getCreatureMpLimit(creature) : 0
                enforced = creature ? isCreatureMpLimitEnforced(creature, campaign.mode) : false
            }
            if (!enforced) {
                throw badRequest(`O limite de MP por turno não vale para ${combatant.name}`)
            }
            if (spentValue > limit) {
                throw badRequest(`O MP gasto não pode passar do limite (${limit})`)
            }

            combatant.mpSpentThisTurn = spentValue

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'action',
                actorId: 'gm',
                actorName: 'Mestre',
                targetId: combatant.id,
                targetName: combatant.name,
                message: `✏️ O mestre definiu o MP gasto na rodada de **${combatant.name}** em ${spentValue}/${limit}.`
            }))

            break
        }

        case 'sustain_start': {
            // Fora do combate a sustentada é como uma imediata: nada fica ativo
            if (!combat.isActive) {
                return NextResponse.json({ success: true, combat, active: false })
            }

            const { combatantId, spellKey, spellName, stage, cost } = body
            if (!combatantId || !spellKey || !spellName) {
                throw badRequest('combatantId, spellKey e spellName são obrigatórios')
            }
            if (typeof stage !== 'number' || !Number.isInteger(stage) || stage < 1 || stage > 3) {
                throw badRequest('Estágio inválido')
            }
            if (typeof cost !== 'number' || !Number.isInteger(cost) || cost < 1 || cost > 1000) {
                throw badRequest('Custo de MP inválido')
            }

            const started = startSustained(combat, combatantId, {
                spellKey: String(spellKey).slice(0, 200),
                spellName: String(spellName).slice(0, 200),
                stage,
                cost,
                upkeep: sustainedUpkeepFor(cost)
            })
            if (!started) {
                return NextResponse.json({ error: 'Jogador não encontrado no combate' }, { status: 404 })
            }

            break
        }

        case 'sustain_end': {
            if (!combat.isActive) {
                return NextResponse.json({ success: true, combat, active: false })
            }

            const { combatantId, spellKey } = body
            if (!combatantId) {
                throw badRequest('combatantId é obrigatório')
            }

            endSustained(combat, combatantId, spellKey ? String(spellKey) : undefined)

            break
        }

        case 'set_mp_limit_override': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { combatantId, enabled } = body
            const combatant = combat.combatants.find(c => c.id === combatantId || c.odacId === combatantId)
            if (!combatant) {
                return NextResponse.json({ error: 'Combatente não encontrado no combate' }, { status: 404 })
            }

            const allow = enabled !== false
            combatant.mpLimitOverride = allow

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'action',
                actorId: 'gm',
                actorName: 'Mestre',
                targetId: combatant.id,
                targetName: combatant.name,
                message: allow
                    ? `🔓 O mestre liberou o limite de MP por turno de **${combatant.name}** até a rodada virar.`
                    : `🔒 O limite de MP por turno de **${combatant.name}** foi restabelecido.`
            }))

            break
        }

        case 'undo': {
            if (!isCombatEventId(body.eventId)) {
                throw badRequest('Evento inválido')
            }

            const event = await getCombatEvent(campaign.id, body.eventId)
            if (!event) {
                return NextResponse.json({ error: 'Evento não encontrado: o histórico guarda só os últimos eventos' }, { status: 404 })
            }
            if (event.undone) {
                return NextResponse.json({ error: 'Este evento já foi desfeito', code: 'ALREADY_UNDONE' }, { status: 409 })
            }

            // Algum campo que o evento mexeu já mudou de novo? Sem `force`, nada é desfeito
            const outcome = await undoCombatEvent(combat, event, body.force === true)
            if (!outcome.ok) {
                return NextResponse.json({
                    error: 'Algo que este evento mudou mudou de novo depois. Desfazer mesmo assim sobrescreve esses valores.',
                    code: 'UNDO_CONFLICT',
                    conflicts: outcome.conflicts
                }, { status: 409 })
            }

            combat.logs.push(outcome.log)
            undoneEventId = event.id

            break
        }

        case 'declare_attack': {
            if (!combat.isActive || combat.phase !== 'ACTION') {
                return NextResponse.json({ error: 'Só dá para declarar ataque na fase de ação' }, { status: 400 })
            }

            const attacker = combat.combatants.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
            const target = combat.combatants.find(c => c.id === body.targetId)
            if (!attacker) {
                return NextResponse.json({ error: 'Atacante não encontrado no combate' }, { status: 404 })
            }
            if (!target) {
                return NextResponse.json({ error: 'Alvo não encontrado no combate' }, { status: 404 })
            }
            if (attacker.id === target.id) {
                throw badRequest('Não dá para atacar a si mesmo')
            }

            // Vários alvos (ataque em área): o principal mais os extras que existem no combate, sem repetir e sem o próprio atacante
            const extraTargets = sanitizeTargetIds(body.targetIds)
                .filter(extraId => extraId !== target.id && extraId !== attacker.id)
                .map(extraId => combat.combatants.find(c => c.id === extraId))
                .filter((extra): extra is Combatant => extra !== undefined)
            const targets = [ target, ...extraTargets ].slice(0, MAX_ATTACK_TARGETS)
            if (body.opportunityId !== undefined && targets.length > 1) {
                throw badRequest('O ataque de oportunidade tem um alvo só')
            }

            const declaration = sanitizeAttackDeclaration(body.attack)
            if (!declaration) {
                throw badRequest('Ataque inválido')
            }

            // O mestre declarando um ataque manual (de criatura) já traz o dano; o do jogador chega depois, em attack_damage
            const rolledDamage = typeof body.damage === 'number' && Number.isInteger(body.damage) && body.damage >= 0 && body.damage <= 100_000 ? body.damage : undefined

            // Ataque de oportunidade: precisa de uma oportunidade aberta desse atacante contra esse alvo; ela se consome. A Reação é gasta por quem declara
            // (o jogador, pela arma ou pela magia de Reação; o mestre, pelo ataque manual), como os outros gastos de ação.
            let opportunity = false
            if (body.opportunityId !== undefined) {
                const open = findOpportunity(combat.opportunities, attacker.id, target.id)
                if (!open || open.id !== body.opportunityId) {
                    return NextResponse.json({ error: 'Essa oportunidade já não está aberta (o mestre pode tê-la dispensado)', code: 'OPPORTUNITY_GONE' }, { status: 409 })
                }
                combat.opportunities = removeOpportunity(combat.opportunities, open.id)
                opportunity = true
            }

            // Um ataque pendente por alvo, todos do mesmo grupo e com o mesmo acerto: o mestre resolve cada um (AP, fraqueza e defesa são do alvo) e o dano rolado vale para todos
            const groupId = targets.length > 1 ? uuidv4() : undefined
            const createdAt = new Date().toISOString()
            combat.pendingAttacks = addPendingAttacks(combat.pendingAttacks, targets.map(each => ({
                ...declaration,
                ...(isGM && rolledDamage !== undefined ? { damageRolled: rolledDamage } : {}),
                ...(opportunity ? { opportunity: true } : {}),
                ...(groupId ? { groupId, groupSize: targets.length } : {}),
                id: uuidv4(),
                attackerId: attacker.id,
                attackerName: attacker.name,
                targetId: each.id,
                targetName: each.name,
                createdAt
            })))

            break
        }

        case 'attack_damage': {
            const damage = body.damage
            if (typeof damage !== 'number' || !Number.isInteger(damage) || damage < 0 || damage > 100_000) {
                throw badRequest('Dano inválido')
            }

            const updated = setPendingDamage(combat.pendingAttacks, String(body.attackId), damage, body.critical === true)
            if (!updated) {
                return NextResponse.json({ error: 'Ataque pendente não encontrado (o mestre pode já tê-lo resolvido)' }, { status: 404 })
            }
            combat.pendingAttacks = updated

            break
        }

        case 'dismiss_attack': {
            if (!combat.pendingAttacks?.some(entry => entry.id === body.attackId)) {
                return NextResponse.json({ error: 'Ataque pendente não encontrado' }, { status: 404 })
            }
            combat.pendingAttacks = removePendingAttack(combat.pendingAttacks, String(body.attackId))

            break
        }

        case 'declare_defense': {
            const pending = combat.pendingAttacks?.find(entry => entry.id === body.attackId)
            if (!pending) {
                return NextResponse.json({ error: 'Ataque pendente não encontrado (o mestre pode já tê-lo resolvido)' }, { status: 404 })
            }

            const defense = sanitizeDefenseDeclaration(body.defense)
            if (!defense) {
                throw badRequest('Defesa inválida')
            }

            // Uma defesa só: o jogador não refaz a rolagem para melhorar o resultado. O mestre troca o que quiser ao resolver.
            if (pending.defense && !isGM) {
                return NextResponse.json({ error: 'Você já declarou a defesa desse ataque', code: 'DEFENSE_ALREADY_DECLARED' }, { status: 409 })
            }

            combat.pendingAttacks = setPendingDefense(combat.pendingAttacks, pending.id, defense) ?? combat.pendingAttacks

            break
        }

        case 'declare_leave': {
            if (!combat.isActive || combat.phase !== 'ACTION') {
                return NextResponse.json({ error: 'Só dá para declarar a saída na fase de ação' }, { status: 400 })
            }

            const mover = combat.combatants.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
            if (!mover) {
                return NextResponse.json({ error: 'Quem saiu do alcance não está no combate' }, { status: 404 })
            }

            const reactorIds = sanitizeReactorIds(body.reactorIds)
            if (reactorIds.length === 0) {
                throw badRequest('Escolha quem estava ao alcance')
            }

            const plan = planLeaveReach(combat.combatants, mover.id, reactorIds, combat.unseen)
            const now = new Date().toISOString()
            combat.opportunities = addOpportunities(combat.opportunities, plan.opportunities.map(entry => ({ ...entry, id: uuidv4(), createdAt: now })))
            warnings.push(...plan.warnings)

            break
        }

        case 'dismiss_opportunity': {
            if (!combat.opportunities?.some(entry => entry.id === body.opportunityId)) {
                return NextResponse.json({ error: 'Oportunidade não encontrada (ela pode já ter sido usada)' }, { status: 404 })
            }
            combat.opportunities = removeOpportunity(combat.opportunities, String(body.opportunityId))

            break
        }

        case 'set_unseen': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const hider = combat.combatants.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
            if (!hider) {
                return NextResponse.json({ error: 'Quem está escondido não está no combate' }, { status: 404 })
            }

            const cause = sanitizeHiddenCause(body.cause)
            if (!cause) {
                throw badRequest('Escolha por que ele não é visto (furtivo, invisível ou fora da vista)')
            }

            const observerIds = sanitizeObserverIds(body.observerIds)
            if (observerIds.length === 0) {
                throw badRequest('Escolha quem não o vê')
            }

            const plan = planHide(combat.combatants, hider.id, observerIds, cause)
            if (plan.entries.length === 0) {
                throw badRequest(plan.warnings[0] ?? 'Escolha quem não o vê')
            }

            const now = new Date().toISOString()
            combat.unseen = addUnseen(combat.unseen, plan.entries.map(entry => ({ ...entry, id: uuidv4(), createdAt: now })))
            warnings.push(...plan.warnings)

            break
        }

        case 'reveal_unseen': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const hider = combat.combatants.find(c => c.id === body.combatantId || c.odacId === body.combatantId)
            if (!hider) {
                return NextResponse.json({ error: 'Quem está escondido não está no combate' }, { status: 404 })
            }

            // Sem a lista revela a todos; com a lista (mesmo vazia) só a quem foi indicado
            const observerIds = body.observerIds === undefined ? undefined : sanitizeObserverIds(body.observerIds)
            const before = combat.unseen?.length ?? 0
            combat.unseen = revealUnseen(combat.unseen, hider.id, observerIds)
            if (combat.unseen.length === before) {
                return NextResponse.json({ error: 'Não havia ninguém sem ver esse combatente' }, { status: 404 })
            }

            break
        }

        case 'set_light': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const light = sanitizeLight(body.light)
            if (!light) {
                throw badRequest('Escolha a iluminação: claro, penumbra ou escuridão')
            }

            const environment = readEnvironment(combat.environment)
            // Mesma luz: nada muda e nada vai ao log nem ao chat
            if (environment.light !== light) {
                combat.environment = { ...environment, light }
                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'action',
                    actorId: 'system',
                    actorName: 'Sistema',
                    message: `💡 **Iluminação:** ${LIGHT_LABEL[light]}. ${LIGHT_RULE[light]}`
                }))
            }

            break
        }

        case 'set_terrain': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }
            if (typeof body.difficult !== 'boolean') {
                throw badRequest('Diga se estão em terreno difícil (true) ou se saíram dele (false)')
            }

            const requested = sanitizeTerrainIds(body.combatantIds)
            if (requested.length === 0) {
                throw badRequest('Escolha quem está no terreno')
            }

            const inCombat = requested.filter(requestedId => combat.combatants.some(c => c.id === requestedId))
            if (inCombat.length < requested.length) warnings.push('Um dos combatentes escolhidos não está mais no combate.')
            if (inCombat.length === 0) {
                throw badRequest('Escolha quem está no terreno')
            }

            const environment = readEnvironment(combat.environment)
            // Só quem muda de fato entra no log (marcar de novo quem já está marcado não diz nada)
            const changed = inCombat.filter(changedId => environment.difficultTerrainIds.includes(changedId) !== body.difficult)
            if (changed.length > 0) {
                combat.environment = setTerrain(environment, changed, body.difficult)
                const names = changed.map(changedId => combat.combatants.find(c => c.id === changedId)?.name ?? changedId).join(', ')
                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'action',
                    actorId: 'system',
                    actorName: 'Sistema',
                    message: body.difficult
                        ? `🪨 **${names}** ${changed.length > 1 ? 'estão' : 'está'} em terreno difícil: deslocamento pela metade.`
                        : `🪨 **${names}** ${changed.length > 1 ? 'saíram' : 'saiu'} do terreno difícil.`
                }))
            }

            break
        }

        case 'resolve_attack': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const pending = combat.pendingAttacks?.find(entry => entry.id === body.attackId)
            if (!pending) {
                return NextResponse.json({ error: 'Ataque pendente não encontrado' }, { status: 404 })
            }

            const damage = body.damage
            if (typeof body.hit !== 'boolean' || typeof damage !== 'number' || !Number.isInteger(damage) || damage < 0 || damage > 100_000) {
                throw badRequest('Acerto e dano finais são obrigatórios (dano inteiro de 0 a 100000)')
            }

            const attacker = combat.combatants.find(c => c.id === pending.attackerId)
            const lines = sanitizeExplainLines(body.lines)
            const dealt = body.hit ? damage : 0

            let change = null
            if (dealt > 0) {
                change = await damageCombatant(combat, pending.targetId, dealt)
                if (!change) {
                    return NextResponse.json({ error: 'O alvo já não está no combate' }, { status: 404 })
                }
                statsEntries.push(...damageStats(attacker, change, dealt))
            }

            // Esquivar gasta a Reação do alvo (é aviso, não trava: o mestre decidiu)
            if (body.reactionSpent === true) {
                const dodger = combat.combatants.find(c => c.id === pending.targetId)
                if (dodger) {
                    const spent = spendAction(combatantBudget(dodger), 'Reação')
                    if (spent.ok) dodger.actions = spent.budget
                }
            }

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: dealt > 0 ? 'damage' : 'action',
                actorId: pending.attackerId,
                actorName: pending.attackerName,
                targetId: pending.targetId,
                targetName: pending.targetName,
                value: dealt,
                message: buildAttackLogMessage(pending, body.hit, dealt, lines)
            }))

            combat.pendingAttacks = removePendingAttack(combat.pendingAttacks, pending.id)

            // Reações que a resolução entrega de graça (errou, sofreu dano, aliado caiu): quem tem a Reação ganha a oferta; nada trava
            const downed = Boolean(change && change.oldLp > 0 && change.target.currentLp === 0)
            const autoNow = new Date().toISOString()
            for (const auto of reactionsAfterAttack(combat.combatants, { targetId: pending.targetId, hit: body.hit, dealt, downed })) {
                const plan = planOpenReaction(combat.combatants, { trigger: auto.trigger, subjectId: auto.subjectId, reactorIds: auto.reactorIds })
                combat.reactions = addReactions(combat.reactions, plan.offers.map(offer => ({ ...offer, id: uuidv4(), createdAt: autoNow })))
            }

            break
        }

        case 'open_reaction': {
            if (!combat.isActive || combat.phase !== 'ACTION') {
                return NextResponse.json({ error: 'Só dá para abrir uma reação na fase de ação' }, { status: 400 })
            }

            const trigger = sanitizeTrigger(body.trigger)
            if (!trigger) {
                throw badRequest('Escolha o que disparou a reação')
            }

            const detail = sanitizeReactionText(body.text)
            if (trigger === 'other' && detail === '') {
                throw badRequest('Descreva o que aconteceu')
            }

            if (trigger !== 'other' && !combat.combatants.some(c => c.id === body.subjectId)) {
                return NextResponse.json({ error: 'Quem sofreu ou fez isso não está no combate' }, { status: 404 })
            }

            const reactorIds = sanitizeReactionReactorIds(body.reactorIds)
            if (reactorIds.length === 0) {
                throw badRequest('Escolha quem pode reagir')
            }

            const plan = planOpenReaction(combat.combatants, { trigger, subjectId: body.subjectId, reactorIds, text: detail })
            const nowReaction = new Date().toISOString()
            combat.reactions = addReactions(combat.reactions, plan.offers.map(offer => ({ ...offer, id: uuidv4(), createdAt: nowReaction })))
            warnings.push(...plan.warnings)

            break
        }

        case 'dismiss_reaction': {
            if (!combat.reactions?.some(entry => entry.id === body.reactionId)) {
                return NextResponse.json({ error: 'Reação não encontrada (ela pode já ter sido usada)' }, { status: 404 })
            }
            combat.reactions = removeReaction(combat.reactions, String(body.reactionId))

            break
        }

        default:
            return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
        }

        // O último log vira mensagem no chat (se houver). `spend_mp` não gera log:
        // sem esta guarda o último log antigo seria repostado a cada conjuração.
        // A mensagem é gravada no chat (subcoleção) depois de salvar a campanha.
        let combatMessage: Message | undefined
        // `sustain_end` só gera log quando alguma magia estava ativa.
        const logsGrew = combat.logs.length > logsBefore
        const silentActions: CombatAction[] = [
            'spend_mp', 'spend_action', 'declare_attack', 'attack_damage', 'dismiss_attack', 'declare_defense', 'declare_leave', 'dismiss_opportunity', 'set_unseen', 'reveal_unseen',
            'open_reaction', 'dismiss_reaction'
        ]
        // Estas só falam no chat quando de fato geraram um log (mesma luz ou terreno já marcado não repostam o último log antigo)
        const logOnlyIfGrew: CombatAction[] = [ 'sustain_end', 'set_light', 'set_terrain' ]
        if (!silentActions.includes(action) && (!logOnlyIfGrew.includes(action) || logsGrew) && combat.logs.length > 0) {
            const lastLog = combat.logs[combat.logs.length - 1]
            combatMessage = new Message({
                id: crypto.randomUUID(),
                text: `⚔️ ${lastLog.message}`,
                by: {
                    id: 'combat-system',
                    name: '⚔️ Combate',
                    image: '/assets/combat-icon.png',
                    isBot: true
                },
                timestamp: new Date().toISOString(),
                type: 'combat_log'
            })
        }

        // Salva só o estado do combate (caminho de campo): o resto da campanha (presença, notas, jogadores)
        // pode ter mudado desde a leitura no início da requisição, e regravá-la inteira desfazia isso
        const plainCombat = JSON.parse(JSON.stringify(campaign.session.combat))

        await adminUpdateDoc('campaigns', campaign.id, { 'session.combat': plainCombat })

        // Histórico (best effort: o combate já foi salvo, e falhar aqui só deixa a ação sem "Desfazer")
        try {
            if (action === 'start') {
                await deleteCombatEvents(campaign.id)
            } else if (undoneEventId) {
                await markCombatEventUndone(campaign.id, undoneEventId, user.name || 'Mestre')
            } else if (snapshotBefore) {
                const snapshotAfter = snapshotCombat(campaign.session.combat)
                const changes = diffSnapshots(snapshotBefore, snapshotAfter)
                const sheets = sheetsBefore ? diffSheetVitals(sheetsBefore, await readPlayerVitals(campaign.session.combat)) : []
                if (changes.length > 0 || sheets.length > 0) {
                    const names = Object.fromEntries([ ...snapshotBefore.order, ...snapshotAfter.order ].map(combatantId => [
                        combatantId, String((snapshotAfter.combatants[combatantId] ?? snapshotBefore.combatants[combatantId])?.['name'] ?? '')
                    ]))
                    await recordCombatEvent(campaign.id, {
                        action,
                        label: getActionMessage(action),
                        byUserId: user.id,
                        byName: user.name || 'Jogador',
                        changes,
                        sheets,
                        summary: summarizeChanges(changes, names, sheets)
                    })
                }
            }
        } catch (error) {
            console.error('[Combat API] Erro ao registrar o evento no histórico:', error)
        }

        if (combatMessage) {
            try {
                await appendCampaignMessage(campaign.id, combatMessage)
            } catch (error) {
                // O combate já foi salvo; o registro no chat é só o aviso
                console.error('[Combat API] Erro ao registrar o log no chat:', error)
            }
        }

        // Registra estatísticas da campanha (não bloqueia o fluxo em caso de erro)
        if (statsEntries.length > 0) {
            await recordCampaignStats(campaign.id, statsEntries)
        }

        // Notifica os clientes via Pusher
        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.COMBAT_UPDATED,
            { combat: campaign.session.combat, action }
        )

        return NextResponse.json({
            success: true,
            combat: campaign.session.combat,
            message: getActionMessage(action),
            ...(warnings.length > 0 ? { warnings } : {})
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao executar ação de combate')
    } finally {
        await lock?.release()
    }
}

/**
 * GET - Retorna o estado atual do combate
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignMember(id, user)

        return NextResponse.json({
            success: true,
            combat: campaign.session?.combat || null,
            isActive: campaign.session?.combat?.isActive || false
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar combate')
    }
}
