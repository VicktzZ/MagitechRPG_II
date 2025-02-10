import Campaign from '@models/campaign'
import { pusherServer } from '@utils/pusher'

export async function POST(req: Request): Promise<Response> {
    const { campaignCode, userId }: { campaignCode: string; userId: string } = await req.json()
    const response = await Campaign.findOneAndUpdate(
        { campaignCode },
        {
            $pull: {
                'session.users': userId
            }
        }
    )

    if (!response) {
        return Response.json({ message: 'BAD REQUEST - Failed to update session' }, { status: 400 })
    }
    
    console.log({ message: 'User left successfully!', response: response.session })

    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response)
    return Response.json(response, { status: 200 })
}
