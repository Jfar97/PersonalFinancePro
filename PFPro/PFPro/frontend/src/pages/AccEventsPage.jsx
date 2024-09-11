// AccEventsPage is the page that displays all the events associated with the user broken up into categories by frequency, and gives a component to add new events to the account

// Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import RecurringChargeDisplay from "../components/RecurringChargeDisplay.jsx";
import AddRecurringChargeToPage from "../components/AddRecurringChargeToPage.jsx";
import EventDisplay from "../components/EventDisplay.jsx";
import AddEventToPage from "../components/AddEventToPage.jsx";

// Helper function passed into event display items
// Formats the date to be shown
const formatDate = (dateInput) => {
    // If no date, then 'N/A'
    if (!dateInput)
    {
        return 'N/A';
    }

    let date;
    // If date is a string, convert to a Date object
    if (typeof dateInput === 'string')
    {
        date = new Date(dateInput);
    }
    // If the input is already a Date object, no changes needed
    else if (dateInput instanceof Date)
    {
        date = dateInput;
    }
    // Else block acts as catch state for an invalid input
    else
    {
        return 'Invalid Date';
    }

    // Catches a Date object that is not valid
    if (isNaN(date.getTime()))
    {
        return 'Invalid Date';
    }

    // Formats the date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',    // Full year
        month: 'long',      // Full month name
        day: 'numeric'      // Day of the month
    });
};

function AccEventsPage() {
    // State hooks
    const [eventList, setEventList] = useState([]);
    const [userID, setUserID] = useState(null);
    const navigate = useNavigate();

    // Array containing pre-defined frequencies
    const frequencyOrder = ['once', 'daily', 'weekly', 'monthly', 'annually'];

    // Array used to show the associated colors for different event types
    const colorGuide = {
        anniversary: "#FFA07A",
        appointment: "#c8ea8b",
        class: "#850a60",
        concert: "#005001",
        conference: "#465795",
        festival: "#88ffc0",
        holiday: "#00CED1",
        meeting: "#55ff00",
        practice: "#ff376d",
        reunion: "#fb0000",
        sport: "#9cd6ff",
        vacation: "#ff5733",
        wedding: "#33ff57",
        other: "#c533ff"
    };

    // Fetches all the events from the database that are associated with the logged-in user
    const fetchEvents = async (token, userId) => {
        try {
            // Gets all events
            const eventResponse = await axios.get("http://localhost:4000/events", {
                headers: { 'accessToken': token }
            });
            console.log("All events:", eventResponse.data);

            // Filter events based on userId
            const userEvents = eventResponse.data.filter(event => event.UserId === userId);

            // Group events by frequency
            const groupedEvents = userEvents.reduce((acc, event) => {
                const frequency = event.frequency || 'once';
                if (!acc[frequency]) {
                    acc[frequency] = [];
                }
                acc[frequency].push(event);
                return acc;
            }, {});

            // Sort events within each frequency group by start date
            frequencyOrder.forEach(frequency => {
                if (groupedEvents[frequency]) {
                    groupedEvents[frequency].sort((a, b) => {
                        return new Date(a.startDate) - new Date(b.startDate);
                    });
                }
            });

            console.log("Grouped events:", groupedEvents);
            console.log("Annual events:", groupedEvents['annually']);

            setEventList(groupedEvents);
            console.log("Grouped and sorted events:", groupedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    // Handles the delete call for an event item
    const handleDeleteEvent = async (eventId) => {
        try {
            // Calls the delete route on the eventId
            await axios.delete(`http://localhost:4000/events/${eventId}`);
            // Filters the event out of the list, so it is no longer displayed on the frontend to avoid page refresh errors
            setEventList(prevList => {
                const newList = {...prevList};
                for (let frequency in newList) {
                    newList[frequency] = newList[frequency].filter(event => event.id !== eventId);
                }
                return newList;
            });
            alert("Event successfully deleted");
        } catch (error) {
            console.log("Error deleting event:", error);
            alert("Failed to delete event. Please try again.");
        }
    }

    // Refreshes the page when an event is added so that the new event item is displayed on the page
    const handleEventAdded = () => {
        // Refetch events after a new one is added
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken) {
            const decodedToken = jwtDecode(accessToken);
            fetchEvents(accessToken, decodedToken.id);
        }
    };

    // Adds styling to the 'once' and 'annually' frequencies so that they display with better readability
    const formatFrequencyHeader = (frequency) => {
        switch (frequency) {
            case 'once':
                return 'One-time';
            case 'annually':
                return 'Annual';
            default:
                return frequency.charAt(0).toUpperCase() + frequency.slice(1);
        }
    };

    // Fetches all events when page navigation occurs
    useEffect(() => {
        // Ensures that a valid user is logged-in
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            navigate('/login');
            return;
        }

        try {
            // Fetches events associated to the token userId
            const decodedToken = jwtDecode(accessToken);
            setUserID(decodedToken.id);
            fetchEvents(accessToken, decodedToken.id);
        } catch(error) {
            console.log("Token decoding error: ", error);
        }
    }, [navigate]);

    // Returns a div containing all account events split up by frequency, and a second div that has a component to add an event
    return (
        <div className="charges-container">
            <div className="homepage-container-charges">
                {/* Account Events Header */}
                <h1>Your Events</h1>

                {/* Calendar Link */}
                <Link className="submit-button" to="/calendar">
                    Calendar View
                </Link>

                {/* Color Guide Section */}
                <div className="color-guide-container">
                    {Object.entries(colorGuide).map(([type, color]) => (
                        <div key={type} className="color-guide-item">
                            <span style={{backgroundColor: color}}></span>
                            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>

                {/* Event-by-Frequency Mapping Section */}
                {frequencyOrder.map(frequency => (
                    eventList[frequency] && eventList[frequency].length > 0 && (
                        <div key={frequency} className="frequency-group">
                            <h2 className="add-expense-header">{formatFrequencyHeader(frequency)} Events</h2>
                            <ul className="charge-list-container">
                                {eventList[frequency].map((event) => (
                                    <EventDisplay
                                        key={event.id}
                                        event={event}
                                        onDelete={handleDeleteEvent}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </ul>
                        </div>
                    )
                ))}

                {/* No Events Section - occurs only if the user has no events */}
                {Object.keys(eventList).length === 0 && (
                    <p>No events found.</p>
                )}
            </div>

            {/* Add Event Component */}
            <AddEventToPage onEventAdded={handleEventAdded} />
        </div>
    );
}

export default AccEventsPage;