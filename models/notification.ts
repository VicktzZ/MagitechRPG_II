import { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema({
    userId: {
        type: String,
        required: [ true, 'UserId is required!' ]
    },
    content: {
        type: String,
        required: [ true, 'Content is required!' ]
    },
    timestamp: {
        type: Date,
        required: [ true, 'Timestamp is required!' ],
        default: Date.now
    },
    link: {
        type: String
    }
})

notificationSchema.methods['clearNotificationsIfLimitReached'] = function(limit: number) {
    if (this['notifications'].length > limit) {
        this['notifications'] = this['notifications'].slice(-limit);
    }
};

const Notification = models['Notification'] || model('Notification', notificationSchema)

export default Notification