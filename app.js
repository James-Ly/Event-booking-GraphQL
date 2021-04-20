const express = require('express');
const app = express();
// middleware, take the request and funnel them through sqlqueryparser set the resolver in the schema.
const { graphqlHTTP } = require('express-graphql');
// function that take javascript string to build our schema
// coverts the string to javascript object
const { buildSchema } = require('graphql');

const events = [];

app.use(express.json());

/*************  ***********/
// Where do I find your schema: schema property
// Where do I find the resolver which my request will be forwarded:
// query: fetch data
// mutation: change data, create, update or removing data
// String!: a list of String and not null
// [String!]!: a list of not null String and that list shouldn't be null.
// rootValue: resolver for all the bundles we have
// have the same name of events in the RootQuery

// Create new event object
// Add type: allows us to write more powerful and complex graphql
app.use('/graphql',
    graphqlHTTP({
        schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String
        }

        type RootQuery{
            events: [Event!]!
        }

        type RootMutation{
            createEvent(EventInput:EventInput):Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return events
            },
            createEvent: (args) => {
                const event = {
                    ...args.EventInput,
                    _id: Math.random().toString(),
                }
                events.push(event)
                return event
            }
        },
        // Access the api interface
        graphiql: true
    }));

app.get('/', (req, res, next) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server is up and listening in port 3000');
});