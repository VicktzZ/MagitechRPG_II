import { connectToDb } from '@utils/database'
import { ObjectId } from 'mongodb'
import Campaign from '@models/campaign'
import Ficha from '@models/ficha'
import { type NextRequest, NextResponse } from 'next/server'
import type { Ficha as FichaType, Campaign as CampaignType } from '@types'

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
    try {
        await connectToDb()
        const { userId, fichaId } = await req.json()

        // Busca a campanha
        const campaign = await Campaign.findOne<CampaignType>({ 
            sessionCode: params.code 
        })

        if (!campaign) {
            return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        }

        // Se o usuário for admin, não precisa adicionar a sessão
        if (campaign.admin.includes(userId)) {
            return NextResponse.json({ success: true })
        }

        // Busca a ficha
        const ficha = await Ficha.findOne<FichaType>({ 
            _id: new ObjectId(fichaId) 
        })

        if (!ficha) {
            return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
        }

        // Verifica se a ficha já tem uma sessão para esta campanha
        const hasSession = ficha.session?.some(s => s.campaignCode === params.code)
        if (hasSession) {
            return NextResponse.json({ success: true })
        }

        // Adiciona a sessão à ficha
        await Ficha.updateOne(
            { _id: new ObjectId(fichaId) },
            {
                $push: {
                    session: {
                        campaignCode: params.code,
                        attributes: {
                            maxLp: ficha.attributes.lp,
                            maxMp: ficha.attributes.mp
                        }
                    }
                }
            }
        )

        // Adiciona o jogador à campanha se ainda não estiver nela
        const playerExists = campaign.players.some(p => p.userId === userId)
        if (!playerExists) {
            await Ficha.updateOne(
                { sessionCode: params.code },
                {
                    $push: {
                        players: {
                            userId,
                            fichaId
                        }
                    }
                }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao entrar na campanha:', error)
        return NextResponse.json({ error: 'Erro ao entrar na campanha' }, { status: 500 })
    }
}
