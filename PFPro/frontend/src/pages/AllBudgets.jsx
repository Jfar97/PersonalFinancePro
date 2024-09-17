// AllBudgets is the frontend page that displays all the budgets associated with an account and has a component to create new budgets

//Imports
import React, {useEffect, useState} from 'react';
import CreateBudget from "../components/CreateBudget.jsx";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";

function AllBudgets() {
    // State hooks
    const [budgetList, setBudgetList] = useState([]);
    const [userID, setUserID] = useState(null);
    const navigate = useNavigate();

    // Gets the budgets from the database
    const fetchBudgets = async () => {
        // Checks for a JWT token stored to indicate a user is logged in
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            // Decode the access token
            const decodedToken = jwtDecode(token);
            setUserID(decodedToken.id);
            // Fetch all budgets
            const budgetResponse = await axios.get("http://localhost:4000/budgets", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filter budgets to user associated budgets
            const userBudgets = budgetResponse.data.filter(budget => budget.UserId === decodedToken.id);
            setBudgetList(userBudgets);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Function called when a new budget is added, ensures that page does not get caught in an infinite loop
    const handleBudgetAdded = () => {
        fetchBudgets();
    };

    // Fetches all savings when the component mounts or a navigation occurs
    useEffect(() => {
        fetchBudgets();
    }, [navigate]);

    // Returns the list of user budgets alongside a component to add new budgets to the account
    return (
        <div className="homepage-container">
            <div className="homepage-container-budgets">
                {/* Your Budget Header */}
                <h1>Your Budgets</h1>
                <div className="budget-card-container-centered">

                    {/* All Account Budgets */}
                    {budgetList.map((value, key) => {
                        // Percent used of the amount of the current budget being mapped
                        const percentUsed = Math.min((value.totalExpenses / value.amount) * 100, 100);
                        // Each iteration maps a new budget item from the database
                        return (
                            // Budget items are also links to their individual budget pages
                            <Link
                                to={`/budgets/${value.id}`}
                                key={key}
                                style={{textDecoration: 'none', color: 'inherit'}}
                            >
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
            <CreateBudget onBudgetAdded={handleBudgetAdded} />
        </div>
    );
}

export default AllBudgets;