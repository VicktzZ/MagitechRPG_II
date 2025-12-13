import { type NextRequest, NextResponse } from 'next/server'
import { campaignRepository, charsheetRepository } from '@repositories'
import type { Charsheet } from '@models/entities'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params
        const { action, charsheetIds, amount } = await request.json()

        if (!campaignId || !action || !charsheetIds?.length) {
            return NextResponse.json(
                { error: 'Parâmetros inválidos' },
                { status: 400 }
            )
        }

        // Verifica se a campanha existe
        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        const campaignCode = campaign.campaignCode

        let updatedCount = 0

        for (const charsheetId of charsheetIds) {
            const charsheet = await charsheetRepository.findById(charsheetId)
            if (!charsheet) continue

            const updateData: Partial<Charsheet> = {}

            const sessions = charsheet.session || []
            const sessionIndex = sessions.findIndex(s => s.campaignCode === campaignCode)
            let updatedSessions = sessions

            switch (action) {
            case 'restoreLP': {
                // Restaura LP ao máximo (stats base)
                updateData.stats = {
                    ...charsheet.stats,
                    lp: charsheet.stats?.maxLp || 0
                }

                // Também restaura LP na sessão da campanha, se existir
                if (sessionIndex >= 0) {
                    const currentSession = sessions[sessionIndex]
                    const sessionStats = currentSession.stats || ({} as any)
                    const maxLp = sessionStats.maxLp ?? charsheet.stats?.maxLp ?? 0

                    updatedSessions = [ ...sessions ]
                    updatedSessions[sessionIndex] = {
                        ...currentSession,
                        stats: {
                            ...sessionStats,
                            lp: maxLp,
                            maxLp
                        }
                    }

                    updateData.session = updatedSessions as any
                }
                break
            }
            case 'restoreMP': {
                // Restaura MP ao máximo (stats base)
                updateData.stats = {
                    ...charsheet.stats,
                    mp: charsheet.stats?.maxMp || 0
                }

                // Também restaura MP na sessão da campanha, se existir
                if (sessionIndex >= 0) {
                    const currentSession = sessions[sessionIndex]
                    const sessionStats = currentSession.stats || ({} as any)
                    const maxMp = sessionStats.maxMp ?? charsheet.stats?.maxMp ?? 0

                    updatedSessions = [ ...sessions ]
                    updatedSessions[sessionIndex] = {
                        ...currentSession,
                        stats: {
                            ...sessionStats,
                            mp: maxMp,
                            maxMp
                        }
                    }

                    updateData.session = updatedSessions as any
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
        console.error('Erro ao executar ação em massa:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
