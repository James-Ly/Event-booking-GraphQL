import React, { Component } from 'react';
import AuthContext from '../context/auth-context'
import Spinner from '../components/Spinner/Spinner'
import BookingList from '../components/Bookings/BookingList/BookingList'

class BookingPage extends Component {
    state = {
        isLoading: false,
        bookings: []
    }

    static contextType = AuthContext
    /**
     * Function to fetch all bookings from the back-end
     * @param {None} None
     */
    fetchBookings() {
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            query{
                bookings{
                    _id
                    createdAt
                    event{
                        _id
                        title
                        date
                    }
                }
            }
            `
        }
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const bookings = resData.data.bookings;
            this.setState({ ...this.state, bookings: bookings, isLoading: false })
        }).catch(err => {
            console.log(err)
            this.setState({ isLoading: false })
        })
    }

    /**
     * Function to fetch all bookings from the back-end
     * @param {String} bookingId id of the booking object that will be sent to the back-end for deletion
     */
    deleteBookingHandler = bookingId => {
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            mutation{
                cancelBooking(BookingId:"${bookingId}"){
                  _id
                  title
                }
              }
            `
        }
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            this.setState(prevState => {
                const updatedBookings = [...prevState.bookings].filter(booking => {
                    return booking._id !== bookingId
                })
                return { bookings: updatedBookings, isLoading: false }
            })
        }).catch(err => {
            console.log(err)
            this.setState({ isLoading: false })
        })
    }

    /**
     * ComponentDidMount to fire off the fetchBookings function when the DOM has been rendered
     * @param {None} None to send request to the back-end for deletion
     */
    componentDidMount() {
        this.fetchBookings()
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner /> :
                    <ul>
                        <BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
                    </ul>
                }
            </React.Fragment>
        )
    }
}

export default BookingPage