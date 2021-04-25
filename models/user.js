const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Identify which user creates which event
// ref: set up relation, let mongoose know those data are related.
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

module.exports = mongoose.model('User',userSchema)