import { NextRequest, NextResponse } from 'next/server'
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

        let updatedCount = 0

        for (const charsheetId of charsheetIds) {
            const charsheet = await charsheetRepository.findById(charsheetId)
            if (!charsheet) continue

            const updateData: Partial<Charsheet> = {}

            switch (action) {
            case 'restoreLP':
                // Restaura LP ao máximo
                updateData.stats = {
                    ...charsheet.stats,
                    lp: charsheet.stats?.maxLp || 0
                }
                break
            case 'restoreMP':
                // Restaura MP ao máximo
                updateData.stats = {
                    ...charsheet.stats,
                    mp: charsheet.stats?.maxMp || 0
                }
                break
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
