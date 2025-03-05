import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [ true, 'User ID is required!' ]
    },
    title: {
        type: String,
        required: [ true, 'Title is required!' ]
    },
    content: {
        type: String,
        required: [ true, 'Content is required!' ]
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: [ true, 'Type is required!' ],
        enum: [ 'levelUp', 'newMessage', 'newPlayer', 'other' ],
        default: 'other'
    },
    timestamp: {
        type: Date,
        required: [ true, 'Timestamp is required!' ],
        default: Date.now
    }
})

const Notification = mongoose.models['Notification'] || mongoose.model('Notification', notificationSchema)

export default Notification