/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { Perk } from '@models/entities'
import { perkRepository } from '@repositories'
import { cache, generateCacheKey, generateETag } from '@utils/cacheApi'
import {
    generateRandomSeed,
    getCollectionsForPerkType,
    parseCollectionsParam,
    selectRandomItems
} from '@utils/roguelite'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { ParsedParams, QueryMetadata } from '../types'
import type { ProcessorFilters } from './processors'
import { processCollections, processCollectionsFlat } from './processors'

// ============================================================================
// Request Parsing
// ============================================================================

function parseRequestParams(searchParams: URLSearchParams): ParsedParams | NextResponse {
    const perkType = searchParams.get('perkType')
    const collectionsParam = searchParams.get('collections')
    const levelRequired = searchParams.get('levelRequired')
    const rarity = searchParams.get('rarity')
    const seed = searchParams.get('seed')
    const perkAmountParam = searchParams.get('perkAmount')
    const userLevelParam = searchParams.get('level')
    
    // Filtros específicos para magias
    const element = searchParams.get('element')
    const spellLevelParam = searchParams.get('spellLevel')
    const execution = searchParams.get('execution')
    
    // Filtros específicos para armas
    const ignoreWeaponLevelWeight = searchParams.get('ignoreWeaponLevelWeight') === 'true'
    
    // Filtros específicos para itens
    const itemKind = searchParams.get('itemKind')
    // Multi-select de tipos de item
    const itemKindsParam = searchParams.get('itemKinds')
    const itemKinds = itemKindsParam ? itemKindsParam.split(',').filter(k => k.trim()) : null
    
    // Multi-select de tipos de habilidade
    const skillTypesParam = searchParams.get('skillTypes')
    const skillTypes = skillTypesParam ? skillTypesParam.split(',').filter(t => t.trim()) : null
    
    // Multi-select de raridades
    const raritiesParam = searchParams.get('rarities')
    const rarities = raritiesParam ? raritiesParam.split(',').filter(r => r.trim()) : null
    
    console.log('[perks/route] params recebidos:', {
        raritiesParam,
        rarities,
        itemKindsParam,
        itemKinds,
        itemKind,
        skillTypesParam,
        skillTypes,
        perkType,
        allParams: Object.fromEntries(searchParams.entries())
    })
    
    // Validar: collections é obrigatório (via perkType ou collections param)
    if (!perkType && !collectionsParam) {
        return NextResponse.json({
            error: 'Parâmetro obrigatório ausente',
            message: 'É necessário especificar "perkType" ou "collections" (separadas por vírgula)'
        }, { status: 400 })
    }
    
    // Determinar collections a buscar
    const collections = perkType 
        ? getCollectionsForPerkType(perkType)
        : parseCollectionsParam(collectionsParam)
    
    // Validar que ao menos uma collection válida foi especificada
    if (collections.length === 0) {
        return NextResponse.json({
            error: 'Collections inválidas',
            message: 'Nenhuma collection válida foi especificada. Opções: perks, powers, skills, items, armors, spells, weapons'
        }, { status: 400 })
    }
    
    // Validar perkAmount
    let perkAmount: number | null = null
    let finalSeed = seed
    
    if (perkAmountParam) {
        perkAmount = parseInt(perkAmountParam)
        if (isNaN(perkAmount) || perkAmount < 1 || perkAmount > 10) {
            return NextResponse.json({
                error: 'perkAmount deve ser um número entre 1 e 10'
            }, { status: 400 })
        }
        
        if (!seed) {
            finalSeed = generateRandomSeed()
        }
    }
    
    return {
        perkType,
        collections,
        levelRequired,
        rarity,
        rarities,
        seed: finalSeed,
        perkAmount,
        userLevel: userLevelParam ? parseInt(userLevelParam) : undefined,
        // Filtros de magia
        element,
        spellLevel: spellLevelParam ? parseInt(spellLevelParam) : null,
        execution,
        // Filtros de arma
        ignoreWeaponLevelWeight,
        // Filtros de item
        itemKind,
        itemKinds,
        // Filtros de habilidade
        skillTypes
    }
}

// ============================================================================
// Response Building
// ============================================================================

function buildQueryMetadata(
    params: ParsedParams,
    totalItems: number,
    selectedFrom?: number
): QueryMetadata {
    const metadata: QueryMetadata = {
        collections: params.collections,
        filters: {
            perkType: params.perkType,
            levelRequired: params.levelRequired,
            rogueliteRarity: params.rarity
        },
        totalItems
    }
    
    if (params.perkAmount && params.seed) {
        metadata.seed = params.seed
        metadata.perkAmount = params.perkAmount
        metadata.selectedFrom = selectedFrom ?? totalItems
        metadata.autoGenerated = !params.seed
    }
    
    return metadata
}

function buildCacheResponse(data: any, cacheHit: boolean): NextResponse {
    const response = NextResponse.json(data)
    
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    response.headers.set('ETag', generateETag(
        Array.isArray(data.data) ? data.data : Object.values(data).flat()
    ))
    response.headers.set('X-Cache', cacheHit ? 'HIT' : 'MISS')
    
    return response
}

// ============================================================================
// Main Handler
// ============================================================================

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    
    // Parse e validação de parâmetros
    const paramsOrError = parseRequestParams(searchParams)
    if (paramsOrError instanceof NextResponse) {
        return paramsOrError
    }
    const params = paramsOrError
    
    // Construir filtros para processadores
    const filters: ProcessorFilters = {
        perkType: params.perkType,
        levelRequired: params.levelRequired,
        rarity: params.rarity,
        rarities: params.rarities,
        userLevel: params.userLevel,
        seed: params.seed ?? undefined,
        // Filtros de magia
        element: params.element,
        spellLevel: params.spellLevel,
        execution: params.execution,
        // Filtros de arma
        ignoreWeaponLevelWeight: params.ignoreWeaponLevelWeight,
        // Filtros de item
        itemKind: params.itemKind,
        itemKinds: params.itemKinds,
        // Filtros de habilidade
        skillTypes: params.skillTypes
    }
    
    // Gerar chave de cache
    const cacheKey = generateCacheKey(params.collections, {
        perkType: params.perkType,
        levelRequired: params.levelRequired,
        rarity: params.rarity,
        rarities: params.rarities?.join(',') ?? null,
        seed: params.seed,
        perkAmount: params.perkAmount?.toString() ?? null,
        level: params.userLevel ?? null,
        element: params.element,
        spellLevel: params.spellLevel?.toString() ?? null,
        execution: params.execution,
        ignoreWeaponLevelWeight: params.ignoreWeaponLevelWeight,
        itemKind: params.itemKind,
        itemKinds: params.itemKinds?.join(',') ?? null,
        skillTypes: params.skillTypes?.join(',') ?? null
    })
    
    console.log('[perks/route] filters construídos:', {
        rarities: filters.rarities,
        rarity: filters.rarity,
        itemKind: filters.itemKind,
        skillTypes: filters.skillTypes,
        perkType: filters.perkType
    })
    
    // Verificar cache - DESABILITADO TEMPORARIAMENTE PARA DEBUG
    // const cachedEntry = cache.get(cacheKey)
    // if (cachedEntry && isCacheValid(cachedEntry)) {
    //     return buildCacheResponse(cachedEntry.data, true)
    // }
    
    try {
        let responseData: any
        
        if (params.perkType) {
            // Busca filtrada por perkType - retorna array unificada
            let results = await processCollectionsFlat(params.collections, filters)
            
            // Filtro final por perkType
            results = results.filter(item => item.perkType === params.perkType)
            
            // Seleção aleatória se perkAmount informado
            if (params.perkAmount && params.seed) {
                const selected = selectRandomItems(results, params.perkAmount, params.seed)
                responseData = {
                    data: selected,
                    _query: buildQueryMetadata(params, selected.length, results.length)
                }
            } else {
                responseData = {
                    data: results,
                    _query: buildQueryMetadata(params, results.length)
                }
            }
        } else {
            // Busca geral - retorna objeto agrupado por collection
            const grouped = await processCollections(params.collections, filters)
            
            const totalItems = Object.values(grouped)
                .reduce((sum, arr) => sum + arr.length, 0)
            
            // Seleção aleatória se perkAmount informado
            if (params.perkAmount && params.seed) {
                const allItems = Object.values(grouped).flat()
                const selected = selectRandomItems(allItems, params.perkAmount, params.seed)
                
                responseData = {
                    data: selected,
                    _query: buildQueryMetadata(params, selected.length, allItems.length)
                }
            } else {
                responseData = {
                    ...grouped,
                    _query: buildQueryMetadata(params, totalItems)
                }
            }
        }
        
        // Armazenar no cache
        cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
        })
        
        return buildCacheResponse(responseData, false)
        
    } catch (error) {
        console.error('Erro ao buscar dados:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const perk = new Perk(body)
    await perkRepository.create(perk)
    return NextResponse.json(perk)
}
