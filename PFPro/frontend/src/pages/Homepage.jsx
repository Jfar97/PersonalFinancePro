// Homepage is the default page navigated to on log-in and displays upcoming events and charges, recent expenses, and all budgets and all savings

// Imports
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {Link} from "react-router-dom";
import ExpenseDisplay from "../components/ExpenseDisplay.jsx";
import RecurringChargeDisplay from "../components/RecurringChargeDisplay.jsx";
import EventDisplay from "../components/EventDisplay.jsx";


function Homepage(props) {
    // State hooks
    const [budgetList, setBudgetList] = useState([]);
    const [userID, setUserID] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [savingsList, setSavingsList] = useState([]);
    const [upcomingChargesEvents, setUpcomingChargesEvents] = useState([]);
    const navigate = useNavigate();

    // Helper function that calls route to delete expense item and then refreshes homepage items
    const handleDeleteExpense = async (expenseId) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            // Calls the delete route for expense item
            await axios.delete(`http://localhost:4000/expenses/${expenseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Fetch updated data after successful deletion
            await fetchAllItems()
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense. Please try again.");
        }
    };

    // Helper function that calls route to delete charge item and then refreshes homepage items
    const handleDeleteCharge = async (chargeId) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            // Calls the delete route for charge item
            await axios.delete(`http://localhost:4000/charges/${chargeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Fetch updated data after successful deletion
            await fetchAllItems();
        } catch (error) {
            console.error("Error deleting charge:", error);
            alert("Failed to delete charge. Please try again.");
        }
    };

    // Helper function that calls route to delete event item and then refreshes homepage items
    const handleDeleteEvent = async (eventId) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            // Calls the delete route for event item
            await axios.delete(`http://localhost:4000/events/${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Fetch updated data after successful deletion
            await fetchAllItems();
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event. Please try again.");
        }
    };

    // Calculates the next date for a recurring charge based upon the charge item information
    const getNextChargeDate = (charge) => {
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let nextDate;

        // Switch statement uses the frequency of the charge to select correct way to calculate next charge
        switch (charge.frequency) {
            // Daily frequency sets charge date to the current date
            case 'daily':
                nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                break;
            // Weekly frequency calculates the next occurrence of the specified day of the week
            case 'weekly':
                nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 + charge.dayOfWeek - today.getDay()) % 7);
                break;
            // Monthly frequency checks if the date of the month has passed for the current month, and sets it to the next month if so
            case 'monthly':
                nextDate = new Date(today.getFullYear(), today.getMonth(), charge.dayOfMonth);
                if (nextDate < todayMidnight) {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                break;
            // Annually frequency checks if the day of the month and the month itself has passed, and sets the charge date to the next year if so
            case 'annually':
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

    // Calculates the next date an event will occur on based upon the event item information
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

        // First section is for multi-day events
        if (event.endDate) {
            console.log("Multi-day event detected");
            const eventDuration = nextEndDate - nextStartDate;

            //Checks to see if the next date for the event needs to be updated at all
            if (nextEndDateMidnight >= todayMidnight || event.frequency === 'once') {
                console.log("Event hasn't ended yet or is a 'once' event. Using original dates.");
                nextEndDate.setDate(nextEndDate.getDate() + 1); // Add one day to include the last day
                return { start: nextStartDate, end: nextEndDate };
            }

            // For repeating events that have passed
            switch (event.frequency) {
                // Weekly events that have passed have their start and end dates moved up a week
                case 'weekly':
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setDate(nextStartDate.getDate() + 7);
                        nextEndDate.setDate(nextEndDate.getDate() + 7);
                        nextStartDateMidnight.setDate(nextStartDateMidnight.getDate() + 7);
                        nextEndDateMidnight.setDate(nextEndDateMidnight.getDate() + 7);
                    }
                    break;
                // Monthly events that have passed have their start and end date months moved up one
                case 'monthly':
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setMonth(nextStartDate.getMonth() + 1);
                        nextEndDate.setMonth(nextEndDate.getMonth() + 1);
                        nextStartDateMidnight.setMonth(nextStartDateMidnight.getMonth() + 1);
                        nextEndDateMidnight.setMonth(nextEndDateMidnight.getMonth() + 1);
                    }
                    break;
                // Annual events that have passed have their start and end dates years move up one
                case 'annually':
                    while (nextEndDateMidnight < todayMidnight) {
                        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
                        nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
                        nextStartDateMidnight.setFullYear(nextStartDateMidnight.getFullYear() + 1);
                        nextEndDateMidnight.setFullYear(nextEndDateMidnight.getFullYear() + 1);
                    }
                    break;
            }
            nextEndDate.setDate(nextEndDate.getDate()+1);

        // Logic for single day events
        } else {
            // Checks if the next date needs to be updated
            if (event.frequency === 'once' || nextStartDateMidnight >= todayMidnight) {
                console.log("Using original start date");
                return { start: nextStartDate, end: null };
            }
            switch (event.frequency) {
                // Daily events are set to the current date
                case 'daily':
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    break;
                // Weekly events have their day moved up a week if it has passed
                case 'weekly':
                    const daysDiff = (7 + event.dayOfWeek - today.getDay()) % 7;
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysDiff);
                    break;
                // Monthly events have their month moved up one if it has passed
                case 'monthly':
                    nextStartDate = new Date(today.getFullYear(), today.getMonth(), event.dayOfMonth);
                    if (nextStartDate < todayMidnight) {
                        nextStartDate.setMonth(nextStartDate.getMonth() + 1);
                    }
                    break;
                // Annual events have their year moved up one if it has passed
                case 'annually':
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

    // Helper function passed into charge display and event display items
    // Formats dates into more readable versions
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Fetches all items from the database that the homepage will display
    const fetchAllItems = async () => {
        // Check if a user is logged in with JWT token
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            // Decode token for user id
            const decodedToken = jwtDecode(token);
            setUserID(decodedToken.id);

            //Budgets
            // Fetch budgets
            const budgetResponse = await axios.get("http://localhost:4000/budgets", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filter budgets
            const userBudgets = budgetResponse.data.filter(budget => budget.UserId === decodedToken.id);
            setBudgetList(userBudgets);

            // Expenses
            // Fetch expenses
            const expenseResponse = await axios.get("http://localhost:4000/expenses", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userBudgetIds = userBudgets.map(budget => budget.id);
            // Filter expenses
            const filteredExpenses = expenseResponse.data.filter(expense =>
                userBudgetIds.includes(expense.BudgetId)
            );
            // Sort expenses and grab 10 most recent
            const sortedExpenses = filteredExpenses.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentExpenses(sortedExpenses.slice(0, 10));

            // Savings
            // Fetch Savings
            const savingsResponse = await axios.get("http://localhost:4000/savings", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filter Savings
            const userSavings = savingsResponse.data.filter(saving => saving.UserId === decodedToken.id);
            setSavingsList(userSavings);

            // Recurring Charges
            // Fetch recurring charges
            const chargeResponse = await axios.get("http://localhost:4000/charges", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userCharges = chargeResponse.data.filter(charge => charge.UserId === decodedToken.id);

            // Events
            // Fetch events
            const eventResponse = await axios.get("http://localhost:4000/events", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userEvents = eventResponse.data.filter(event => event.UserId === decodedToken.id);

            // Combine and filter upcoming charges and events
            const today = new Date();
            today.setHours(0, 0, 0, 0);  // Set to midnight
            const oneWeekFromNow = new Date(today);
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

            // Processes all charges and events to get their next upcoming date
            const upcomingItems = [
                ...userCharges.map(charge => {
                    const nextDate = getNextChargeDate(charge);
                    return {
                        ...charge,
                        nextDate,
                        type: 'charge'  // this does not cause an error since the homepage does not display the stored charge type, but should rename in the future as this is a blatant oversight on my part
                    };
                }),
                ...userEvents.map(event => {
                    const nextDate = getNextEventDate(event);
                    return {
                        ...event,
                        nextDate: nextDate.start,
                        endDate: nextDate.end,
                        type: 'event'   // same oversight error as with the userCharges mapping, no issue right now since event type is not displayed on the homepage
                    };
                })
            // Filters items to only show those that are included within a week from today
            ].filter(item => {
                if (item.type === 'charge') {
                    return item.nextDate >= today && item.nextDate < oneWeekFromNow;
                } else {
                    // For events, check if they start within the week or are ongoing
                    return (item.nextDate >= today && item.nextDate < oneWeekFromNow) ||
                        (item.endDate && item.endDate >= today && item.nextDate < oneWeekFromNow);
                }
            // Sorts based upon the nextDate of the items
            }).sort((a, b) => a.nextDate - b.nextDate);

            setUpcomingChargesEvents(upcomingItems);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    // Fetches all items when the component mounts or navigation changes
    useEffect(() => {
        fetchAllItems()
    }, [navigate]);


    return (
        <div className="homepage-container-new">
            {/* Recurring Charges and Events Section - Within Next Week */}
            <div className="top-row-container">
                <div className="recurring-charges-container">
                    <h2>Weekly Charges/Events</h2>
                    {/* Checks if the user has any upcoming charges or events */}
                    {upcomingChargesEvents.length > 0 ? (
                        <ul className="upcoming-charge-list">
                            {upcomingChargesEvents.map((item) => (
                                // Uses the item type to choose the correct display component to represent the item
                                <li key={`${item.type}-${item.id}`} className="upcoming-charge-item">
                                    {item.type === 'charge' ? (
                                        <RecurringChargeDisplay
                                            charge={item}
                                            onDelete={handleDeleteCharge}
                                            getNextChargeDate={getNextChargeDate}
                                            formatDate={formatDate}
                                        />
                                    ) : (
                                        <EventDisplay
                                            event={item}
                                            onDelete={handleDeleteEvent}
                                            formatDate={formatDate}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No upcoming charges or events in the next week.</p>
                    )}
                </div>

                {/* Expenses Section - Most Recent */}
                <div className="recent-expenses-container">
                    <h2>Recent Expenses</h2>
                    {/* Checks if the user has recent expenses */}
                    {recentExpenses.length > 0 ? (
                        <ul className="recent-expense-list">
                            {/* Expenses Mapping */}
                            {recentExpenses.map((expense) => (
                                <li key={expense.id} className="recent-expense-item">
                                    <ExpenseDisplay
                                        key={expense.id}
                                        expense={expense}
                                        onDelete={handleDeleteExpense}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No recent expenses found.</p>
                    )}
                </div>
            </div>


            {/* Budgets Section */}
            <div className="budgets-container-new">
                <h1>Your Budgets</h1>
                <div className="budget-card-container">
                    {budgetList.map((value, key) => {
                        // Percent used of the amount of the current budget being mapped
                        const percentUsed = Math.min((value.totalExpenses / value.amount) * 100, 100);
                        // Each iteration maps a new budget item from the database
                        return (
                            // Budget items are also links to their individual budget pages
                            <Link to={`/budgets/${value.id}`} key={key}
                                  style={{textDecoration: 'none', color: 'inherit'}}>
                                <div className="budget-card" key={key}>
                                    {/* Budget Name */}
                                    <div className="budget-header">
                                        {value.name}
                                    </div>
                                    <div className="budget-body">
                                        {/* Budget Amount */}
                                        Budget: ${value.amount}
                                        <br/>

                                        {/* Budget Progress Bar */}
                                        Used: ${value.totalExpenses || 0}
                                        <div className="budget-progress-bar">
                                            <div
                                                className="budget-progress"
                                                style={{width: `${percentUsed}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Savings Section */}
            <div className="savings-container-new">
                <h1>Your Savings</h1>
                <div className={"budget-card-container"}>
                    {savingsList.map((saving, key) => {
                        // Percent of progress made towards savings goal
                        const percentAchieved = Math.min((saving.currentAmount / saving.goal) * 100, 100);
                        // Each iteration maps a new savings item from the database
                        return (
                            // Savings items are also links to their individual savings pages
                            <Link to={`/savings/${saving.id}`} key={key}
                                  style={{textDecoration: 'none', color: 'inherit'}}>
                                <div className="savings-card" key={key}>
                                    {/* Savings Name */}
                                    <div className="savings-header">
                                        {saving.name}
                                    </div>
                                    <div className="savings-body">
                                        {/* Savings Goal */}
                                        Goal: ${saving.goal}
                                        <br/>

                                        {/* Savings Progress Bar */}
                                        Current: ${saving.currentAmount}
                                        <div className="savings-progress-bar">
                                            <div
                                                className="savings-progress"
                                                style={{width: `${percentAchieved}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>

    );
}

export default Homepage;