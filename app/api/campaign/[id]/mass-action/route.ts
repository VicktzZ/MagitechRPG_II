import { type NextRequest, NextResponse } from 'next/server'
import { charsheetRepository } from '@repositories'
import { assertCharsheetsInCampaign, assertIdList, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api'
import type { Charsheet } from '@models/entities'
import { recordCampaignStats, type StatsEntry } from '@utils/campaignStatsHelper'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)
        const campaignId = campaign.id

        const { action, charsheetIds: rawCharsheetIds, amount } = await readJsonBody(request)

        if (!action || !rawCharsheetIds?.length) {
            return NextResponse.json(
                { error: 'Parâmetros inválidos' },
                { status: 400 }
            )
        }
        if (amount !== undefined && (typeof amount !== 'number' || !Number.isFinite(amount) || Math.abs(amount) > 1_000_000)) {
            return NextResponse.json({ error: 'Quantia inválida' }, { status: 400 })
        }

        // Só fichas de jogadores desta campanha
        const charsheetIds = assertIdList(rawCharsheetIds, 'charsheetIds')
        assertCharsheetsInCampaign(campaign, charsheetIds)

        if (campaign.status === 'finished') {
            return NextResponse.json(
                { error: 'Campanha finalizada — ações em massa bloqueadas' },
                { status: 403 }
            )
        }

        let updatedCount = 0
        const statsEntries: StatsEntry[] = []

        for (const charsheetId of charsheetIds) {
            const charsheet = await charsheetRepository.findById(charsheetId)
            if (!charsheet) continue

            const updateData: Partial<Charsheet> = {}

            switch (action) {
            case 'restoreLP': {
                // Restaura LP ao máximo
                const restoredLp = (charsheet.stats?.maxLp || 0) - (charsheet.stats?.lp || 0)
                updateData.stats = {
                    ...charsheet.stats,
                    lp: charsheet.stats?.maxLp || 0
                }
                if (restoredLp > 0) {
                    statsEntries.push({ gm: true, inc: { healingDone: restoredLp } })
                    statsEntries.push({
                        charsheetId,
                        userId: charsheet.userId,
                        charsheetName: charsheet.name,
                        inc: { 'combat.healingReceived': restoredLp }
                    })
                }
                break
            }
            case 'restoreMP': {
                // Restaura MP ao máximo
                updateData.stats = {
                    ...charsheet.stats,
                    mp: charsheet.stats?.maxMp || 0
                }
                break
            }
            case 'addMoney':
                // Adiciona dinheiro
                if (!charsheet.inventory) {
                    charsheet.inventory = { items: [], money: 0 }
                }
                const currentMoney = charsheet.inventory.money || 0
                const newMoney = currentMoney + (amount || 0)

                updateData.inventory = {
                    ...charsheet.inventory,
                    items: charsheet.inventory.items || [],
                    money: newMoney
                }
                if ((amount || 0) > 0) {
                    statsEntries.push({ gm: true, inc: { moneyGiven: amount } })
                    statsEntries.push({
                        charsheetId,
                        userId: charsheet.userId,
                        charsheetName: charsheet.name,
                        inc: { 'resources.moneyEarned': amount }
                    })
                }
                console.log(`[AddMoney] Charsheet ${charsheetId}: ${currentMoney} + ${amount} = ${newMoney}`)
                break
            default:
                continue
            }

            // Merge dos dados e conversão para objeto plano
            const updatedCharsheet = { ...charsheet, ...updateData }
            const plainCharsheet = JSON.parse(JSON.stringify(updatedCharsheet))

            await charsheetRepository.update(plainCharsheet)
            updatedCount++
        }

        if (statsEntries.length > 0) {
            await recordCampaignStats(campaignId, statsEntries)
        }

        const actionMessages = {
            restoreLP: 'LP restaurado',
            restoreMP: 'MP restaurado',
            addMoney: `¢${amount} adicionado`
        }

        return NextResponse.json({
            success: true,
            message: `${actionMessages[action as keyof typeof actionMessages]} para ${updatedCount} personagem(ns)`,
            updatedCount
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao executar ação em massa')
    }
}
