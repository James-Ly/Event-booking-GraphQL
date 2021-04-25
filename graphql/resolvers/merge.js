const DataLoader = require('dataloader');
const Event = require('../../models/event')
const User = require('../../models/user')
const { dateToString } = require('../../helpers/date');
const { events } = require('../../models/event');

/**
     * DataLoader to fetch the events from the database.
     * @param {[String]} eventIds an array of eventIds received from the request
     * @return {[Object]} list of events
     */
const eventLoader = new DataLoader((eventIds) => {
    return event(eventIds)
});

/**
     * DataLoader to fetch the users from the database.
     * @param {[String]} userIds an array of userIds received from the request
     * @return {[Object]} list of users
     */
const userLoader = new DataLoader((userIds) => {
    return User.find({ _id: { $in: userIds } })
})

const event = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events.sort((a, b) => {
            return (
                eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
            )
        })
        return events.map(event => {
            return transformEvent(event)
        })
    } catch (err) {
        throw err
    }
}

/**
     * Function to query data of a single Event from the database.
     * Uses dataloader to retrieve data.
     * @param {eventId} id of an event
     * @return {Object} an event from the database
     */
const singleEvent = async eventId => {
    try {
        const event = await eventLoader.load(eventId.toString());
        return event
    } catch (error) {
        throw error
    }
}

/**
     * Function to retrieve a single user with userId.
     * Using eventLoader loadMany to get all the events this user has created.
     * @param {userId} userId a String which indicates the id of a user
     * @return {Object} a user from the database
     */
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

/**
     * Function to transform add the creator object and transform the date field to a more readable format
     * @param {Object} userIds an array of userIds received from the request
     * @return {[Object]} list of users
     */
const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    }
}

/**
     * Function to transform createdAt and updatedAt fields to more readable format
     * Add user and event object that are related to this specific booking.
     * @param {[String]} userIds an array of userIds received from the request
     * @return {[Object]} list of users
     */
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

exports.transformEvent = transformEvent
exports.transformBooking = transformBooking