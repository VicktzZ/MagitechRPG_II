import { NextResponse, type NextRequest } from 'next/server'
import { campaignEntity, charsheetEntity } from '@utils/firestoreEntities'
import { savePerkToCharsheet } from '@features/roguelite/utils'

interface PurchaseBody {
    charsheetId: string
    itemId: string
    item: {
        id: string
        name: string
        perkType: string
        rarity: string
        price: number
        data?: any
    }
}

/**
 * Endpoint para comprar um item da loja
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id: campaignId } = await params
        const body: PurchaseBody = await request.json()
        const { charsheetId, itemId, item } = body

        if (!charsheetId || !itemId || !item) {
            return NextResponse.json(
                { error: 'Dados incompletos' },
                { status: 400 }
            )
        }

        // Verifica campanha
        const campaign = await campaignEntity.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        if (!campaign.shop?.isOpen) {
            return NextResponse.json(
                { error: 'A loja está fechada' },
                { status: 400 }
            )
        }

        // Verifica charsheet
        const charsheet = await charsheetEntity.findById(charsheetId)
        if (!charsheet) {
            return NextResponse.json(
                { error: 'Personagem não encontrado' },
                { status: 404 }
            )
        }

        // Verifica dinheiro
        const currentMoney = charsheet.inventory?.money || 0
        if (currentMoney < item.price) {
            return NextResponse.json(
                { error: 'Dinheiro insuficiente' },
                { status: 400 }
            )
        }

        // Verifica se o item ainda está disponível na loja
        const shopItems = campaign.shop?.items || []
        const shopItem = shopItems.find((i: any) => i.id === itemId)
        if (!shopItem) {
            return NextResponse.json(
                { error: 'Item não disponível na loja' },
                { status: 400 }
            )
        }

        // Aplica o perk ao charsheet
        // Garante que perkType está presente no perk
        const baseData = item.data || {}
        const perkToSave = {
            ...baseData,
            name: baseData.name || item.name,
            perkType: baseData.perkType || item.perkType,
            rarity: baseData.rarity || item.rarity,
            rogueliteRarity: baseData.rogueliteRarity || item.rarity
        }

        console.log('[shop/purchase] Salvando perk:', { 
            name: perkToSave.name, 
            perkType: perkToSave.perkType 
        })

        const result = await savePerkToCharsheet({
            perk: perkToSave,
            charsheetId,
            campaignCode: campaign.campaignCode,
            campaignMode: campaign.mode,
            currentCharsheet: charsheet
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || 'Erro ao aplicar item' },
                { status: 500 }
            )
        }

        // Deduz o dinheiro
        const newMoney = currentMoney - item.price
        await charsheetEntity.update(charsheetId, {
            'inventory.money': newMoney
        })

        // Remove o item da loja
        const updatedShopItems = shopItems.filter((i: any) => i.id !== itemId)
        await campaignEntity.update(campaignId, {
            'shop.items': updatedShopItems
        })

        return NextResponse.json({
            success: true,
            message: `${item.name} comprado com sucesso!`,
            newMoney,
            perkResult: result
        })

    } catch (error) {
        console.error('Erro ao comprar item:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
