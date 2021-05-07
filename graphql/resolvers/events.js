const Event = require('../../models/event')
const User = require('../../models/user')
const { transformEvent } = require('./merge')

module.exports = {
    /**
     * Resolver to fetch events data from the database
     * @param {None} 
     * @return {[Object]} a list of events that have been transformed (see more in merge.js)
     */
    events: async (args,req) => {
        try {
            const events = await Event.find()
            return events.map((event) => {
                return transformEvent(event,req.userId)
            })
        } catch (error) {
            throw error
        }
    },
    /**
     * Resolver to create and save a new Event to the database
     * @param {Object} args.EventInput a simple construct of an Event
     * @param {Object} req.isAuth Check whether the user has logged in as this feature is only accessible to user
     * @return {Object} The event that has been created
     */
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const event = new Event({
                ...args.EventInput,
                creator: req.userId
            })
            const res = await event.save()
            const createdEvent = transformEvent(res)
            const creator = await User.findById(req.userId)
            if (!creator) {
                throw new Error('User not found.')
            }
            creator.createdEvents.push(event)
            await creator.save()
            return createdEvent;
        }
        catch (error) {
            throw error
        }
    },
}