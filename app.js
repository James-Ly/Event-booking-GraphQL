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

// set the header for the front-end to fetch data
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next()
})

app.use(isAuth)

app.use('/graphql',
    graphqlHTTP({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        // Access the api interface
        graphiql: true
    }));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@james.ytf8l.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Server is up and listening in port ' + process.env.PORT);
        });
    })
    .catch((error) => {
        console.log(error)
    })



