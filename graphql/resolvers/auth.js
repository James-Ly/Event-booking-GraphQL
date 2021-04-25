const bcrypt = require('bcryptjs')
const User = require('../../models/user')
const jwt = require('jsonwebtoken')

module.exports = {
    /**
     * Resolver to create a new user
     * use bcrypt hash 12 rounds algorithm for the password
     * @param {Object} args.UserInput simple structure for a user
     * @return {Object} new user
     */
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
    },
    /**
     * Resolver for logging in
     * use bcrypt compare to validate the password
     * @param {String} email user email
     * @param {String} password accoutn password
     * @return {Object} an Object contains userId, token and tokenExpiration time.
     */
    login: async ({ email, password }) => {
        try {
            const user = await User.findOne({ email: email })
            if (!user) {
                throw new Error('User does not exist!')
            }
            const isEqual = await bcrypt.compare(password, user.password)
            if (!isEqual) {
                throw new Error('Password is incorrect')
            }
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.SECRET, {
                expiresIn: '1h'
            })
            return { userId: user.id, token: token, tokenExpiration: 1 }
        } catch (error) {
            throw new Error(error)
        }

    }
}

