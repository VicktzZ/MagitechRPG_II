import { type NextRequest, NextResponse } from 'next/server'
import { campaignRepository } from '@repositories'
import { v4 as uuidv4 } from 'uuid'
import type { Creature } from '@models/Creature'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params
        const body = await request.json()

        if (!campaignId) {
            return NextResponse.json(
                { error: 'ID da campanha é obrigatório' },
                { status: 400 }
            )
        }

        if (!body.name?.trim()) {
            return NextResponse.json(
                { error: 'Nome da criatura é obrigatório' },
                { status: 400 }
            )
        }

        // Busca a campanha
        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        // Cria a nova criatura com dados completos
        const newCreature: Partial<Creature> = {
            id: body.id || uuidv4(),
            name: body.name.trim(),
            description: body.description || '',
            level: body.level || 1,
            attributes: {
                vig: body.attributes?.vig || 0,
                des: body.attributes?.des || 0,
                log: body.attributes?.log || 0,
                car: body.attributes?.car || 0,
                sab: body.attributes?.sab || 0,
                foc: body.attributes?.foc || 0
            },
            stats: {
                lp: body.stats?.lp || 10,
                maxLp: body.stats?.maxLp || body.stats?.lp || 10,
                mp: body.stats?.mp || 5,
                maxMp: body.stats?.maxMp || body.stats?.mp || 5,
                ap: body.stats?.ap || 0
            },
            expertises: body.expertises || {},
            skills: body.skills || [],
            spells: body.spells || []
        }

        // Adiciona a criatura ao array de criaturas customizadas
        const existingCreatures = campaign.custom?.creatures || []
        const updatedCampaign = {
            ...campaign,
            custom: {
                ...campaign.custom,
                creatures: [ ...existingCreatures, newCreature ]
            }
        }

        await campaignRepository.update(updatedCampaign)

        return NextResponse.json({
            success: true,
            message: `Criatura "${newCreature.name}" criada com sucesso!`,
            creature: newCreature
        })

    } catch (error) {
        console.error('Erro ao criar criatura:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params

        if (!campaignId) {
            return NextResponse.json(
                { error: 'ID da campanha é obrigatório' },
                { status: 400 }
            )
        }

        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        const creatures = campaign.custom?.creatures || []

        return NextResponse.json({
            success: true,
            creatures
        })

    } catch (error) {
        console.error('Erro ao buscar criaturas:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params
        const body = await request.json()

        if (!campaignId || !body.id) {
            return NextResponse.json(
                { error: 'IDs são obrigatórios' },
                { status: 400 }
            )
        }

        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        const existingCreatures = campaign.custom?.creatures || []
        const creatureIndex = existingCreatures.findIndex((c: any) => c.id === body.id)

        if (creatureIndex === -1) {
            return NextResponse.json(
                { error: 'Criatura não encontrada' },
                { status: 404 }
            )
        }

        // Atualiza a criatura
        const updatedCreature = {
            ...existingCreatures[creatureIndex],
            name: body.name?.trim() || existingCreatures[creatureIndex].name,
            description: body.description ?? existingCreatures[creatureIndex].description,
            level: body.level ?? existingCreatures[creatureIndex].level,
            attributes: body.attributes ?? existingCreatures[creatureIndex].attributes,
            stats: body.stats ?? existingCreatures[creatureIndex].stats,
            expertises: body.expertises ?? existingCreatures[creatureIndex].expertises,
            skills: body.skills ?? existingCreatures[creatureIndex].skills,
            spells: body.spells ?? existingCreatures[creatureIndex].spells
        }

        const updatedCreatures = [ ...existingCreatures ]
        updatedCreatures[creatureIndex] = updatedCreature

        const updatedCampaign = {
            ...campaign,
            custom: {
                ...campaign.custom,
                creatures: updatedCreatures
            }
        }

        await campaignRepository.update(updatedCampaign)

        return NextResponse.json({
            success: true,
            message: `Criatura "${updatedCreature.name}" atualizada com sucesso!`,
            creature: updatedCreature
        })

    } catch (error) {
        console.error('Erro ao atualizar criatura:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params
        const { creatureId } = await request.json()

        if (!campaignId || !creatureId) {
            return NextResponse.json(
                { error: 'IDs são obrigatórios' },
                { status: 400 }
            )
        }

        const campaign = await campaignRepository.findById(campaignId)
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campanha não encontrada' },
                { status: 404 }
            )
        }

        const existingCreatures = campaign.custom?.creatures || []
        const updatedCreatures = existingCreatures.filter((c: any) => c.id !== creatureId)

        const updatedCampaign = {
            ...campaign,
            custom: {
                ...campaign.custom,
                creatures: updatedCreatures
            }
        }

        await campaignRepository.update(updatedCampaign)

        return NextResponse.json({
            success: true,
            message: 'Criatura removida com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao remover criatura:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
