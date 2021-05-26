import React, { Component } from 'react';
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import AuthContext from '../context/auth-context.js'
import EventList from '../components/Events/EventList/EventList'
import Spinner from '../components/Spinner/Spinner'
import EventControl from '../components/Events/EventControl/EventControl'
import './Events.css'

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        bookedEvents: [],
        createdEvents: [],
        isLoading: false,
        selectedEvent: null,
        outputType: 'events'
    }
    isActive = true

    static contextType = AuthContext

    constructor(props) {
        super(props)
        this.titleEl = React.createRef();
        this.priceEl = React.createRef();
        this.dateEl = React.createRef();
        this.descriptionEl = React.createRef();
    }

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null })
    }

    startCreateEventHandler = () => {
        this.setState({ creating: true })
    }

    modalConfirmHandler = () => {
        this.setState({ ...this.state, creating: false })
        const title = this.titleEl.current.value;
        const price = +this.priceEl.current.value;
        const date = this.dateEl.current.value;
        const description = this.descriptionEl.current.value;
        if (title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0) {
            return;
        }
        /* Create the request body for querying all events */
        const requestBody = {
            query: `
            mutation CreateEvent($title:String!,$description:String!,$price:Float!,$date:String!){
                createEvent(EventInput:{
                    title:$title,
                    description:$description,
                    price: $price,
                    date:$date
                }){
                    _id
                    title
                    description
                    date
                    price
                    creator{
                        _id
                        email
                    }
                }
            }
            `,
            variables: {
                title: title,
                description: description,
                price: price,
                date: date
            }
        }
        const token = this.context.token
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bear ' + token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const createdEvent = resData.data.createEvent;
            const createdEvents = [...this.state.createdEvents]
            createdEvents.push({ ...createdEvent, userId: this.context.userId })
            this.setState({ ...this.state, createdEvents: createdEvents })
        }).catch(err => {
            console.log(err)
        })
    }

    fetchEvents() {
        this.setState({ isLoading: true })
        const token = this.context.token
        const requestBody = {
            query: `
            query{
                events{
                    _id
                    title
                    description
                    date
                    price
                    creator{
                        _id
                        email
                    }
                    bookedUser
                }
            }
            `
        }
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bear ' + token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const events = resData.data.events;
            if (this.context.userId) {
                const bookedEvents = []
                let createdEvents = []
                const otherEvents = []
                events.forEach(event => {
                    if (event.bookedUser) {
                        bookedEvents.push(event)
                    } else if (event.creator._id === this.context.userId) {
                        createdEvents.push(event)
                    } else {
                        otherEvents.push(event)
                    }
                })
                if (this.isActive) {
                    this.setState({
                        ...this.state,
                        events: otherEvents,
                        bookedEvents: bookedEvents,
                        createdEvents: createdEvents,
                        isLoading: false
                    })
                }
            } else {
                if (this.isActive) {
                    this.setState({
                        ...this.state,
                        events: events,
                        isLoading: false
                    })
                }
            }
        }).catch(err => {
            console.log(err)
            if (this.isActive) {
                this.setState({ isLoading: false })
            }
        })
    }

    deleteEvent = (eventId) => {
        /* Create the request body for deleting event */
        const requestBody = {
            query: `
            mutation CancelEvent($id:ID!){
                cancelEvent(EventId:$id){
                    _id
                    title
                    description
                    date
                    price
                }
            }
            `,
            variables: {
                id: eventId
            }
        }
        const token = this.context.token
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bear ' + token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const createdEvents = [...this.state.createdEvents].filter(event => {
                return !(JSON.stringify(event._id) === JSON.stringify(resData.data.cancelEvent._id))
            })
            this.setState({
                ...this.state,
                createdEvents: createdEvents,
            })
        }).catch(err => {
            console.log(err)
        })
    }

    componentDidMount() {
        this.fetchEvents()
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { ...this.state, selectedEvent: selectedEvent };
        });
    };

    bookEventHandler = () => {
        if (!this.context.token) {
            this.setState({ selectedEvent: null })
            return
        }
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            mutation BookEvent($id:ID!){
                bookEvent(EventId:$id){
                  _id
                  createdAt
                  updatedAt
                  event{
                      _id
                  }
                }
              }
            `,
            variables: {
                id: this.state.selectedEvent._id
            }
        }
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bear ' + this.context.token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const bookedEvents = [...this.state.bookedEvents]
            const events = [...this.state.events]
            const newEvents = []
            events.forEach(event => {
                if (event._id === resData.data.bookEvent.event._id) {
                    bookedEvents.push(event)
                } else {
                    newEvents.push(event)
                }
            })
            this.setState({ isLoading: false, selectedEvent: null, bookedEvents: bookedEvents, events: newEvents })
        }).catch(err => {
            console.log(err)
            this.setState({ isLoading: false })
        })
    }

    componentWillUnmount() {
        this.isActive = false
    }

    changeOutputTypeHandler = (outputType) => {
        if (outputType === 'events') {
            this.setState({ outputType: 'events' })
        } else if (outputType === 'created') {
            this.setState({ outputType: 'created' })
        } else if (outputType === 'booked') {
            this.setState({ outputType: 'booked' })
        }
    }

    render() {
        let events = this.state.events;
        if (this.state.outputType === 'created') {
            events = this.state.createdEvents
        } else if (this.state.outputType === 'booked') {
            events = this.state.bookedEvents
        }
        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedEvent) && <Backdrop onClick={this.modalCancelHandler} />}
                {this.state.creating &&
                    <Modal
                        title='Add Event'
                        canCancel={true}
                        canConfirm={true}
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Confirm"
                    >
                        <form>
                            <div className='form-control'>
                                <label htmlFor='title'>Title</label>
                                <input type='text' id='title' ref={this.titleEl} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='price'>Price</label>
                                <input type='text' id='price' ref={this.priceEl} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='date'>Date</label>
                                <input type='date' id='date' ref={this.dateEl} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='description'>Description</label>
                                <textarea type='text' id='description' rows='4' ref={this.descriptionEl} />
                            </div>
                        </form>
                    </Modal>}
                {this.context.token && <div className="events-control">
                    <p>Shared your own Events!</p>
                    <button className='btn' onClick={this.startCreateEventHandler}>Create Event</button>
                </div>}
                <EventControl activeOutputType={this.state.outputType}
                    onChange={this.changeOutputTypeHandler} />
                {this.state.selectedEvent && <Modal
                    title={this.state.selectedEvent.title}
                    canCancel={true}
                    canConfirm={true}
                    onCancel={this.modalCancelHandler}
                    onConfirm={this.bookEventHandler}
                    confirmText={this.context.token ? "Book" : 'Confirm'}
                >
                    <h1>{this.state.selectedEvent.title}</h1>
                    <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                    <p>{this.state.selectedEvent.description}</p>
                </Modal>}
                {
                    this.state.isLoading ? <Spinner /> : <EventList
                        events={events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                        outputType={this.state.outputType}
                        onDeleteEvent={this.deleteEvent}
                    />
                }
            </React.Fragment >
        )
    }
}

export default EventsPage