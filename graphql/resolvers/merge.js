const DataLoader = require('dataloader');
const Event = require('../../models/event')
const User = require('../../models/user')
const { dateToString } = require('../../helpers/date');
const { events } = require('../../models/event');

/**
     * DataLoader to fetch the events from the database
     * @param {[String]} eventIds an array of eventIds received from the request
     * @return {[Object]} list of events
     */
const eventLoader = new DataLoader((eventIds) => {
    return event(eventIds)
});

/**
     * DataLoader to fetch the users from the database
     * @param {[String]} userIds an array of userIds received from the request
     * @return {[Object]} list of users
     */
const userLoader = new DataLoader((userIds) => {
    return User.find({ _id: { $in: userIds } })
})

const event = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        return events.map(event => {
            return transformEvent(event)
        })
    } catch (err) {
        throw err
    }
}

const singleEvent = async eventId => {
    try {
        const event = await eventLoader.load(eventId.toString());
        return event
    } catch (error) {
        throw error
    }
}

const user = async userId => {
    try {
        const user = await userLoader.load(userId.toString())
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
        }
    } catch (err) {
        throw err
    }
}

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    }
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking._id,
        user: user.bind(this, booking.user),
        event: singleEvent.bind(this, booking.eventId),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

// exports.user = user
// exports.event = event
// exports.singleEvent = singleEvent
exports.transformEvent = transformEvent
exports.transformBooking = transformBooking