import Campaign from '@models/campaign'
import Ficha from '@models/ficha'
import User from '@models/user'
import { type NextRequest } from 'next/server'
import type {
    Ficha as FichaType,
    User as UserType,
    Campaign as CampaignType, 
    PlayerInfo
} from '@types'

export async function GET(req: NextRequest): Promise<Response> {
    const campaignCode = req.nextUrl.searchParams.get('code')
    
    const playersInfo: PlayerInfo[] = []
    const campaign = await Campaign.findOne<CampaignType>({ campaignCode })

    if (!campaign) {
        return Response.json({ message: 'BAD REQUEST' }, { status: 400 })
    }

    for await (const player of campaign.players) {
        const user = await User.findById<UserType>(player.userId)
        const userFicha = await Ficha.findById<FichaType>(player.fichaId)
    
        playersInfo.push({
            username: user?.name ?? '',
            image: user?.image ?? '',
            charname: userFicha?.name ?? ''
        })
    }

    if (playersInfo.length > 0) {
        return Response.json(playersInfo)
    }

    return Response.json({})
}