const Booking = require('../../models/booking')
const Event = require('../../models/event')
const { transformBooking, transformEvent } = require('./merge')

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find()
            return bookings.map((booking) => {
                return transformBooking(booking)
            })
        } catch (error) {
            throw error
        }
    },
    bookEvent: async (args) => {
        try {
            const fetchedEvent = await Event.findOne({ _id: args.EventId })
            const booking = new Booking({
                user: '607ec25c28318819fc2779ab',
                eventId: fetchedEvent
            })
            const result = await booking.save()
            return transformBooking(result)
        } catch (error) {
            throw error
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.BookingId).populate('eventId')
            const event = transformEvent(booking.eventId)
            await Booking.deleteOne({ _id: args.BookingId })
            return event
        } catch (error) {
            throw error;
        }
    }
}

