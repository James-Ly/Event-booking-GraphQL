const Event = require('../../models/event')
const User = require('../../models/user')
const { dateToString } = require('../../helpers/date')

const event = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        console.log('events', events)
        return events.map(event => {
            return transformEvent(event)
        })
    } catch (err) {
        throw err
    }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event)
    } catch (error) {
        throw error
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return { ...user._doc, _id: user.id, createdEvents: event.bind(this, user.createdEvents) }
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
        _id: booking._doc._id,
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