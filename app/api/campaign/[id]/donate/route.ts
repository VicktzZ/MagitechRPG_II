import { charsheetRepository, campaignRepository } from '@repositories'
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId'

interface DonateRequestBody {
    donorCharsheetId: string
    targetCharsheetId: string
    targetUserId: string
    itemType: 'weapon' | 'armor' | 'item'
    item: any
    donorName: string
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API Donate] Iniciando requisição de doação')
        
        const { id: campaignId } = params
        const body: DonateRequestBody = await request.json()
        const { donorCharsheetId, targetCharsheetId, targetUserId, itemType, item, donorName } = body
        
        console.log('[API Donate] Dados recebidos:', {
            campaignId,
            donorCharsheetId,
            targetCharsheetId,
            targetUserId,
            itemType,
            itemName: item?.name,
            donorName
        })

        // Validação básica
        if (!targetCharsheetId || !itemType || !item) {
            return Response.json(
                { success: false, message: 'Dados incompletos para doação' },
                { status: 400 }
            )
        }

        // Busca o charsheet do destinatário
        const targetCharsheet = await charsheetRepository.whereEqualTo('id', targetCharsheetId).findOne()

        if (!targetCharsheet) {
            return Response.json(
                { success: false, message: 'Personagem do destinatário não encontrado' },
                { status: 404 }
            )
        }

        console.log('[API Donate] Charsheet do destinatário:', {
            id: targetCharsheet.id,
            name: targetCharsheet.name,
            weaponsCount: targetCharsheet.inventory?.weapons?.length || 0,
            armorsCount: targetCharsheet.inventory?.armors?.length || 0
        })

        // Verifica limites de peso do destinatário
        const currentCargo = targetCharsheet?.capacity?.cargo || 0
        const maxCargo = targetCharsheet?.capacity?.max || 0
        const itemWeight = item.weight || 0
        const newCargo = parseFloat((currentCargo + itemWeight).toFixed(1))
        
        if (maxCargo > 0 && newCargo > maxCargo) {
            return Response.json(
                { success: false, message: `${targetCharsheet.name || 'O jogador'} não possui capacidade de peso suficiente. (${currentCargo.toFixed(1)}+${itemWeight}>${maxCargo}kg)` },
                { status: 400 }
            )
        }

        // Verifica limites específicos por tipo
        if (itemType === 'weapon') {
            const currentWeapons = targetCharsheet?.inventory?.weapons || []
            if (currentWeapons.length >= 2) {
                return Response.json(
                    { success: false, message: `${targetCharsheet.name || 'O jogador'} já possui 2 armas. Ele precisa remover uma arma antes de receber a doação.` },
                    { status: 400 }
                )
            }
        } else if (itemType === 'armor') {
            const currentArmors = targetCharsheet?.inventory?.armors || []
            if (currentArmors.length >= 1) {
                return Response.json(
                    { success: false, message: `${targetCharsheet.name || 'O jogador'} já possui uma armadura. Ele precisa remover a armadura antes de receber a doação.` },
                    { status: 400 }
                )
            }
        }
        // Para itens, só precisa verificar peso (já feito acima)

        // Prepara a atualização do charsheet
        const newItem = { ...item, id: crypto.randomUUID() }

        // Adiciona notificação de doação ao destinatário
        const notification = {
            id: crypto.randomUUID(),
            type: 'donation',
            donorName,
            itemName: item.name,
            itemType,
            itemRarity: item.rarity,
            createdAt: new Date().toISOString(),
            read: false
        }

        const currentNotifications = targetCharsheet.notifications || []

        if (itemType === 'weapon') {
            const currentWeapons = targetCharsheet?.inventory?.weapons || []
            await charsheetRepository.update({
                ...targetCharsheet,
                inventory: {
                    ...targetCharsheet.inventory,
                    weapons: [...currentWeapons, newItem]
                },
                capacity: {
                    ...targetCharsheet.capacity,
                    cargo: newCargo
                },
                notifications: [...currentNotifications, notification]
            })
        } else if (itemType === 'armor') {
            const currentArmors = targetCharsheet?.inventory?.armors || []
            const armorAP = item.ap || item.value || 0
            
            // Busca a campanha para obter o campaignCode
            const campaign = await findCampaignByCodeOrId(campaignId)
            const campaignCode = campaign?.campaignCode
            
            // Encontra a sessão correta do destinatário
            const sessions = targetCharsheet?.session || []
            const sessionIndex = sessions.findIndex((s: any) => s.campaignCode === campaignCode)
            
            let updatedSessions = sessions
            if (sessionIndex >= 0) {
                const currentSession = sessions[sessionIndex]
                const currentSessionAP = currentSession?.stats?.ap || 5
                const currentSessionMaxAP = currentSession?.stats?.maxAp || 5
                
                updatedSessions = [...sessions]
                updatedSessions[sessionIndex] = {
                    ...currentSession,
                    stats: {
                        ...currentSession.stats,
                        ap: currentSessionAP + armorAP,
                        maxAp: currentSessionMaxAP + armorAP
                    }
                }
            }
            
            await charsheetRepository.update({
                ...targetCharsheet,
                inventory: {
                    ...targetCharsheet.inventory,
                    armors: [...currentArmors, newItem]
                },
                capacity: {
                    ...targetCharsheet.capacity,
                    cargo: newCargo
                },
                session: updatedSessions,
                notifications: [...currentNotifications, notification]
            })
        } else if (itemType === 'item') {
            // Doação de item genérico
            const currentItems = targetCharsheet?.inventory?.items || []
            await charsheetRepository.update({
                ...targetCharsheet,
                inventory: {
                    ...targetCharsheet.inventory,
                    items: [...currentItems, newItem]
                },
                capacity: {
                    ...targetCharsheet.capacity,
                    cargo: newCargo
                },
                notifications: [...currentNotifications, notification]
            })
        }

        console.log('[API Donate] Item doado com sucesso:', {
            itemName: item.name,
            to: targetCharsheet.name
        })

        return Response.json({
            success: true,
            message: `${item.name} foi doado para ${targetCharsheet.name || 'o jogador'}!`
        })

    } catch (error) {
        console.error('[Donate API] Erro:', error)
        return Response.json(
            { success: false, message: 'Erro ao processar doação' },
            { status: 500 }
        )
    }
}
