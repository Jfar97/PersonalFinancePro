// RecurringChargesPage is the page that displays all the user's recurring charge items alongside a color guide, a calendar link, and a component to make new recurring charges

// Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import RecurringChargeDisplay from "../components/RecurringChargeDisplay.jsx";
import AddRecurringChargeToPage from "../components/AddRecurringChargeToPage.jsx";

// Utility functions
// Calculates the next date the charge will occur on based upon it's saved frequency and other fields
const getNextChargeDate = (charge) => {
    const today = new Date();
    // Zero time for current date to act as comparison for later
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let nextDate;

    // Next date is set based upon frequency
    switch (charge.frequency) {
        // Daily - get today's date
        case 'daily':
            nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
        // Weekly - get the upcoming day of the week if it has not passed, otherwise get the day of the next week
        case 'weekly':
            nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 + charge.dayOfWeek - today.getDay()) % 7);
            break;
        // Monthly - check if the day of the month has passed, and either return the day of the current month or the day of the next month
        case 'monthly':
            nextDate = new Date(today.getFullYear(), today.getMonth(), charge.dayOfMonth);
            if (nextDate < todayMidnight) {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            break;
        // Annually - check if the day of the month and month of the year has passed, and either return the day and month of the current year or the next year
        case 'annually':
            nextDate = new Date(today.getFullYear(), charge.month - 1, charge.dayOfMonth);
            if (nextDate < todayMidnight) {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
            break;
        // Catch case used for debugging during sync issues with the charges model
        default:
            throw new Error('Invalid frequency');
    }
    return nextDate;
};


// Formats the date object to appear in the US styling
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

function RecurringChargesPage(props) {
    // State hooks
    const [chargeList, setChargeList] = useState([]);
    const [userID, setUserID] = useState(null);
    const navigate = useNavigate();

    // Array containing the different frequency choices for charge items
    const frequencyOrder = ['daily', 'weekly', 'monthly', 'annually'];

    // Array for the color guide at the top for different charge types
    const colorGuide = {
        bill: "#0c3fca",
        insurance: "#d87708",
        loan: "#00d3b3",
        membership: "#ff04de",
        service: "#2e1965",
        subscription: "#7712a6",
        other: "#eaff00"
    };

    // Get the charges associated with the user from the backend
    const fetchCharges = async (token, userId) => {
        try {
            // Get all charge items
            const chargeResponse = await axios.get("http://localhost:4000/charges", {
                headers: { 'accessToken': token }
            });

            console.log("All charges:", chargeResponse.data);

            // Filter charges based on userId
            const userCharges = chargeResponse.data.filter(charge => charge.UserId === userId);


            // Group charges by frequency
            const groupedCharges = userCharges.reduce((acc, charge) => {
                if (!acc[charge.frequency]) {
                    acc[charge.frequency] = [];
                }
                acc[charge.frequency].push(charge);
                return acc;
            }, {});

            // Sort charges within each frequency group
            frequencyOrder.forEach(frequency => {
                if (groupedCharges[frequency]) {
                    groupedCharges[frequency].sort((a, b) => {
                        return new Date(a.dateOfCharge).getDate() - new Date(b.dateOfCharge).getDate();
                    });
                }
            });

            setChargeList(groupedCharges);
            console.log("Grouped and sorted charges:", groupedCharges);
        } catch (error) {
            console.error("Error fetching charges:", error);
        }
    };

    // Function called on the page to delete a charge item from the database
    const handleDeleteCharge = async (chargeId) => {
        try {
            // Delete route call
            await axios.delete(`http://localhost:4000/charges/${chargeId}`);
            // Refresh charge list to ensure the old charge does not appear, otherwise charge item will still show until page refresh
            setChargeList(prevList => {
                const newList = {...prevList};
                // Filter out charge with matching id
                for (let frequency in newList) {
                    newList[frequency] = newList[frequency].filter(charge => charge.id !== chargeId);
                }
                return newList;
            });
            // Alert user
            alert("Charge successfully deleted")
        } catch (error) {
            console.log("Error deleting charge:", error);
            alert("Failed to delete charge. Please try again.");
        }
    }

    // Refreshes the page to refetch charges to display a new charge when it is added
    const handleChargeAdded = () => {
        // Refetch charges after a new one is added
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken) {
            const decodedToken = jwtDecode(accessToken);
            fetchCharges(accessToken, decodedToken.id);
        }
    };

    // Fetches user's charges when the component mounts or navigation occurs
    useEffect(() => {
        // Ensures that a valid user is logged in with a stored token
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            navigate('/login');
            return;
        }

        try {
            // Decode token to get user id and fetch the user's charges
            const decodedToken = jwtDecode(accessToken);
            setUserID(decodedToken.id);
            fetchCharges(accessToken, decodedToken.id);
        } catch(error) {
            console.log("Token decoding error: ", error);
        }
    }, [navigate]);

    return (
        <div className="charges-container">
            <div className="homepage-container-charges">
                {/* Header */}
                <h1>Your Recurring Charges</h1>

                {/* Calendar Button */}
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

                {/* Charges List */}
                {Object.keys(chargeList).length > 0 ? (
                    // Map the charges by order of frequency
                    frequencyOrder.map(frequency => (
                        // Check if the user has any charges associated
                        chargeList[frequency] && chargeList[frequency].length > 0 && (
                            <div key={frequency} className="frequency-group">
                                <h2 className="add-expense-header">Charged {frequency.charAt(0).toUpperCase() + frequency.slice(1)} </h2>
                                <div className="charge-list-container">
                                    {/* Feed charge data into a charge display for each item */}
                                    <ul>
                                        {chargeList[frequency].map((charge) => (
                                            <RecurringChargeDisplay
                                                key={charge.id}
                                                charge={charge}
                                                onDelete={handleDeleteCharge}
                                                getNextChargeDate={getNextChargeDate}
                                                formatDate={formatDate}
                                            />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                    )
                    ))
                    ) : (
                    <p>No recurring charges found.</p>
                    )}
            </div>

            {/* Add Charge Component */}
            <AddRecurringChargeToPage onChargeAdded={handleChargeAdded}/>
        </div>
);
}

export default RecurringChargesPage;