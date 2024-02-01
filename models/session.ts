import { Schema, model, models } from 'mongoose';

const sessionSchema = new Schema({
    admin: {
        type: [ String ],
        required: [ true, 'Admin is required!' ]
    },

    sessionCode: {
        type: String,
        required: [ true, 'Session ID is required!' ]
    }
})

const Session = models['Session'] || model('Session', sessionSchema)

export default Session