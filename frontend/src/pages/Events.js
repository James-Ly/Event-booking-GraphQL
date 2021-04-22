import React, { Component } from 'react';
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import './Events.css'


class EventsPage extends Component {
    state = {
        creating: false
    }

    eventHandler = () => {
        this.setState({ creating: !this.state.creating })
    }

    render() {
        return (
            <React.Fragment>
                {this.state.creating && <Backdrop onClick={this.eventHandler} />}
                {this.state.creating && <Modal canCancel={true} canConfirm={true} onCancel={this.eventHandler}>
                    <p>Modal content</p>
                </Modal>}
                <div className="events-control">
                    <p>Shared your own Events!</p>
                    <button className='btn' onClick={this.eventHandler}>Create Event</button>
                </div>
            </React.Fragment>
        )
    }
}

export default EventsPage