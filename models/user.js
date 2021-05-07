const mongoose = require('mongoose');
const Schema = mongoose.Schema

/***  
 * userSchema with four main attributes:
 * 1. email <String> required: Email of the user
 * 2. password <String> required: Password of the user
 * 3. createdEvents [Array<String>]: Events that have been created by this user
***/
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]
})

module.exports = mongoose.model('User', userSchema)