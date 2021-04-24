import React, { Component } from 'react';
import AuthContext from '../context/auth-context'
import Spinner from '../components/Spinner/Spinner'
import BookingList from '../components/Bookings/BookingList/BookingList'
import BookingsChart from '../components/Bookings/BookingChart/BookingChart'
import BookingControl from '../components/Bookings/BookingControl/BookingControl'

class BookingPage extends Component {
    state = {
        isLoading: false,
        bookings: [],
        outputType: 'list'
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
                        price
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
            mutation CancelBooking($id:ID!){
                cancelBooking(BookingId:$id){
                  _id
                  title
                }
              }
            `,
            variables: {
                id: bookingId
            }
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

    changeOutputTypeHandler = (outputType) => {
        if (outputType === 'list') {
            this.setState({ outputType: 'list' })
        } else {
            this.setState({ outputType: 'chart' })
        }
    }

    render() {
        let content = <Spinner />;
        if (!this.state.isLoading) {
            content = (
                <React.Fragment>
                    <BookingControl activeOutputType={this.state.outputType}
                        onChange={this.changeOutputTypeHandler} />
                    <div>
                        {this.state.outputType === 'list' ?
                            <BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} /> :
                            <BookingsChart bookings={this.state.bookings} />}
                    </div>
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner /> :
                    <ul>
                        {content}
                    </ul>
                }
            </React.Fragment>
        )
    }
}

export default BookingPage