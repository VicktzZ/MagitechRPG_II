import { NextResponse, type NextRequest } from 'next/server'
import { charsheetEntity, campaignEntity } from '@utils/firestoreEntities'

interface RogueliteLevelUpBody {
    charsheetIds: string[]
}

/**
 * Endpoint para Level Up no modo Roguelite
 * Regras:
 * - Jogadores sobem de 5 em 5 níveis
 * - Atributos (VIG, CAR, LOG, DES, FOC, SAB) +5
 * - Modificadores de atributos +1 (exceto discount)
 * - Perícias +1
 * - Espaços de magia +2
 * - Capacidade máxima +2.0kg
 * - Dinheiro +250
 * - LP máximo +10 (e cura total)
 * - MP máximo +5 (e restaura total)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id: campaignId } = await params
        const body: RogueliteLevelUpBody = await request.json()
        const { charsheetIds } = body

        if (!charsheetIds || charsheetIds.length === 0) {
            return NextResponse.json(
                { error: 'Nenhum charsheet selecionado' },
                { status: 400 }
            )
        }

        // Verifica se a campanha existe e é Roguelite
        const campaign = await campaignEntity.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        if (campaign.mode !== 'Roguelite') {
            return NextResponse.json(
                { error: 'Esta ação só é válida para campanhas Roguelite' },
                { status: 400 }
            )
        }

        const results: Array<{ charsheetId: string; success: boolean; newLevel?: number; error?: string }> = []

        for (const charsheetId of charsheetIds) {
            try {
                const charsheet = await charsheetEntity.findById(charsheetId)
                if (!charsheet) {
                    results.push({ charsheetId, success: false, error: 'Charsheet não encontrada' })
                    continue
                }

                // Calcula novo nível (+5)
                const newLevel = (charsheet.level || 0) + 5

                // Atributos +5 cada (vig, car, log, des, foc, sab)
                const currentAttributes = charsheet.attributes || {}
                const updatedAttributes = {
                    vig: (currentAttributes.vig || 0) + 5,
                    car: (currentAttributes.car || 0) + 5,
                    log: (currentAttributes.log || 0) + 5,
                    des: (currentAttributes.des || 0) + 5,
                    foc: (currentAttributes.foc || 0) + 5,
                    sab: (currentAttributes.sab || 0) + 5
                }

                // Modificadores de atributos +1 cada (exceto discount)
                const currentMods = charsheet.mods || { attributes: {}, discount: -10 }
                const currentModsAttributes = currentMods.attributes || {}
                const updatedMods = {
                    ...currentMods,
                    attributes: {
                        vig: (currentModsAttributes.vig || 0) + 1,
                        car: (currentModsAttributes.car || 0) + 1,
                        log: (currentModsAttributes.log || 0) + 1,
                        des: (currentModsAttributes.des || 0) + 1,
                        foc: (currentModsAttributes.foc || 0) + 1,
                        sab: (currentModsAttributes.sab || 0) + 1
                    }
                    // discount permanece inalterado
                }

                // Perícias +1 cada
                const currentExpertises = charsheet.expertises || {}
                const updatedExpertises: Record<string, any> = {}
                for (const [ key, expertise ] of Object.entries(currentExpertises)) {
                    if (typeof expertise === 'object' && expertise !== null) {
                        updatedExpertises[key] = {
                            ...(expertise ),
                            value: ((expertise ).value || 0) + 1
                        }
                    } else {
                        updatedExpertises[key] = expertise
                    }
                }

                // Nível de ORM +1
                const newORMLevel = (charsheet.ORMLevel || 0) + 1

                // Espaços de magia +2
                const newSpellSpace = (charsheet.spellSpace || 0) + 2

                // Capacidade máxima +2.0kg
                const currentCapacity = charsheet.capacity || { cargo: 0, max: 5 }
                const newCapacityMax = (currentCapacity.max || 5) + 2.0

                // Dinheiro +250
                const currentInventory = charsheet.inventory || { items: [], money: 0 }
                const newMoney = (currentInventory.money || 0) + 250

                // Encontrar a sessão da campanha ANTES de calcular stats
                const sessions = charsheet.session || []
                const sessionIndex = sessions.findIndex((s: any) => s.campaignCode === campaign.campaignCode)
                
                // Obter stats atuais DA SESSÃO (não stats globais)
                const currentSessionStats = sessionIndex >= 0 
                    ? sessions[sessionIndex].stats 
                    : charsheet.stats || { lp: 100, maxLp: 100, mp: 50, maxMp: 50, ap: 6, maxAp: 6 };
                
                // Stats: Aumentar MÁXIMOS em +10 LP e +5 MP, e restaurar aos novos máximos
                const newMaxLp = (currentSessionStats.maxLp || currentSessionStats.lp || 100) + 10
                const newMaxMp = (currentSessionStats.maxMp || currentSessionStats.mp || 50) + 5
                const newMaxAp = currentSessionStats.maxAp || currentSessionStats.ap || 6  // AP não muda

                // Atualiza a sessão da campanha com os novos stats
                const updatedSessions = [ ...sessions ]
                if (sessionIndex >= 0) {
                    updatedSessions[sessionIndex] = {
                        ...updatedSessions[sessionIndex],
                        stats: {
                            ...currentSessionStats,
                            maxLp: newMaxLp,
                            maxMp: newMaxMp,
                            maxAp: newMaxAp,
                            lp: newMaxLp, // Restaura ao novo máximo
                            mp: newMaxMp, // Restaura ao novo máximo
                            ap: newMaxAp  // Mantém AP
                        }
                    }
                } else {
                    // Se não existe sessão ainda, criar uma
                    updatedSessions.push({
                        campaignCode: campaign.campaignCode,
                        stats: {
                            maxLp: newMaxLp,
                            maxMp: newMaxMp,
                            maxAp: newMaxAp,
                            lp: newMaxLp,
                            mp: newMaxMp,
                            ap: newMaxAp
                        }
                    })
                }

                // Aplica as atualizações
                await charsheetEntity.update(charsheetId, {
                    level: newLevel,
                    ORMLevel: newORMLevel,
                    attributes: updatedAttributes,
                    mods: updatedMods,
                    expertises: updatedExpertises,
                    spellSpace: newSpellSpace,
                    capacity: {
                        ...currentCapacity,
                        max: newCapacityMax
                    },
                    inventory: {
                        ...currentInventory,
                        money: newMoney
                    },
                    // Stats globais permanecem inalterados
                    // stats: charsheet.stats, // Não atualiza stats globais
                    // Atualiza apenas a sessão específica da campanha
                    session: updatedSessions
                })

                results.push({ charsheetId, success: true, newLevel })
            } catch (error) {
                console.error(`Erro ao evoluir charsheet ${charsheetId}:`, error)
                results.push({ charsheetId, success: false, error: 'Erro interno' })
            }
        }

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        return NextResponse.json({
            success: true,
            message: `${successCount} personagem(ns) evoluído(s) com sucesso${failCount > 0 ? `, ${failCount} falha(s)` : ''}`,
            results
        })

    } catch (error) {
        console.error('Erro no roguelite-levelup:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
