const Event = require('../../models/event')
const User = require('../../models/user')
const { transformEvent } = require('./merge')

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map((event) => {
                return transformEvent(event)
            })
        } catch (error) {
            throw error
        }
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const event = new Event({
                ...args.EventInput,
                creator: '6080be0aa342cd137cb14725'
            })
            const res = await event.save()
            const createdEvent = transformEvent(res)
            const creator = await User.findById('6080be0aa342cd137cb14725')
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