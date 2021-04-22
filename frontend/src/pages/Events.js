import React, { Component } from 'react';
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import AuthContext from '../context/auth-context.js'
import './Events.css'

class EventsPage extends Component {
    state = {
        creating: false,
        events: []
    }

    static contextType = AuthContext

    constructor(props) {
        super(props)
        this.titleEl = React.createRef();
        this.priceEl = React.createRef();
        this.dateEl = React.createRef();
        this.descriptionEl = React.createRef();
    }

    eventHandler = () => {
        this.setState({ ...this.state, creating: !this.state.creating })
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
            events.push(event)
            this.setState({ ...this.state, events: events })
        }).catch(err => {
            console.log(err)
        })
    }

    fetchEvents() {
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
            this.setState({ ...this.state, events: events })
        }).catch(err => {
            console.log(err)
        })
    }
    componentDidMount() {
        this.fetchEvents()
    }

    render() {
        const eventList = this.state.events.map(event => {
            return <li className='events__list_item' key={event._id}>{event.title}</li>

        })
        return (
            <React.Fragment>
                {this.state.creating && <Backdrop onClick={this.eventHandler} />}
                {this.state.creating &&
                    <Modal
                        title='Add Event'
                        canCancel={true}
                        canConfirm={true}
                        onCancel={this.eventHandler}
                        onConfirm={this.modalConfirmHandler}>
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
                    <button className='btn' onClick={this.eventHandler}>Create Event</button>
                </div>}
                <section className='events__list'>
                    {eventList}
                </section>
            </React.Fragment>
        )
    }
}

export default EventsPage