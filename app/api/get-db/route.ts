import Campaign from '@models/campaign';
import Ficha from '@models/ficha';
import Magia from '@models/magia';
import Notification from '@models/notification';
import Poder from '@models/poder';
import User from '@models/user';
import { connectToDb } from '@utils/database';

export async function GET() {
    try {
        await connectToDb()

        const campaigns = await Campaign.find()
        const fichas = await Ficha.find()
        const spells = await Magia.find()
        const powers = await Poder.find()
        const users = await User.find()
        const notifications = await Notification.find()

        const db = {
            campaigns,
            fichas,
            spells,
            powers,
            users,
            notifications
        }

        return Response.json(db)
    } catch (error: any) {
        return Response.json({ message: 'Failed to connect to database', error: error.message }, { status: 500 })
    }
}