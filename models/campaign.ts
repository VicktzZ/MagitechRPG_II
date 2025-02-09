import type { Campaign as CampaignType } from '@types';
import { Schema, model, models } from 'mongoose';

const messageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    by: {
        id: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }
}, { _id: false });

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
            users: {
                type: [ String ],
                default: []
            },
            messages: {
                type: [ messageSchema ],
                default: []
            }
        }),
        required: [ true, 'Session is required!' ],
        default: () => ({
            users: [],
            messages: []
        })
    }
});

const Campaign = models['Campaign'] || model('Campaign', campaignSchema);

export default Campaign;