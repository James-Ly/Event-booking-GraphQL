const Booking = require('../../models/booking')
const Event = require('../../models/event')
const User = require('../../models/user')
const { transformBooking, transformEvent } = require('./merge')

module.exports = {
    /**
     * Resolver to fetch all bookings a particular user has
     * This resolver will check for authentication before further processing
     * Find all bookings related to a user through the userId
     * @param {Boolean} req.isAuth Check whether a user has logged in
     * @param {String} req.userId Id of a particular user
     * @return {[Object]} list of bookings that has been transformed
     */
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const bookings = await Booking.find({ user: req.userId })
            return bookings.map((booking) => {
                return transformBooking(booking)
            })
        } catch (error) {
            throw error
        }
    },
    /**
     * Resolver to book an Event
     * This resolver will check for authentication before further processing
     * Create a booking for a particular user
     * @param {Boolean} req.isAuth Check whether a user has logged in
     * @param {String} req.userId Id of a particular user
     * @param {String} args.EventId Id of the event that user wants to make bookings
     * @return {Object} The booking that has been made
     */
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const fetchedEvent = await Event.findOne({ _id: args.EventId })
            const currentUser = await User.findById(req.userId)
            if (!currentUser) {
                throw new Error('User not found')
            }
            const booking = new Booking({
                user: req.userId,
                eventId: fetchedEvent
            })
            const result = await booking.save()
            fetchedEvent.bookedUsers.push(currentUser)
            await fetchedEvent.save()
            return transformBooking(result)
        } catch (error) {
            throw error
        }
    },
    /**
     * Resolver to delete a booking
     * This resolver will check for authentication before further processing
     * Delete a booking that user made
     * @param {Boolean} req.isAuth Check whether a user has logged in
     * @param {String} args.BookingId Id of a particular booking
     * @return {Object} The event that user made the booking
     */
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const booking = await Booking.findById(args.BookingId).populate('eventId')
            const event = await Event.findById(booking.eventId)
            await Booking.deleteOne({ _id: args.BookingId })
            bookedUsers_filtered = event.bookedUsers.filter(user => user.toString() !== req.userId.toString())
            event.bookedUsers = bookedUsers_filtered
            await event.save()
            return transformEvent(event)
        } catch (error) {
            throw error;
        }
    }
}

