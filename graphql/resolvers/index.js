const { graphqlHTTP } = require('express-graphql');
const { UniqueDirectivesPerLocationRule } = require('graphql');
const authResolver = require('./auth')
const eventsResolver = require('./events')
const bookingResolver = require('./booking')

const rootResolver = {
    ...authResolver,
    ...eventsResolver,
    ...bookingResolver
}

module.exports = rootResolver