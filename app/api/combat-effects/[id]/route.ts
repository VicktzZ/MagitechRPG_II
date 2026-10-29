import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { stripUndefined } from '@utils/firestore/stripUndefined'
import type { CombatEffectEntity } from '@models/entities'
import { assertId, forbidden, handleRouteError, readJsonBody, requireCampaignGM, requireCampaignMember, requireUser, type AuthUser } from '@utils/api'

/** Global: só admin altera. De campanha: só o mestre daquela campanha. */
async function assertCanManageEffect(effect: CombatEffectEntity, user: AuthUser): Promise<void> {
    if (effect.scope === 'campaign' && effect.campaignId) {
        await requireCampaignGM(effect.campaignId, user)
        return
    }
    if (!user.isAdmin) {
        throw forbidden('Apenas administradores podem alterar efeitos globais')
    }
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser()
        const id = assertId((await params).id)
        const effect = await combatEffectRepository.findById(id)
        if (!effect) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        if (effect.scope === 'campaign' && effect.campaignId) {
            await requireCampaignMember(effect.campaignId, user)
        }
        return NextResponse.json({ success: true, effect })
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar efeito')
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser()
        const id = assertId((await params).id)
        const body = await readJsonBody(request)

        const existing = await combatEffectRepository.findById(id)
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        await assertCanManageEffect(existing, user)

        const merged = stripUndefined({
            ...existing,
            ...body,
            id: existing.id,
            createdAt: existing.createdAt,
            createdBy: existing.createdBy,
            scope: existing.scope,
            campaignId: existing.campaignId
        })

        const updated = await combatEffectRepository.update(merged)

        return NextResponse.json({ success: true, effect: updated })
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar efeito')
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser()
        const id = assertId((await params).id)
        const existing = await combatEffectRepository.findById(id)
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        await assertCanManageEffect(existing, user)
        await combatEffectRepository.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover efeito')
    }
}
