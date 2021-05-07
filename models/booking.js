const mongoose = require('mongoose')
const Schema = mongoose.Schema

// timestamps: true update the timestamps
const bookingSchema = Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema)