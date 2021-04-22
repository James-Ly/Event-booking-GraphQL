const Booking = require('../../models/booking')
const Event = require('../../models/event')
const { transformBooking, transformEvent } = require('./merge')

module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const bookings = await Booking.find()
            return bookings.map((booking) => {
                return transformBooking(booking)
            })
        } catch (error) {
            throw error
        }
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const fetchedEvent = await Event.findOne({ _id: args.EventId })
            const booking = new Booking({
                user: '6080be0aa342cd137cb14725',
                eventId: fetchedEvent
            })
            const result = await booking.save()
            return transformBooking(result)
        } catch (error) {
            throw error
        }
    },
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
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

