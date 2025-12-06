import { NextResponse, type NextRequest } from 'next/server'
import { campaignEntity, charsheetEntity } from '@utils/firestoreEntities'
import { processCollectionsFlat, type ProcessorFilters } from '@app/api/roguelite/perks/processors'
import { selectRandomItems, generateRandomSeed } from '@utils/roguelite'

// Cache de perks para evitar leituras excessivas no Firestore (1 hora)
const PERKS_CACHE_TTL = 60 * 60 * 1000 // 1 hora em ms
interface PerksCache {
    data: any[]
    timestamp: number
    key: string
}
let perksCache: PerksCache | null = null

function getCacheKey(collections: string[], filters: ProcessorFilters): string {
    return JSON.stringify({ collections: collections.sort(), filters })
}

function getPerksFromCache(key: string): any[] | null {
    if (!perksCache) return null
    if (perksCache.key !== key) return null
    if (Date.now() - perksCache.timestamp > PERKS_CACHE_TTL) {
        perksCache = null
        return null
    }
    console.log('[shop/items] Usando perks do cache')
    return perksCache.data
}

function setPerksCache(key: string, data: any[]): void {
    perksCache = {
        data,
        timestamp: Date.now(),
        key
    }
    console.log('[shop/items] Perks salvos no cache')
}

// Preços base por raridade (para Armas, Itens e Armaduras)
const RARITY_PRICES: Record<string, number> = {
    'Comum': 10,
    'Incomum': 25,
    'Raro': 50,
    'Épico': 100,
    'Lendário': 150,
    'Único': 250,
    'Mágico': 50,
    'Amaldiçoado': 25,
    'Especial': 100
}

// Preços de magias por nível
const SPELL_LEVEL_PRICES: Record<number, number> = {
    1: 25,
    2: 50,
    3: 75,
    4: 100
}

// Preços de acessórios por tipo
const ACCESSORY_PRICES: Record<string, number> = {
    'Científico': 100,
    'Mágico': 150
}

/**
 * Endpoint para obter/gerar itens da loja
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
                items: []
            })
        }

        // Verifica se deve forçar regeneração
        const { searchParams } = new URL(request.url)
        const forceRefresh = searchParams.get('refresh') === 'true'
        
        // Verifica se já existem itens gerados e são recentes (menos de 1 hora)
        const shopItems = campaign.shop?.items || []
        const lastGenerated = campaign.shop?.itemsGeneratedAt
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        
        if (!forceRefresh && shopItems.length > 0 && lastGenerated && new Date(lastGenerated).getTime() > oneHourAgo) {
            console.log('[shop/items] Retornando itens em cache')
            return NextResponse.json({
                success: true,
                items: shopItems,
                cached: true
            })
        }
        
        console.log('[shop/items] Gerando novos itens...')

        // Gera novos itens
        const config = campaign.shop
        const itemCount = config.itemCount || 5
        const priceMultiplier = config.priceMultiplier || 1.0

        // Calcula os níveis dos jogadores da campanha
        const campaignPlayers = campaign.players || []
        let averageLevel = 1
        let minLevel = 1
        let maxLevel = 1
        const playerLevels: number[] = []
        
        if (campaignPlayers.length > 0) {
            const charsheetIds = campaignPlayers.map((p: any) => p.charsheetId).filter(Boolean)
            
            for (const csId of charsheetIds) {
                try {
                    const cs = await charsheetEntity.findById(csId)
                    if (cs?.level !== undefined) {
                        playerLevels.push(cs.level)
                    }
                } catch (e) {
                    // Ignora erros
                }
            }
            
            if (playerLevels.length > 0) {
                minLevel = Math.min(...playerLevels)
                maxLevel = Math.max(...playerLevels)
                averageLevel = Math.ceil(playerLevels.reduce((a, b) => a + b, 0) / playerLevels.length)
            }
        }

        // Determina níveis de magia permitidos baseado no nível mínimo dos jogadores
        // Nível 0-4: apenas magias nível 1
        // Nível 5-9: magias nível 1 e 2
        // Nível 10-14: magias nível 1, 2 e 3
        // Nível 15-20: magias nível 2, 3 e 4
        let allowedSpellLevels: number[] = [1]
        if (minLevel >= 15) {
            allowedSpellLevels = [2, 3, 4]
        } else if (minLevel >= 10) {
            allowedSpellLevels = [1, 2, 3]
        } else if (minLevel >= 5) {
            allowedSpellLevels = [1, 2]
        }
        
        console.log('[shop/items] Níveis dos jogadores:', { minLevel, maxLevel, averageLevel, allowedSpellLevels })
        
        // Busca perks usando a lógica direta
        // Determina quais collections buscar baseado nos tipos configurados
        const typeToCollection: Record<string, string[]> = {
            'WEAPON': ['weapons'],
            'ARMOR': ['armors'],
            'ITEM': ['items'],
            'SPELL': ['spells'],
            'SKILL': ['skills'],
            'UPGRADE': ['perks'],
            'BONUS': ['perks'],
            'STATS': ['perks']
        }
        
        let collections: string[] = ['items', 'weapons', 'armors', 'spells', 'skills', 'perks']
        
        // Se tipos específicos foram configurados, usa apenas essas collections
        if (config.types && config.types.length > 0) {
            collections = config.types.flatMap((t: string) => typeToCollection[t] || [])
            collections = [...new Set(collections)] // Remove duplicatas
        }
        
        // Configura os filtros
        const filters: ProcessorFilters = {
            rarities: config.rarities && config.rarities.length > 0 ? config.rarities : null,
            itemKinds: config.itemKinds && config.itemKinds.length > 0 ? config.itemKinds : null,
            userLevel: averageLevel
        }
        
        console.log('[shop/items] Buscando perks com filtros:', { collections, filters })
        
        let perks: any[] = []
        try {
            // Tenta usar cache primeiro
            const cacheKey = getCacheKey(collections, filters)
            let allPerks = getPerksFromCache(cacheKey)
            
            if (!allPerks) {
                // Cache miss - busca do Firestore
                console.log('[shop/items] Cache miss - buscando do Firestore...')
                allPerks = await processCollectionsFlat(collections, filters)
                setPerksCache(cacheKey, allPerks)
            }
            
            console.log('[shop/items] Perks encontrados:', allPerks.length)
            
            // Filtra magias pelos níveis permitidos baseado no nível mínimo dos jogadores
            const filteredPerks = allPerks.filter((perk: any) => {
                const perkType = (perk.perkType || '').toUpperCase()
                
                // Se for magia, verifica se o nível é permitido
                if (perkType === 'SPELL' || perkType === 'MAGIA') {
                    const spellLevel = perk.level || 1
                    return allowedSpellLevels.includes(spellLevel)
                }
                
                // Outros tipos passam
                return true
            })
            
            console.log('[shop/items] Perks após filtro de nível de magia:', filteredPerks.length)
            
            // Seleciona itens aleatórios
            const seed = generateRandomSeed()
            perks = selectRandomItems(filteredPerks, Math.min(itemCount, filteredPerks.length), seed)
        } catch (error) {
            console.error('[shop/items] Erro ao buscar perks:', error)
        }

        // Se não conseguiu buscar perks, retorna erro
        if (perks.length === 0) {
            return NextResponse.json({
                success: false,
                items: [],
                message: 'Nenhum item disponível com os filtros selecionados'
            })
        }

        // Formata itens para a loja com preços
        console.log('[shop/items] Formatando perks:', perks.slice(0, 2).map(p => ({ 
            name: p.name, 
            rogueliteRarity: p.rogueliteRarity,
            perkType: p.perkType 
        })))
        
        const formattedItems = perks.slice(0, itemCount).map((perk: any, index: number) => {
            // O perk já vem com todas as propriedades do item/arma/armadura/magia
            const name = perk.name || 'Item sem nome'
            const description = perk.description || perk.effect || perk.stages?.[0] || ''
            const rarity = perk.rogueliteRarity || perk.rarity || 'Comum'
            const perkType = perk.perkType || 'ITEM'
            const spellLevel = perk.level || 1
            const accessoryType = perk.accessoryType || null
            
            console.log(`[shop/items] Item ${index}: ${name} (${rarity}, ${perkType})`)
            
            const item: Record<string, any> = {
                id: `shop-${campaignId}-${Date.now()}-${index}`,
                name,
                description,
                perkType,
                rarity,
                price: calculatePrice({
                    perkType,
                    rarity,
                    spellLevel: perkType === 'SPELL' ? spellLevel : null,
                    accessoryType,
                    playerLevel: averageLevel,
                    priceMultiplier
                })
            }
            
            // Adiciona spellLevel apenas para magias
            if (perkType === 'SPELL') {
                item.spellLevel = spellLevel
            }
            
            // Serializa o perk removendo funções e campos problemáticos
            item.data = JSON.parse(JSON.stringify(perk))
            
            return item
        })

        // Salva itens na campanha
        await campaignEntity.update(campaignId, {
            'shop.items': formattedItems,
            'shop.itemsGeneratedAt': new Date().toISOString()
        })

        return NextResponse.json({
            success: true,
            items: formattedItems
        })

    } catch (error) {
        console.error('Erro ao obter itens da loja:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

interface PriceParams {
    perkType: string
    rarity: string
    spellLevel?: number | null
    accessoryType?: string | null
    playerLevel: number
    priceMultiplier: number
}

/**
 * Calcula o preço de um item na loja
 * Fórmula: (preçoBase + (nível * 5)) * multiplicador
 */
function calculatePrice(params: PriceParams): number {
    const { perkType, rarity, spellLevel, accessoryType, playerLevel, priceMultiplier } = params
    
    let basePrice = 10 // Preço padrão
    
    // Normaliza o tipo (suporta PT e EN)
    const normalizedType = perkType.toUpperCase()
    
    // Determina preço base pelo tipo
    if (normalizedType === 'SPELL' || normalizedType === 'MAGIA') {
        // Magias: preço por nível
        basePrice = SPELL_LEVEL_PRICES[spellLevel || 1] || 25
    } else if (normalizedType === 'UPGRADE' || accessoryType) {
        // Acessórios
        if (accessoryType === 'Mágico' || accessoryType === 'Magico') {
            basePrice = ACCESSORY_PRICES['Mágico']
        } else {
            basePrice = ACCESSORY_PRICES['Científico']
        }
    } else {
        // Armas, itens, armaduras, habilidades: preço por raridade
        basePrice = RARITY_PRICES[rarity] || 10
    }
    
    // Aplica progressão: preço base + (nível * 5)
    const levelBonus = Math.max(1, playerLevel) * 5
    const finalPrice = basePrice + levelBonus
    
    // Aplica multiplicador do GM
    return Math.round(finalPrice * priceMultiplier)
}
