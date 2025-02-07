import type { Campaign as CampaignType } from '@types';
import { Schema, model, models } from 'mongoose';

const campaignSchema = new Schema<CampaignType>({
    admin: {
        type: [ String ],
        required: [ true, 'Admin is required!' ]
    },

    campaignCode: {
        type: String,
        required: [ true, 'Campaign ID is required!' ]
    },
    
    title: {
        type: String,
        required: [ true, 'Campaign title is required!' ]
    },

    description: {
        type: String,
        required: [ true, 'Campaign description is required!' ]
    },

    players: {
        type: [ Object ],
        required: [ true, 'Players is required!' ],
        default: []
    },

    session: {
        type: new Schema({
            admins: {
                type: [ String ],
                default: []
            },
            players: {
                type: [ String ],
                default: []
            },
            messages: {
                type: [ String ],
                default: []
            }
        }),
        required: [ true, 'Session is required!' ],
        default: () => ({ players: [], messages: [], admins: [] })
    }
})

const Campaign = models['Campaign'] || model('Campaign', campaignSchema)

export default Campaign