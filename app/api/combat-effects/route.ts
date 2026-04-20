import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { CombatEffectEntity } from '@models/entities'
import type { CombatEffectScope, CombatEffectCategory, CombatEffectTiming, CombatEffectModifier } from '@models'
import { v4 as uuidv4 } from 'uuid'
import { stripUndefined } from '@utils/firestore/stripUndefined'

/**
 * GET /api/combat-effects
 *  Query params opcionais:
 *    scope      = 'global' | 'campaign' | 'all' (default: 'global')
 *    campaignId = ID da campanha (retorna efeitos dessa campanha)
 *    category   = 'damage' | 'heal' | 'info'
 *
 * Comportamento:
 *  - Se scope='global' -> só globais
 *  - Se scope='campaign' e campaignId setado -> só daquela campanha
 *  - Se scope='all' e campaignId setado -> globais + daquela campanha
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const scopeParam = (searchParams.get('scope') ?? 'global') as CombatEffectScope | 'all'
        const campaignId = searchParams.get('campaignId') ?? undefined
        const category = searchParams.get('category') as CombatEffectCategory | null

        const all = await combatEffectRepository.find()

        const filtered = all.filter((eff: CombatEffectEntity) => {
            if (eff.archived) return false
            if (category && eff.category !== category) return false

            if (scopeParam === 'global') return eff.scope === 'global'
            if (scopeParam === 'campaign') {
                if (!campaignId) return false
                return eff.scope === 'campaign' && eff.campaignId === campaignId
            }
            if (scopeParam === 'all') {
                if (eff.scope === 'global') return true
                if (campaignId && eff.scope === 'campaign' && eff.campaignId === campaignId) return true
                return false
            }
            return false
        })

        return NextResponse.json({ success: true, effects: filtered, count: filtered.length })
    } catch (error) {
        console.error('[CombatEffects API] Erro no GET:', error)
        return NextResponse.json({ error: 'Erro interno ao listar efeitos' }, { status: 500 })
    }
}

interface CreateCombatEffectBody {
    name: string
    description?: string
    category?: CombatEffectCategory
    timing?: CombatEffectTiming
    element?: string
    color?: string
    icon?: string
    levels: Array<{
        level: number
        formula: string
        duration: number
        description?: string
        indefinite?: boolean
        modifiers?: CombatEffectModifier[]
    }>
    usesLevels?: boolean
    customLabels?: { damage?: string[]; heal?: string[]; info?: string[]; buff?: string[]; debuff?: string[] }
    scope?: CombatEffectScope
    campaignId?: string
    createdBy?: string
}

/**
 * POST /api/combat-effects
 *  Cria um efeito. Por padrão scope='global'.
 *  NOTE: Em produção, criação global deveria ser gated por admin. Deixado aberto em dev para facilitar o seed.
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateCombatEffectBody = await request.json()

        if (!body?.name) {
            return NextResponse.json({ error: 'Nome do efeito é obrigatório' }, { status: 400 })
        }
        if (!Array.isArray(body.levels) || body.levels.length === 0) {
            return NextResponse.json({ error: 'Ao menos um nível é obrigatório' }, { status: 400 })
        }

        const scope: CombatEffectScope = body.scope === 'campaign' ? 'campaign' : 'global'

        const entity = new CombatEffectEntity(stripUndefined({
            id: uuidv4(),
            name: body.name,
            description: body.description ?? '',
            category: body.category ?? 'damage',
            timing: body.timing ?? 'turn',
            element: body.element,
            color: body.color ?? '#ff5722',
            icon: body.icon ?? '💥',
            levels: body.levels.map(l => stripUndefined({
                level: Math.max(1, Math.floor(Number(l.level) || 1)),
                formula: String(l.formula ?? '0'),
                duration: Math.max(1, Math.floor(Number(l.duration) || 1)),
                description: l.description || undefined,
                indefinite: l.indefinite === true ? true : undefined,
                modifiers: Array.isArray(l.modifiers) && l.modifiers.length > 0 ? l.modifiers : undefined
            })),
            usesLevels: body.usesLevels,
            customLabels: body.customLabels,
            scope,
            campaignId: scope === 'campaign' ? body.campaignId : undefined,
            createdBy: body.createdBy ?? 'system',
            createdAt: new Date().toISOString()
        }))

        const created = await combatEffectRepository.create(entity)

        return NextResponse.json({ success: true, effect: created }, { status: 201 })
    } catch (error) {
        console.error('[CombatEffects API] Erro no POST:', error)
        return NextResponse.json({ error: 'Erro interno ao criar efeito' }, { status: 500 })
    }
}
