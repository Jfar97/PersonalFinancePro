// AccountPage displays basic information about the number of items in the user's account, and has components to change their password and delete their account

// Imports
import React, {useEffect, useState} from 'react';
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import {TrashIcon} from "@heroicons/react/24/solid/index.js";
import axios from "axios";

function AccountPage(props) {
    // State hooks
    const navigate = useNavigate();
    const accessToken = sessionStorage.getItem("accessToken");
    const [userName, setUserName] = useState();
    const [accountStats, setAccountStats] = useState({
        // Initial account stat values
        savings: 0,
        budgets: 0,
        expenses: 0,
        events: 0,
        charges: 0
    });


    // Fetches all associated items with the user and counts up how many of each item the user has
    const fetchAccountStats = async () => {
        try {
            // Decodes token for the logged-in userId to get associated items
            const decodedToken = jwtDecode(accessToken);
            const userId = decodedToken.id;
            setUserName(decodedToken.username);

            // Gets associated savings, budgets, expenses, events, and charges to the userId
            const [savingsRes, budgetsRes, expensesRes, eventsRes, chargesRes] = await Promise.all([
                axios.get("http://localhost:4000/savings", { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                axios.get("http://localhost:4000/budgets", { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                axios.get("http://localhost:4000/expenses", { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                axios.get("http://localhost:4000/events", { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                axios.get("http://localhost:4000/charges", { headers: { 'Authorization': `Bearer ${accessToken}` } })
            ]);

            // Counts up how many savings, budgets, expenses, events, and charges have been counted up and sets them for the account stats
            const stats = {
                savings: savingsRes.data.filter(saving => saving.UserId === userId).length,
                budgets: budgetsRes.data.filter(budget => budget.UserId === userId).length,
                expenses: expensesRes.data.filter(expense =>
                    budgetsRes.data.some(budget => budget.UserId === userId && budget.id === expense.BudgetId)
                ).length,
                events: eventsRes.data.filter(event => event.UserId === userId).length,
                charges: chargesRes.data.filter(charge => charge.UserId === userId).length
            };
            setAccountStats(stats);
        } catch (error) {
            console.error("Error fetching account stats:", error);
        }
    };

    // Handles the call to the delete route to delete the user
    const handleDeleteUser = async () => {
        if(confirm("Are you sure you want to delete your account?")) {
            if(confirm("Your account can not be recovered. Are you sure?")) {
                try {
                    // Uses decoded token userId for the user delete route and calls the route
                    const decodedToken = jwtDecode(accessToken);
                    await axios.delete(`http://localhost:4000/users/${decodedToken.id}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    // Removes the token, alerts the user, and navigates to the registration page
                    sessionStorage.removeItem("accessToken");
                    alert("Account deleted");
                    navigate('/register');
                } catch (error) {
                    console.error("Error deleting account:", error.response?.data || error.message);
                    alert("Failed to delete account. Please try again.");
                }
            }
        }
    };

    // Fetches all account stats after checking for a logged-in user when the page navigation occurs
    useEffect(() => {
        if (!accessToken) {
            navigate('/login');
        } else {
            fetchAccountStats();
        }
    }, [accessToken, navigate]);

    // Returns a div with the account overview display the number of each item, and a second div that has the components to change the password and delete the account
    return (
        <div className="homepage-container">
            <div className="homepage-container-budgets">
                {/* Account Header */}
                <div>
                    <h1>Account Overview</h1>
                </div>

                <div className="account-stats">
                    <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px'}}>
                        <tbody>
                            {/* User Welcome */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Welcome, {userName}</td>
                            </tr>

                            {/* Number of Savings Items */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Savings Goals:</td>
                                <td style={{padding: '5px'}}>{accountStats.savings}</td>
                            </tr>

                            {/* Number of Budget Items */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Budgets:</td>
                                <td style={{padding: '5px'}}>{accountStats.budgets}</td>
                            </tr>

                            {/* Number of Expense Items */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Expenses:</td>
                                <td style={{padding: '5px'}}>{accountStats.expenses}</td>
                            </tr>

                            {/* Number of Event Items */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Events:</td>
                                <td style={{padding: '5px'}}>{accountStats.events}</td>
                            </tr>

                            {/* Number of Charge Items */}
                            <tr>
                                <td style={{padding: '5px', fontWeight: 'bold'}}>Recurring Charges:</td>
                                <td style={{padding: '5px'}}>{accountStats.charges}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
            <div className="add-expense">
                {/*Manage Account Header */}
                <h2 className="add-expense-header">Manage Your Account</h2>

                {/* Change Password Button */}
                <button onClick={() => navigate('/change-password')} className="add-button">
                    Change Password
                </button>

                {/* Delete Account Button */}
                <button
                    onClick={handleDeleteUser}
                    className="delete-account-button"
                >
                    Delete Account
                    <TrashIcon width={20} height={20}/>
                </button>

            </div>
        </div>
    );
}

export default AccountPage;
