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
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const noteSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

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

    notes: {
        type: [ noteSchema ],
        default: []
    },

    custom: {
        type: new Schema({
            items: {
                weapon: {
                    type: [ Object ],
                    default: []
                },
                armor: {
                    type: [ Object ],
                    default: []
                },
                item: {
                    type: [ Object ],
                    default: []
                }
            },
            magias: {
                type: [ Object ],
                default: []
            },
            creatures: {
                type: [ Object ],
                default: []
            },
            skills: {
                type: [ Object ],
                default: []
            }
        }, { _id: false }),
        default: () => ({
            items: {
                weapon: [],
                armor: [],
                item: []
            },
            magias: [],
            creatures: [],
            skills: []
        })
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
        }, { _id: false }),
        required: [ true, 'Session is required!' ],
        default: () => ({
            users: [],
            messages: []
        })
    }
});

campaignSchema.methods['clearMessagesIfLimitReached'] = function(limit: number) {
    if (this['session'].messages.length > limit) {
        this['session'].messages = this['session'].messages.slice(-limit);
    }
};

const Campaign = models['Campaign'] || model('Campaign', campaignSchema);

export default Campaign;