import React, { Component } from 'react';
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import AuthContext from '../context/auth-context.js'
import EventList from '../components/Events/EventList/EventList'
import Spinner from '../components/Spinner/Spinner'
import './Events.css'

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
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
        // const event = { title, price, date, description }
        const requestBody = {
            query: `
            mutation{
                createEvent(EventInput:{
                    title:"${title}",
                    description:"${description}",
                    price: ${price},
                    date:"${date}"
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
            `
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
            const event = resData.data.createEvent;
            const events = [...this.state.events]
            events.push({ ...event, userId: this.context.userId })
            this.setState({ ...this.state, events: events })
        }).catch(err => {
            console.log(err)
        })
    }

    fetchEvents() {
        this.setState({ isLoading: true })
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
                }
            }
            `
        }
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        }).then(resData => {
            const events = resData.data.events;
            if (this.isActive) {
                this.setState({ ...this.state, events: events, isLoading: false })
            }
        }).catch(err => {
            console.log(err)
            if (this.isActive) {
                this.setState({ isLoading: false })
            }
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
            mutation{
                bookEvent(EventId:"${this.state.selectedEvent._id}"){
                  _id
                  createdAt
                  updatedAt
                }
              }
            `
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
            console.log(resData)
            this.setState({ isLoading: false, selectedEvent: null })
        }).catch(err => {
            console.log(err)
            this.setState({ isLoading: false })
        })
    }

    componentWillUnmount() {
        this.isActive = false
    }

    render() {
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
                        events={this.state.events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                    />
                }
            </React.Fragment >
        )
    }
}

export default EventsPage