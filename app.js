const express = require('express');
const app = express();
// middleware, take the request and funnel them through sqlqueryparser set the resolver in the schema.

// function that take javascript string to build our schema
// coverts the string to javascript object
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const graphQlSchema = require('./graphql/schema/index')
const graphQlResolvers = require('./graphql/resolvers/index')
const { graphqlHTTP } = require('express-graphql');
const isAuth = require('./middleware/is-auth');

app.use(express.json());

// two-way binding
app.use(isAuth)
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
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        // Access the api interface
        graphiql: true
    }));

app.get('/', (req, res, next) => {
    res.send('Hello World!');
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.zsh3x.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is up and listening in port 3000');
        });
    })
    .catch((error) => {
        console.log(error)
    })



