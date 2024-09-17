// Expenses is the page that displays all expenses associated with the account, and has the option to reset all budgets by deleting all expenses and a component to add new expenses to any budgets linked to the user

// Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ExpenseDisplay from "../components/ExpenseDisplay.jsx";
import AddExpenseOnExpensePage from "../components/AddExpenseOnExpensePage.jsx";

function Expenses() {
    // State hooks
    const [expenseList, setExpenseList] = useState([]);
    const [budgetList, setBudgetList] = useState([]);
    const [userID, setUserID] = useState(null);
    const navigate = useNavigate();

    // Function fetches all budgets associated with the user and then uses these budgets to fetch all associated expenses
    const fetchBudgetsAndExpenses = async (token, userId) => {
        try {
            // Get request for budgets
            const budgetResponse = await axios.get("http://localhost:4000/budgets", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("All budgets:", budgetResponse.data);
            console.log("Sample budget object:", budgetResponse.data[0]);
            console.log("Decoded token ID:", userId);

            // Filter budgets based on userId
            const userBudgets = budgetResponse.data
                .filter(budget => budget.UserId === userId)
                .map(budget => budget.id);

            console.log("Filtered budgets:", userBudgets);

            // Get request for expenses
            const expenseResponse = await axios.get("http://localhost:4000/expenses", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("All expenses:", expenseResponse.data);

            // Filter expenses based on user's budgets' IDs
            const filteredExpenses = expenseResponse.data.filter(expense =>
                userBudgets.includes(expense.BudgetId)
            );

            // Sort filtered expenses by date, newest first
            const sortedExpenses = filteredExpenses.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setExpenseList(sortedExpenses);
            console.log("Filtered and sorted expenses:", sortedExpenses);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Function that calls the route to delete the expense and refreshes the list of expenses
    const handleDeleteExpense = async (expenseId) => {
        try {
            await axios.delete(`http://localhost:4000/expenses/${expenseId}`);
            // Remove the deleted expense from the list
            setExpenseList(expenseList.filter(expense => expense.id !== expenseId));
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense. Please try again.");
        }
    };

    // Function that handles resetting all budgets by deleting all expense items associated to any user budget
    // This function shares many similarities with fetchBudgetsAndExpenses so it can most likely be reworked to use that function and then call the delete route
    const handleResetAllBudgets = async () => {
        const token = sessionStorage.getItem("accessToken");
        const decodedToken = jwtDecode(token)

        if(confirm("Are you sure you want to reset all of you budgets? None of your expenses can be recovered."))
        {
            // Fetches all budgets
            try {
                const budgetCheck = await axios.get("http://localhost:4000/budgets", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                // Filters the budgets to the ones associated with the JWT token user id
                const userBudgets = budgetCheck.data.filter(budget => budget.UserId === decodedToken.id)
                // Loops through each budget and filters out all expenses not associated with the budgets
                for (const budget of  userBudgets) {
                    const expenseCheck = await axios.get(`http://localhost:4000/expenses/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    const budgetExpenses = expenseCheck.data.filter(expense => expense.BudgetId === budget.id)
                    // Then loops through these expenses to delete them all
                    for(const expense of budgetExpenses)
                    {
                        await axios.delete(`http://localhost:4000/expenses/${expense.id}`);
                    }
                }
                alert("All budgets have been reset");
                await fetchBudgetsAndExpenses(token, decodedToken.id);
            } catch (error) {
                console.error("Error resetting budgets:", error);
                alert("Failed to reset budgets. Please try again.");
            }
        }

    }

    // Handles an expense being added by calling fetchBudgetsAndExpenses after the route, ensuring no infinite loops on the page
    const handleExpenseAdded = async () => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            await fetchBudgetsAndExpenses(token, decodedToken.id);
        }
    };

    // Fetches all expenses when the component mounts or a navigation occurs
    useEffect(() => {
        // Ensure a user is logged-in with a valid stored token
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            // Use decoded token userId to get the associated budgets and ultimately expenses
            const decodedToken = jwtDecode(token);
            setUserID(decodedToken.id);
            fetchBudgetsAndExpenses(token, decodedToken.id);
        } catch(error) {
            console.log("Token decoding error: ", error)
        }
    }, [navigate]);

    // Returns a page that displays all expenses associated to any budgets linked to the user alongside a refresh budgets option that deletes all expenses, and a component that allows new expenses to be added
    return (
        <div className="homepage-container">
            <div className="homepage-container-budgets">
                {/* Expense Header */}
                <h1>Your Expenses</h1>

                {/* Reset All Budgets Button */}
                <button onClick={handleResetAllBudgets} className="reset-budget-button">Reset All Budgets</button>

                {/* Associated Expenses Mapped */}
                {expenseList.length > 0 ? (
                    <ul className="expense-list">
                        {expenseList.map((expense) => (
                            <ExpenseDisplay
                                key={expense.id}
                                expense={expense}
                                onDelete={handleDeleteExpense}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>No expenses found.</p>
                )}
            </div>

            {/* Add Expense Component */}
            <AddExpenseOnExpensePage onExpenseAdded={handleExpenseAdded}/>
        </div>
    );
}

export default Expenses;