import { NextResponse, type NextRequest } from 'next/server'
import { campaignEntity } from '@utils/firestoreEntities'

interface ShopConfig {
    itemCount: number
    rarities: string[]
    types: string[]
    itemKinds: string[]
    priceMultiplier: number
    currency?: 'SCRAP' | 'YEN'
    visibleToAll?: boolean
    visibleToPlayers?: string[]
}

interface ShopBody {
    isOpen: boolean
    config?: ShopConfig
}

/**
 * Endpoint para gerenciar a loja da campanha
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id: campaignId } = await params
        const body: ShopBody = await request.json()
        const { isOpen, config } = body

        // Verifica se a campanha existe
        const campaign = await campaignEntity.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        // Atualiza a configuração da loja
        const shopData = isOpen && config ? {
            isOpen: true,
            itemCount: config.itemCount || 5,
            rarities: config.rarities || [],
            types: config.types || [],
            itemKinds: config.itemKinds || [],
            priceMultiplier: config.priceMultiplier || 1.0,
            currency: config.currency || 'SCRAP',
            visibleToAll: config.visibleToAll ?? true,
            visibleToPlayers: config.visibleToPlayers || [],
            lastUpdated: new Date().toISOString(),
            items: [] // Será preenchido quando jogadores acessarem
        } : {
            isOpen: false,
            lastUpdated: new Date().toISOString()
        }

        await campaignEntity.update(campaignId, {
            shop: shopData
        })

        return NextResponse.json({
            success: true,
            message: isOpen ? 'Loja aberta com sucesso!' : 'Loja fechada.',
            shop: shopData
        })

    } catch (error) {
        console.error('Erro ao gerenciar loja:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

/**
 * Endpoint para obter itens da loja para jogadores
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id: campaignId } = await params

        const campaign = await campaignEntity.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        if (!campaign.shop?.isOpen) {
            return NextResponse.json({
                success: false,
                message: 'A loja está fechada',
                isOpen: false
            })
        }

        // Se a loja está aberta, retorna a configuração
        return NextResponse.json({
            success: true,
            isOpen: true,
            shop: campaign.shop
        })

    } catch (error) {
        console.error('Erro ao obter loja:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
