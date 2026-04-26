import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId'
import { stripUndefined } from '@utils/firestore/stripUndefined'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; effectId: string }> }
) {
    try {
        const { id, effectId } = await params
        const body = await request.json()

        const campaign = await findCampaignByCodeOrId(id)
        if (!campaign) {
            return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        }

        const existing = await combatEffectRepository.findById(effectId)
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
        console.error('[Campaign Custom Effects] Erro no PATCH:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; effectId: string }> }
) {
    try {
        const { id, effectId } = await params

        const campaign = await findCampaignByCodeOrId(id)
        if (!campaign) {
            return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        }

        const existing = await combatEffectRepository.findById(effectId)
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        if (existing.scope !== 'campaign' || existing.campaignId !== campaign.id) {
            return NextResponse.json({ error: 'Efeito não pertence a esta campanha' }, { status: 403 })
        }

        await combatEffectRepository.delete(effectId)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Campaign Custom Effects] Erro no DELETE:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
