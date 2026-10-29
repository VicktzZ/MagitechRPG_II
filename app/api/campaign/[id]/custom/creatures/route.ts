import { type NextRequest, NextResponse } from 'next/server'
import { campaignRepository } from '@repositories'
import { v4 as uuidv4 } from 'uuid'
import { Expertises, type Expertise, type Creature } from '@models'
import { sanitizeDamageModifiers, sanitizeWeaknesses } from '@utils/combat/creatureDefense'
import { completeCreatureExpertises } from '@utils/combat/creatureExpertises'
import {
    attachCreatureDefenses, embeddedDefensesOf, sanitizeCreatureDefenses, sanitizeCreatureElement, stripCreatureDefenses, stripCreatureListDefenses
} from '@utils/combat/creatureSecrets'
import { deleteCreatureDefenses, getCreatureDefenses, readCreatureDefenses, saveCreatureDefenses } from '@utils/firestore/gmData'
import { assertMaxLength, handleRouteError, readJsonBody, requireCampaignGM, requireCampaignMember, requireUser, TEXT_LIMITS } from '@utils/api'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        // Criaturas customizadas são criadas pelo mestre
        const { campaign } = await requireCampaignGM(id, user)

        const body = await readJsonBody(request)

        if (!body.name?.trim()) {
            return NextResponse.json(
                { error: 'Nome da criatura é obrigatório' },
                { status: 400 }
            )
        }
        assertMaxLength(body.name, TEXT_LIMITS.name, 'name')
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description')

        // Perícias: se o cliente enviou (suporta sistemas customizados com perícias
        // próprias), persiste as chaves enviadas preservando a defaultAttribute;
        // senão, inicializa a partir do modelo Magitech padrão.
        const plainExpertises: Record<string, { value: number; defaultAttribute: any }> = {}

        if (body.expertises && typeof body.expertises === 'object' && Object.keys(body.expertises).length > 0) {
            Object.entries(body.expertises).forEach(([ key, value ]: any) => {
                const newValue = Number(value?.value ?? 0)
                plainExpertises[key] = {
                    value: Number.isFinite(newValue) ? newValue : 0,
                    defaultAttribute: value?.defaultAttribute ?? null
                }
            })
        } else {
            const baseExpertises = new Expertises()
            Object.entries(baseExpertises as any).forEach(([ key, expertise ]: any) => {
                plainExpertises[key] = {
                    value: Number(expertise?.value ?? 0),
                    defaultAttribute: expertise?.defaultAttribute ?? null
                }
            })
        }

        // Atributos: aceita chaves arbitrárias (sistemas customizados); se nada
        // vier, usa os 6 atributos padrão do Magitech em 0.
        const plainAttributes: Record<string, number> =
            body.attributes && typeof body.attributes === 'object' && Object.keys(body.attributes).length > 0
                ? Object.fromEntries(Object.entries(body.attributes).map(([ k, v ]: any) => [ k, Number(v) || 0 ]))
                : { vig: 0, des: 0, log: 0, car: 0, sab: 0, foc: 0 }

        // Cria a nova criatura com dados completos
        const newCreature: any = {
            id: body.id || uuidv4(),
            name: body.name.trim(),
            description: body.description || '',
            type: body.type?.trim() || '',
            imageUrl: body.imageUrl?.trim() || '',
            level: body.level || 1,
            attributes: plainAttributes,
            stats: {
                lp: body.stats?.lp || 10,
                maxLp: body.stats?.maxLp || body.stats?.lp || 10,
                mp: body.stats?.mp || 5,
                maxMp: body.stats?.maxMp || body.stats?.mp || 5,
                ap: body.stats?.ap || 0
            },
            // Toda criatura tem todas as perícias: as sem bônus nem ônus valem 0 (o editor só manda as que o mestre mexeu)
            expertises: completeCreatureExpertises(plainExpertises),
            skills: body.skills || [],
            spells: body.spells || []
        }
        // Defesas (só o mestre vê): elemento, fraquezas declaradas e resistências/vulnerabilidades. Ficam num documento privado
        // (`campaigns/{id}/gmData`), nunca na criatura, que qualquer membro lê pelo documento da campanha
        const defenses = sanitizeCreatureDefenses(body)

        // Grava o segredo primeiro: se a campanha falhar sobra um documento sem criatura, que ninguém lê; o contrário deixaria a criatura sem defesas
        await saveCreatureDefenses(campaign.id, newCreature.id, defenses, user.id)

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
            creature: { ...newCreature, ...defenses }
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao criar criatura')
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign, isGM } = await requireCampaignMember(id, user)

        // As defesas são do mestre: ele as recebe juntadas, os jogadores não recebem nada delas
        const stored = campaign.custom?.creatures || []
        const creatures = isGM ? attachCreatureDefenses(stored, await readCreatureDefenses(campaign.id)) : stripCreatureListDefenses(stored)

        return NextResponse.json({
            success: true,
            creatures
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar criaturas')
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)

        const body = await readJsonBody(request)

        if (!body.id) {
            return NextResponse.json(
                { error: 'IDs são obrigatórios' },
                { status: 400 }
            )
        }
        assertMaxLength(body.name, TEXT_LIMITS.name, 'name')
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description')

        const existingCreatures = campaign.custom?.creatures || []
        const creatureIndex = existingCreatures.findIndex((c: any) => c.id === body.id)

        if (creatureIndex === -1) {
            return NextResponse.json(
                { error: 'Criatura não encontrada' },
                { status: 404 }
            )
        }

        // Defesas: o documento privado vale; sem ele, o que a criatura antiga ainda carrega dentro dela
        const existing = existingCreatures[creatureIndex]
        const currentDefenses = (await getCreatureDefenses(campaign.id, body.id)) ?? embeddedDefensesOf(existing) ?? sanitizeCreatureDefenses(null)

        // Atualiza a criatura (sem os campos de defesa: eles vão para o documento privado)
        const updatedCreature = {
            ...stripCreatureDefenses(existing),
            name: body.name?.trim() || existingCreatures[creatureIndex].name,
            description: body.description ?? existingCreatures[creatureIndex].description,
            type: body.type ?? existingCreatures[creatureIndex].type ?? '',
            imageUrl: body.imageUrl ?? existingCreatures[creatureIndex].imageUrl ?? '',
            level: body.level ?? existingCreatures[creatureIndex].level,
            attributes: body.attributes ?? existingCreatures[creatureIndex].attributes,
            stats: body.stats ?? existingCreatures[creatureIndex].stats,
            expertises: completeCreatureExpertises<Expertise>(body.expertises ?? existingCreatures[creatureIndex].expertises) as unknown as Creature['expertises'],
            skills: body.skills ?? existingCreatures[creatureIndex].skills,
            spells: body.spells ?? existingCreatures[creatureIndex].spells
        }
        // Só muda o que o editor mandou (criatura salva por um cliente antigo mantém as defesas dela)
        const defenses = {
            elementalMastery: typeof body.elementalMastery === 'string' ? sanitizeCreatureElement(body.elementalMastery) : currentDefenses.elementalMastery,
            weaknesses: body.weaknesses !== undefined ? sanitizeWeaknesses(body.weaknesses) : currentDefenses.weaknesses,
            damageModifiers: body.damageModifiers !== undefined ? sanitizeDamageModifiers(body.damageModifiers) : currentDefenses.damageModifiers
        }
        await saveCreatureDefenses(campaign.id, body.id, defenses, user.id)

        const updatedCreatures = [ ...existingCreatures ]
        // Sem os campos de defesa (o tipo `Creature` os exige, mas no documento da campanha eles não existem mais)
        updatedCreatures[creatureIndex] = updatedCreature as unknown as Creature

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
            creature: { ...updatedCreature, ...defenses }
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar criatura')
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireUser()
        const { campaign } = await requireCampaignGM(id, user)

        const { creatureId } = await readJsonBody(request)

        if (!creatureId) {
            return NextResponse.json(
                { error: 'IDs são obrigatórios' },
                { status: 400 }
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

        // A criatura já saiu da campanha; o documento privado das defesas fica órfão se isto falhar, e ninguém o lê
        try {
            await deleteCreatureDefenses(campaign.id, creatureId)
        } catch (error) {
            console.error('[Criaturas] Criatura removida, mas o documento das defesas não foi apagado:', error)
        }

        return NextResponse.json({
            success: true,
            message: 'Criatura removida com sucesso!'
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao remover criatura')
    }
}
