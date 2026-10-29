import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { assertId, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api'
import { stripUndefined } from '@utils/firestore/stripUndefined'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; effectId: string }> }
) {
    try {
        const { id, effectId } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)
        const body = await readJsonBody(request)

        const existing = await combatEffectRepository.findById(assertId(effectId, 'effectId'))
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        if (existing.scope !== 'campaign' || existing.campaignId !== campaign.id) {
            return NextResponse.json({ error: 'Efeito não pertence a esta campanha' }, { status: 403 })
        }

        const merged = stripUndefined({
            ...existing,
            ...body,
            id: existing.id,
            scope: existing.scope,
            campaignId: existing.campaignId,
            createdAt: existing.createdAt,
            createdBy: existing.createdBy
        })

        const updated = await combatEffectRepository.update(merged)

        return NextResponse.json({ success: true, effect: updated })
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar efeito da campanha')
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; effectId: string }> }
) {
    try {
        const { id, effectId } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)

        const existing = await combatEffectRepository.findById(assertId(effectId, 'effectId'))
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        if (existing.scope !== 'campaign' || existing.campaignId !== campaign.id) {
            return NextResponse.json({ error: 'Efeito não pertence a esta campanha' }, { status: 403 })
        }

        await combatEffectRepository.delete(effectId)
        return NextResponse.json({ success: true })
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover efeito da campanha')
    }
}
