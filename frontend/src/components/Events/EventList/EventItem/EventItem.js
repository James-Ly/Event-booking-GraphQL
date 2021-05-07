import React from 'react';
import './EventItem.css'

const eventItem = props => {
    let details = (<div>
        <button className='btn' onClick={props.onDetail.bind(this, props.eventId)}>View Details</button>
    </div>)
    if (props.outputType === 'created') {
        details = <div>
            <p>You created this event</p>
        </div>
    } else if (props.outputType === 'booked') {
        details = <div>
            <p>You booked this event</p>
        </div>
    }
    return (< li className='events__list_item'>
        <div>
            <h1>{props.title}</h1>
            <h2>${props.price} - {new Date(props.date).toLocaleDateString()}</h2>
        </div>
        {details}
    </li >)
}

export default eventItem