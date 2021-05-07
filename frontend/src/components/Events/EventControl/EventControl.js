import React from 'react'
import './EventControl.css'

const eventsControl = props => {
    return (
        <div className='events-control'>
            <button className={props.activeOutputType === 'events' ? 'active' : ''}
                onClick={props.onChange.bind(this, 'events')}>
                New
            </button>
            <button className={props.activeOutputType === 'created' ? 'active' : ''}
                onClick={props.onChange.bind(this, 'created')}>
                Created
            </button>
            <button className={props.activeOutputType === 'booked' ? 'active' : ''}
                onClick={props.onChange.bind(this, 'booked')}>
                Booked
            </button>
        </div>
    )
}

export default eventsControl