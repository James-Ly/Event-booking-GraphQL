const Event = require('../../models/event')
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
    createEvent: async (args) => {
        try {
            const event = new Event({
                ...args.EventInput,
                creator: '607ec25c28318819fc2779ab'
            })
            const res = await event.save()
            const createdEvent = transformEvent(res)
            const creator = await User.findById('607ec25c28318819fc2779ab')
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