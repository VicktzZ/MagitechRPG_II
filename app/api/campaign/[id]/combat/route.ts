import { type NextRequest, NextResponse } from 'next/server'
import { campaignRepository, charsheetRepository } from '@repositories'
import { Combat, Combatant, CombatLog } from '@models'
import { pusherServer } from '@utils/pusher'
import { PusherEvent } from '@enums'

type CombatAction = 
    | 'start'           // Iniciar combate
    | 'end'             // Encerrar combate
    | 'roll_initiative' // Rolar iniciativa para um combatente
    | 'set_initiative'  // Definir ordem de iniciativa (após todos rolarem)
    | 'next_turn'       // Passar para o próximo turno
    | 'apply_damage'    // Aplicar dano a um alvo
    | 'apply_heal'      // Aplicar cura a um alvo
    | 'add_creature'    // Adicionar criatura ao combate
    | 'remove_combatant' // Remover combatente

interface CombatRequest {
    action: CombatAction
    combatantId?: string       // ID do combatente que está agindo
    targetId?: string          // ID do alvo (para dano/cura)
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
    showEnemyLp?: boolean     // Se mostra LP dos inimigos para jogadores
    advantageType?: 'normal' | 'advantage' | 'disadvantage' // Para rolagem de iniciativa
}

/**
 * Rola um d20
 */
function rollD20(): number {
    return Math.floor(Math.random() * 20) + 1
}

/**
 * Rola iniciativa com possível vantagem/desvantagem
 */

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params
        const body: CombatRequest = await request.json()
        const { action } = body

        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        }

        // Inicializa combat se não existir
        if (!campaign.session) {
            campaign.session = { users: [], messages: [] } as any
        }
        if (!campaign.session.combat) {
            campaign.session.combat = new Combat()
        }

        const combat = campaign.session.combat

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
                maxMp: p.maxMp
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
                maxMp: c.maxMp
            }))

            combat.isActive = true
            combat.phase = 'INITIATIVE'
            combat.round = 1
            combat.currentTurnIndex = 0
            combat.combatants = [ ...playerCombatants, ...creatureCombatants ]
            combat.logs = []
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

            break
        }

        case 'end': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            combat.isActive = false
            combat.phase = 'ENDED'
            combat.endedAt = new Date().toISOString()

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

            let numDice = 1
            let expertiseValue = 0
            const rolls: number[] = []

            try {
                if (combatant.type === 'player') {
                    const charsheet = await charsheetRepository.findById(combatant.id)
                    if (charsheet) {
                        const agiExpertise = (charsheet as any).expertises?.Agilidade
                        expertiseValue = Number(agiExpertise?.value ?? 0) || 0

                        const defaultAttrKey = (agiExpertise?.defaultAttribute ?? 'des') as string
                        let modsValue = Number((charsheet as any).mods?.attributes?.[defaultAttrKey] ?? 1)
                        if (!Number.isFinite(modsValue) || modsValue < 1) modsValue = 1
                        numDice = modsValue
                    }
                } else if (combatant.type === 'creature') {
                    const creatures = (campaign as any).custom?.creatures || []
                    let baseId = combatant.id
                    const lastDashIndex = baseId.lastIndexOf('-')
                    if (lastDashIndex > 0) {
                        const possibleBaseId = baseId.slice(0, lastDashIndex)
                        if (creatures.some((c: any) => c.id === possibleBaseId)) {
                            baseId = possibleBaseId
                        }
                    }

                    const baseCreature = creatures.find((c: any) => c.id === baseId)
                    if (baseCreature) {
                        const agiExpertise = (baseCreature.expertises )?.Agilidade
                        expertiseValue = Number(agiExpertise?.value ?? 0) || 0

                        const defaultAttrKey = (agiExpertise?.defaultAttribute ?? 'des') as string
                        const attrValue = Number(baseCreature.attributes?.[defaultAttrKey] ?? 0) || 0
                        // Nova fórmula: 0=-1, 5=1, 10=2, 15=3, 20=4, 30+=5
                        let attrMod = attrValue === 0 ? -1 : Math.min(5, Math.floor(attrValue / 5))
                        if (!Number.isFinite(attrMod) || attrMod < 1) attrMod = 1
                        numDice = attrMod
                    }
                }
            } catch (err) {
                console.error('[Combat API] Erro ao calcular iniciativa avançada:', err)
            }

            if (!Number.isFinite(numDice) || numDice < 1) numDice = 1
            if (!Number.isFinite(expertiseValue)) expertiseValue = 0

            let roll: number

            // Se um valor foi passado (rolado manualmente), usa ele como resultado do dado
            if (typeof value === 'number' && value > 0) {
                roll = value
            } else {
                for (let i = 0; i < numDice; i++) {
                    rolls.push(rollD20())
                }
                roll = rolls.length > 1 ? Math.max(...rolls) : rolls[0]
            }

            combatant.initiativeBonus = expertiseValue
            combatant.initiativeRoll = roll
            combatant.initiativeTotal = roll + expertiseValue
            
            console.log('[Combat API] Iniciativa atualizada:', {
                name: combatant.name,
                roll,
                numDice,
                expertiseValue,
                total: combatant.initiativeTotal
            })

            const rollsDisplay = rolls.length > 0
                ? `[${rolls.join(', ')}]${rolls.length > 1 ? `: ${roll}` : ''}`
                : `${roll}`

            combat.logs.push(new CombatLog({
                round: combat.round,
                type: 'initiative',
                actorId: combatant.id,
                actorName: combatant.name,
                value: combatant.initiativeTotal,
                message: `🎲 **${combatant.name}** rolou iniciativa: ${numDice}d20 (${rollsDisplay}) + ${expertiseValue} AGI = **${combatant.initiativeTotal}**`
            }))

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
                combat.combatants.forEach(c => {
                    c.hasActed = false
                    c.initiativeRoll = 0
                    c.initiativeTotal = 0
                })
                combat.phase = 'INITIATIVE'
                combat.currentTurnIndex = 0

                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'phase_change',
                    actorId: 'system',
                    actorName: 'Sistema',
                    message: `🔄 **Round ${combat.round}!**\nFase de Iniciativa — todos devem rolar novamente.`
                }))
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
                    combat.combatants.forEach(c => {
                        c.hasActed = false
                        c.initiativeRoll = 0
                        c.initiativeTotal = 0
                    })
                    combat.phase = 'INITIATIVE'
                    combat.currentTurnIndex = 0

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
                    combat.logs.push(new CombatLog({
                        round: combat.round,
                        type: 'turn_pass',
                        actorId: currentCombatant?.id || 'system',
                        actorName: currentCombatant?.name || 'Sistema',
                        message: `➡️ **${currentCombatant?.name || 'Alguém'}** passou o turno.\n🎯 Vez de **${nextCombatant.name}**!`
                    }))
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
            const target = combat.combatants.find(c => c.id === targetId)

            if (!target) {
                return NextResponse.json({ error: 'Alvo não encontrado' }, { status: 404 })
            }

            const oldLp = target.currentLp || 0

            target.currentLp = Math.max(0, oldLp - damage)

            // Se for jogador, atualiza charsheet.stats diretamente
            if (target.type === 'player') {
                const charsheet = await charsheetRepository.findById(target.id)
                if (charsheet) {
                    await charsheetRepository.update({
                        ...charsheet,
                        stats: {
                            ...charsheet.stats,
                            lp: target.currentLp
                        }
                    })
                }
            }

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
            const healTarget = combat.combatants.find(c => c.id === healTargetId)

            if (!healTarget) {
                return NextResponse.json({ error: 'Alvo não encontrado' }, { status: 404 })
            }

            const oldHp = healTarget.currentLp || 0
            const maxHp = healTarget.maxLp || 999
            
            healTarget.currentLp = Math.min(maxHp, oldHp + heal)

            // Se for jogador, atualiza charsheet.stats diretamente
            if (healTarget.type === 'player') {
                const charsheet = await charsheetRepository.findById(healTarget.id)
                if (charsheet) {
                    await charsheetRepository.update({
                        ...charsheet,
                        stats: {
                            ...charsheet.stats,
                            lp: healTarget.currentLp
                        }
                    })
                }
            }

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

            break
        }

        case 'add_creature': {
            if (!combat.isActive) {
                return NextResponse.json({ error: 'Não há combate ativo' }, { status: 400 })
            }

            const { creatures: newCreatures = [] } = body
            
            for (const creature of newCreatures) {
                const combatant = new Combatant({
                    id: creature.id,
                    name: creature.name,
                    type: 'creature',
                    initiativeBonus: creature.agility || 0,
                    currentLp: creature.lp,
                    maxLp: creature.maxLp
                })
                combat.combatants.push(combatant)

                combat.logs.push(new CombatLog({
                    round: combat.round,
                    type: 'action',
                    actorId: 'system',
                    actorName: 'Sistema',
                    message: `➕ **${creature.name}** entrou no combate!`
                }))
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

        default:
            return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
        }

        // Adiciona o último log como mensagem no chat (se houver)
        if (combat.logs.length > 0) {
            const lastLog = combat.logs[combat.logs.length - 1]
            const combatMessage = {
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
            }
            
            if (!campaign.session.messages) {
                campaign.session.messages = []
            }
            campaign.session.messages.push(combatMessage)
        }

        // Salva a campanha atualizada
        const plainCampaign = JSON.parse(JSON.stringify(campaign))
        
        await campaignRepository.update(plainCampaign)

        // Notifica os clientes via Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.COMBAT_UPDATED,
            { combat: campaign.session.combat, action }
        )

        return NextResponse.json({
            success: true,
            combat: campaign.session.combat,
            message: getActionMessage(action)
        })

    } catch (error) {
        console.error('[Combat API] Erro:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
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
        remove_combatant: 'Combatente removido'
    }
    return messages[action] || 'Ação executada'
}

/**
 * GET - Retorna o estado atual do combate
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params

        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            combat: campaign.session?.combat || null,
            isActive: campaign.session?.combat?.isActive || false
        })

    } catch (error) {
        console.error('[Combat API] Erro ao buscar combate:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
