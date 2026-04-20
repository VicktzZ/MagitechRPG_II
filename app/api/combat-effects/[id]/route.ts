import { type NextRequest, NextResponse } from 'next/server'
import { combatEffectRepository } from '@repositories'
import { stripUndefined } from '@utils/firestore/stripUndefined'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const effect = await combatEffectRepository.findById(id)
        if (!effect) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        return NextResponse.json({ success: true, effect })
    } catch (error) {
        console.error('[CombatEffects API] Erro no GET byId:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const existing = await combatEffectRepository.findById(id)
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }

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
        console.error('[CombatEffects API] Erro no PATCH:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const existing = await combatEffectRepository.findById(id)
        if (!existing) {
            return NextResponse.json({ error: 'Efeito não encontrado' }, { status: 404 })
        }
        await combatEffectRepository.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[CombatEffects API] Erro no DELETE:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
