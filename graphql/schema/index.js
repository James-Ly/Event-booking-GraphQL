const { buildSchema } = require('graphql')

module.exports = buildSchema(`
        type Booking{
            _id: ID!
            event:Event!
            user: User!
            createdAt: String!
            updatedAt: String!
        }

        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
            bookedUser: Boolean
        }

        type User{
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        type AuthData{
            userId:ID!
            token: String!
            tokenExpiration: Int!
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String
        }

        input UserInput{
            email: String!
            password: String!
        }

        type RootQuery{
            events: [Event!]!
            bookings: [Booking!]!
            login(email: String!,password:String!): AuthData!
        }

        type RootMutation{
            createEvent(EventInput:EventInput): Event
            createUser(UserInput:UserInput): User
            bookEvent(EventId:ID!):Booking!
            cancelBooking(BookingId:ID!):Event!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `)