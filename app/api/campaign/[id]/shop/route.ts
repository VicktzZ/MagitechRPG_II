import { NextResponse, type NextRequest } from 'next/server'
import { campaignEntity } from '@utils/firestoreEntities'
import { assertIdList, badRequest, handleRouteError, readJsonBody, requireCampaignGM, requireCampaignMember, requireUser } from '@utils/api'

/** Lista opcional de textos curtos (raridades, tipos, categorias) */
function assertShortStringList(value: unknown, field: string): void {
    if (value === undefined) return
    if (!Array.isArray(value) || value.length > 50 || value.some(v => typeof v !== 'string' || v.length > 60)) {
        throw badRequest(`"${field}" inválido`)
    }
}

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
): Promise<Response> {
    try {
        const { id } = await params
        const user = await requireUser()
        // Abrir/fechar/configurar a loja é ação do mestre
        const { campaign: authorizedCampaign } = await requireCampaignGM(id, user)
        const campaignId = authorizedCampaign.id

        const body: ShopBody = await readJsonBody(request)
        const { isOpen, config } = body

        if (config) {
            if (config.itemCount !== undefined && (!Number.isInteger(config.itemCount) || config.itemCount < 1 || config.itemCount > 50)) {
                throw badRequest('"itemCount" deve ser um inteiro entre 1 e 50')
            }
            if (config.priceMultiplier !== undefined && (typeof config.priceMultiplier !== 'number' || !(config.priceMultiplier > 0) || config.priceMultiplier > 100)) {
                throw badRequest('"priceMultiplier" deve ser um número entre 0 e 100')
            }
            if (config.currency !== undefined && config.currency !== 'SCRAP' && config.currency !== 'YEN') {
                throw badRequest('"currency" inválida')
            }
            assertShortStringList(config.rarities, 'rarities')
            assertShortStringList(config.types, 'types')
            assertShortStringList(config.itemKinds, 'itemKinds')
            if (config.visibleToPlayers?.length) assertIdList(config.visibleToPlayers, 'visibleToPlayers')
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
        return handleRouteError(error, 'Erro ao gerenciar loja')
    }
}

/**
 * Endpoint para obter itens da loja para jogadores
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign: authorizedCampaign } = await requireCampaignMember(id, user)

        const campaign = await campaignEntity.findById(authorizedCampaign.id)
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
        return handleRouteError(error, 'Erro ao obter loja')
    }
}
