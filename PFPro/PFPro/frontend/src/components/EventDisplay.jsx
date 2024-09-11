// EventDisplay is the component that organizes the data of an event item and displays it to the user

// Imports
import React from 'react';
import { TrashIcon } from "@heroicons/react/24/solid/index.js";

function EventDisplay({ event, onDelete, formatDate }) {
    // Handles the deletion of an event item
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            onDelete(event.id);
        }
    };

    // Styles the event item color to use the color assigned
    const eventItemStyle = {
        '--event-color': event.color,
        backgroundColor: `${event.color}10`, // Transparent background (10% opacity)
    };

    // Styles the background of the Type Display column to have a darker background of the same color
    const eventTypeStyle = {
        backgroundColor: `${event.color}80`, // 80 represents 50% opacity
        padding: '2px 5px',
        borderRadius: '3px',
        color: 'black',
        textShadow: '0 0 1px rgba(0, 0, 0, 0.5)',
    };

    // Uses passed in formatting function to format the start date and end date if it exists
    const formattedStartDate = formatDate(event.startDate);
    const formattedEndDate = event.endDate ? formatDate(event.endDate) : null;

    // Returns a row item split into multiple columns to display all data about the event item
    return (
        <div key={event.id} className="charge-item" style={eventItemStyle}>
            {/* Name Column */}
            <span>{event.name}</span>

            {/* Amount Column */}
            {event.amount && <span>${event.amount}</span>}

            {/* Frequency Column */}
            <span>{event.frequency}</span>

            {/* Type Column */}
            <span style={eventTypeStyle}>{event.type}</span>

            {/* Start Date Column */}
            <span>Start: {formattedStartDate}</span>

            {/* End Date Column */}
            <span>{formattedEndDate ? `End: ${formattedEndDate}` : 'Single day event'}</span>

            {/* Recurrence Column */}
            {(event.frequency !== 'once' && event.frequency !== 'daily') && (
                // Only displays for events that have a weekly, monthly, or annual frequency
                <span>
                    {event.frequency === 'weekly' && `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][event.dayOfWeek]}`}
                    {event.frequency === 'monthly' && `Every ${event.dayOfMonth}${['st', 'nd', 'rd'][event.dayOfMonth - 1] || 'th'}`}
                    {event.frequency === 'annually' && `Every ${new Date(0, event.month - 1).toLocaleString('default', { month: 'long' })} ${event.dayOfMonth}`}
                </span>
            )}

            {/* Delete Button Column */}
            <button
                className="delete-button"
                onClick={handleDelete}
            >
                <TrashIcon width={20} height={20} />
            </button>

        </div>
    );
}

export default EventDisplay;