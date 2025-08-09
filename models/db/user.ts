import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
    email: {
        type: String,
        unique: [ true, 'Email already exists!' ],
        required: [ true, 'Email is required!' ]
    },

    name: {
        type: String,
        required: [ true, 'Name is required!' ]
        // match: [ /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, 'Username invalid, it should contain 3-20 alphanumeric letters and be unique!' ]
    },

    image: {
        type: String
    },

    fichas: {
        type: [ Schema.Types.ObjectId ],
        ref: 'Ficha',
        required: true,
        default: []
    }
})

const User = models['User'] || model('User', userSchema)

export default User