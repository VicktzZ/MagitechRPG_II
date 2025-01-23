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
        type: [ Object ],
        required: [ true, 'Session is required!' ],
        default: []
    }
})

const Campaign = models['Campaign'] || model('Campaign', campaignSchema)

export default Campaign