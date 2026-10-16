import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { CombatEffectEntity } from '@models/entities'
import type { CombatEffectCategory, CombatEffectModifier, CombatEffectTiming } from '@models'
import { assertId, assertMaxLength, handleRouteError, readJsonBody, requireCampaignGM, requireCampaignMember, requireUser, TEXT_LIMITS } from '@utils/api'
import { v4 as uuidv4 } from 'uuid'
import { stripUndefined } from '@utils/firestore/stripUndefined'

/**
 * GET /api/campaign/[id]/custom/effects
 *  Retorna efeitos com scope='campaign' associados a essa campanha.
 *  Query opcional: includeGlobal=true para concatenar globais.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const includeGlobal = searchParams.get('includeGlobal') === 'true'

        const user = await requireUser()
        const { campaign } = await requireCampaignMember(id, user)

        const all = await combatEffectRepository.find()

        const campaignEffects = all.filter(
            e => !e.archived && e.scope === 'campaign' && e.campaignId === campaign.id
        )
        const globalEffects = includeGlobal ? all.filter(e => !e.archived && e.scope === 'global') : []

        return NextResponse.json({
            success: true,
            campaignEffects,
            globalEffects,
            effects: [ ...globalEffects, ...campaignEffects ]
        })
    } catch (error) {
        return handleRouteError(error, 'Erro ao listar efeitos da campanha')
    }
}

interface CreateBody {
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
    createdBy?: string
    /** ID de um efeito global para clonar (opcional) */
    cloneFromId?: string
}

/**
 * POST /api/campaign/[id]/custom/effects
 *  Cria efeito com scope='campaign'. Pode clonar um global passando `cloneFromId`.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)

        const body: CreateBody = await readJsonBody(request)
        assertMaxLength(body.name, TEXT_LIMITS.name, 'name')
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description')

        let base: Partial<CombatEffectEntity> | null = null
        if (body.cloneFromId) {
            const source = await combatEffectRepository.findById(assertId(body.cloneFromId, 'cloneFromId'))
            // Só clona efeitos globais ou desta própria campanha
            const canClone = source && (source.scope === 'global' || source.campaignId === campaign.id)
            if (source && canClone) {
                base = {
                    name: source.name,
                    description: source.description,
                    category: source.category,
                    timing: source.timing,
                    element: source.element,
                    color: source.color,
                    icon: source.icon,
                    levels: source.levels?.map(l => ({ ...l })),
                    usesLevels: source.usesLevels,
                    customLabels: source.customLabels ? { ...source.customLabels } : undefined
                }
            }
        }

        const name = body.name ?? base?.name
        const levels = (body.levels && body.levels.length > 0) ? body.levels : base?.levels ?? []

        if (!name) {
            return NextResponse.json({ error: 'Nome do efeito é obrigatório' }, { status: 400 })
        }
        if (!Array.isArray(levels) || levels.length === 0) {
            return NextResponse.json({ error: 'Ao menos um nível é obrigatório' }, { status: 400 })
        }

        const entity = new CombatEffectEntity(stripUndefined({
            id: uuidv4(),
            name,
            description: body.description ?? base?.description ?? '',
            category: body.category ?? base?.category ?? 'damage',
            timing: body.timing ?? base?.timing ?? 'turn',
            element: body.element ?? base?.element,
            color: body.color ?? base?.color ?? '#ff5722',
            icon: body.icon ?? base?.icon ?? '💥',
            levels: levels.map((l: any) => stripUndefined({
                level: Math.max(1, Math.floor(Number(l.level) || 1)),
                formula: String(l.formula ?? '0'),
                duration: Math.max(1, Math.floor(Number(l.duration) || 1)),
                description: l.description || undefined,
                indefinite: l.indefinite === true ? true : undefined,
                modifiers: Array.isArray(l.modifiers) && l.modifiers.length > 0 ? l.modifiers : undefined
            })),
            usesLevels: body.usesLevels ?? base?.usesLevels,
            customLabels: body.customLabels ?? base?.customLabels,
            scope: 'campaign',
            campaignId: campaign.id,
            createdBy: user.id,
            createdAt: new Date().toISOString()
        }))

        const created = await combatEffectRepository.create(entity)

        return NextResponse.json({ success: true, effect: created }, { status: 201 })
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar efeito da campanha')
    }
}
