const bcrypt = require('bcryptjs')
const Event = require('../../models/event')
const User = require('../../models/user')
const { graphqlHTTP } = require('express-graphql');

const event = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        })
    } catch (err) {
        throw err
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return { ...user._doc, _id: user.id, createdEvents: event.bind(this, user._doc.createdEvents) }
    } catch (err) {
        throw err
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map((event) => {
                return {
                    ...event._doc,
                    _id: event._doc._id.toString(),
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }
            })
        } catch (error) {
            throw error
        }
    },
    createEvent: async (args) => {
        // const event = {
        //     ...args.EventInput,
        //     _id: Math.random().toString(),
        // }
        // events.push(event)
        // return event
        try {
            const event = new Event({
                ...args.EventInput,
                creator: '607ec25c28318819fc2779ab'
            })
            const res = await event.save()
            const createdEvent = { ...args.EventInput, creator: user.bind(this, res._doc.creator) }
            const creator = await User.findById('607ec25c28318819fc2779ab')
            if (!creator) {
                throw new Error('User not found.')
            }
            creator.createdEvents.push(event)
            await creator.save()
            return createdEvent;
        }
        catch (error) {
            console.log(error)
            throw error
        }
    },
    createUser: async args => {
        try {
            let user = await User.findOne({ email: args.UserInput.email })
            if (user) {
                throw new Error('User exists already.')
            }
            const hashedPassword = await bcrypt.hash(args.UserInput.password, 12)
            user = new User({
                email: args.UserInput.email,
                password: hashedPassword
            })
            const result = await user.save()
            return { ...result._doc, password: null, _id: result.id }
        }
        catch (err) {
            throw err
        }
    }
}