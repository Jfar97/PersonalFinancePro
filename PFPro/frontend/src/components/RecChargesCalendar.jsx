// ReChargesCalendar component is the calendar that the AccEventsPage, RecurringChargesPage, and Navigation all link to, and displays all the charges and events associated with the account on their next dates of occurence

// Imports
import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function RecChargesCalendar () {
    // State hooks
    const [charges, setCharges] = useState([]);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    // Fetches the charges and events associated with the user to display on the calendar element
    const fetchData = async () => {
        // Check if there is a valid logged in user with a stored token
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken)
        {
            navigate('/login')
            return;
        }
        const decodedToken = jwtDecode(accessToken);

        try {
            // Get all charges
            const chargesResponse = await axios.get("http://localhost:4000/charges", {
                headers: { 'accessToken': accessToken }
            });
            // Get all events
            const eventsResponse = await axios.get("http://localhost:4000/events", {
                headers: { 'accessToken': accessToken }
            });

            // Filter the charges and events to only the ones that have a UserId that matches the one inside the token
            const userCharges = chargesResponse.data.filter(charge => charge.UserId === decodedToken.id);
            const userEvents = eventsResponse.data.filter(event => event.UserId === decodedToken.id);
            setCharges(userCharges);
            setEvents(userEvents);
            console.log("Fetched charges:", userCharges);
            console.log("Fetched events:", userEvents);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Calculates the next charge date based upon the charge items saved data
    const getNextChargeDate = (charge) => {
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let nextDate;

        // Find next charge date for specific frequency
        switch (charge.frequency) {
            case 'daily':
                // Daily charges use current date
                nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                break;
            case 'weekly':
                // Weekly charges use the current week's set day if it has not passed, otherwise sets it to the day next week
                nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 + charge.dayOfWeek - today.getDay()) % 7);
                break;
            case 'monthly':
                // Monthly checks if the day of the month has passed, and sets the month to the next one if it has
                nextDate = new Date(today.getFullYear(), today.getMonth(), charge.dayOfMonth);
                if (nextDate < todayMidnight) {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                break;
            case 'annually':
                // Annually checks if the specific day and month have passed, and sets the month and year to the next one if it has
                nextDate = new Date(today.getFullYear(), charge.month - 1, charge.dayOfMonth);
                if (nextDate < todayMidnight) {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
                break;
            default:
                throw new Error('Invalid frequency');
        }
        return nextDate;
    };

    // Calculate the next date or dates for event item
    const getNextEventDate = (event) => {
        const today = new Date();
        let nextStartDate = new Date(event.startDate);
        let nextEndDate = event.endDate ? new Date(event.endDate) : null;

        // Set dates to midnight for comparison
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const nextStartDateMidnight = new Date(nextStartDate.getFullYear(), nextStartDate.getMonth(), nextStartDate.getDate());
        const nextEndDateMidnight = nextEndDate ? new Date(nextEndDate.getFullYear(), nextEndDate.getMonth(), nextEndDate.getDate()) : null;
        console.log("today (midnight):", todayMidnight);
        console.log("nextStartDate (midnight):", nextStartDateMidnight);
        console.log("nextEndDate (midnight):", nextEndDateMidnight);

        // If the event has an endDate, handle multi-day event
        if (event.endDate) {
            console.log("Multi-day event detected");
            // If date has not passed or event does not repeat, do not change date
            if (nextEndDateMidnight >= todayMidnight || event.frequency === 'once') {
                console.log("Event hasn't ended yet or is a 'once' event. Using original dates.");
                nextEndDate.setDate(nextEndDate.getDate() + 1); // Add one day to include the last day
                return { start: nextStartDate, end: nextEndDate };
            }

            // For repeating events that have passed
            switch (event.frequency) {
                case 'weekly':
                    // Loop through and increase by a week until next date found
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setDate(nextStartDate.getDate() + 7);
                        nextEndDate.setDate(nextEndDate.getDate() + 7);
                        nextStartDateMidnight.setDate(nextStartDateMidnight.getDate() + 7);
                        nextEndDateMidnight.setDate(nextEndDateMidnight.getDate() + 7);
                    }
                    break;
                case 'monthly':
                    // Loop through and increase by a month until next date found
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setMonth(nextStartDate.getMonth() + 1);
                        nextEndDate.setMonth(nextEndDate.getMonth() + 1);
                        nextStartDateMidnight.setMonth(nextStartDateMidnight.getMonth() + 1);
                        nextEndDateMidnight.setMonth(nextEndDateMidnight.getMonth() + 1);
                    }
                    break;
                case 'annually':
                    // Loop through and increase by a year until next date found
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
                        nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
                        nextStartDateMidnight.setFullYear(nextStartDateMidnight.getFullYear() + 1);
                        nextEndDateMidnight.setFullYear(nextEndDateMidnight.getFullYear() + 1);
                    }
                    break;
            }
            nextEndDate.setDate(nextEndDate.getDate()+1);
        // Otherwise handle single day event
        } else {
            // If the event only occurs once or the date has not occurred yet, use original date
            if (event.frequency === 'once' || nextStartDateMidnight >= todayMidnight) {
                console.log("Using original start date");
                return { start: nextStartDate, end: null };
            }
            switch (event.frequency) {
                case 'daily':
                    // Get current date for daily events
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    break;
                case 'weekly':
                    // Get the next day of the week event occurs on
                    const daysDiff = (7 + event.dayOfWeek - today.getDay()) % 7;
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysDiff);
                    break;
                case 'monthly':
                    // Get the next month for the event to occur on
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), event.dayOfMonth);
                    if (nextStartDate < todayMidnight) {
                        nextStartDate.setMonth(nextStartDate.getMonth() + 1);
                    }
                    break;
                case 'annually':
                    // Get the next year and month for the event to occur on
                    nextStartDate = new Date(today.getFullYear(), event.month - 1, event.dayOfMonth);
                    if (nextStartDate < todayMidnight) {
                        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
                    }
                    break;
            }
        }
        console.log("Calculated next start date:", nextStartDate);
        console.log("Calculated next end date:", nextEndDate);
        return { start: nextStartDate, end: nextEndDate };
    };

    // Handles event of clicking on a calendar item to navigate to the respective page
    const handleEventClick = (eventInfo) => {
        const { extendedProps } = eventInfo.event;
        if (extendedProps.kind === 'charge') {
            navigate(`/recurring-charges`);
        } else if (extendedProps.kind === 'event') {
            navigate(`/events`);
        }
    };

    // Map all events and charges the user has into an object to feed into the calendar
    const calendarEvents = [
        ...charges.map(charge => ({
            title: charge.name,
            start: getNextChargeDate(charge),
            backgroundColor: charge.color,
            borderColor: charge.color,
            textColor: 'white',
            extendedProps: {
                amount: charge.amount,
                frequency: charge.frequency,
                type: charge.type,
                kind: 'charge'
            }
        })),
        ...events.map(event => {
            const { start: nextStart, end: nextEnd } = getNextEventDate(event);
            return {
                title: event.name,
                start: nextStart,
                end: nextEnd,
                backgroundColor: event.color,
                borderColor: event.color,
                textColor: 'white',
                extendedProps: {
                    amount: event.amount,
                    frequency: event.frequency,
                    type: event.type,
                    kind: 'event'
                }
            };
        })
    ];

    // Fetches <> when the component mounts or navigation occurs
    useEffect(() => {
        fetchData();
    }, []);

    // Returns a calendar with all events and charges displayed on their next dates of occurrence
    return (
        <div className="calendar-container">
            <FullCalendar
                // Calendar Display Settings
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay'
                }}
                contentHeight="auto"

                // Calendar parameters
                events={calendarEvents}
                eventClick={handleEventClick}

                // Calendar Styling
                eventContent={(eventInfo) => (
                    <div style={{
                        backgroundColor: `${eventInfo.event.backgroundColor}90`,
                        padding: '2px 5px',
                        borderRadius: '5px',
                        border: '1px solid black',
                        color: 'white',
                        textShadow: '1px 1px 2px black',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        width: '100%',
                        cursor: 'pointer'
                    }}>

                    {/* Calendar Event Display */}
                        {/* Event Title */}
                        <b style={{whiteSpace: 'normal'}}>{eventInfo.event.title}</b>

                        {/* Event Amount */}
                        {eventInfo.event.extendedProps.amount &&
                            <div style={{whiteSpace: 'normal'}}>${eventInfo.event.extendedProps.amount}</div>
                        }
                        {/* Event Type */}
                        <div style={{whiteSpace: 'normal'}}>
                            {eventInfo.event.extendedProps.kind}/{eventInfo.event.extendedProps.type}
                        </div>
                    </div>
                )}
            />
        </div>
    );
}

export default RecChargesCalendar;
