// BudgetPage is the page for a specific budget, similar to IndividualSavingsPage, and contains all expenses associated with the budget and a component to add new expenses to the budget
// This was created before the AllBudgets page, which is why it is called BudgetPage

// Imports
import React, {useState, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import AddExpenseToBudget from "../components/AddExpenseToBudget.jsx";
import ExpenseDisplay from "../components/ExpenseDisplay.jsx";
import {TrashIcon} from "@heroicons/react/24/solid/index.js";

function BudgetPage() {
    // State hooks
    const {budgetId} = useParams();
    console.log("budgetId from useParams:", budgetId);
    const [budget, setBudget] = useState(null);
    const [expenseList, setExpenseList] = useState([]);
    const [newAmount, setNewAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Ensures that the user is logged in with a JWT token
    const accessToken = sessionStorage.getItem("accessToken");
    if(!accessToken) {
        navigate("/login");
    }

    console.log("BudgetPage received budgetId from params:", budgetId);

    // Function that refreshes the budget's page whenever an update is made to the budget
    const refreshBudget = async () => {
        // Re-fetch the budget details
        const token = sessionStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:4000/budgets/${budgetId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        setBudget(response.data);
        // Update expenseList with the latest data
        setExpenseList(response.data.Expenses || []);
        console.log("Refreshed budget data:", response.data);
    };

    // Function that calls the delete route for an expense and then refreshes the budget details
    const handleDeleteExpense = async (expenseId) => {
        try {
            // Delete route call
            await axios.delete(`http://localhost:4000/expenses/${expenseId}`);
            console.log('Expense deleted, fetching updated details');
            // Reloads page with new details
            fetchBudgetDetails()
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense. Please try again.");
        }
    };

    // Function that calls the delete route on the actual budget and then navigates to the home page
    const handleDeleteBudget = async () => {
        if(confirm("Are you sure you want to delete this budget? It can not be recovered")) {
            try {
                // Calls delete route
                const token = sessionStorage.getItem("accessToken");
                await axios.delete(`http://localhost:4000/budgets/${budgetId}`);
                // Remove the deleted expense from the list
                alert("Budget deleted")
                navigate('/budgets')
            } catch (error) {
                console.error("Error deleting budget:", error.response?.data || error.message);
                alert(`Failed to delete budget: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Function that calls the delete route for all expenses to set the sum of total expenses to 0 to reset the budget
    const handleResetBudget = async () => {
        if(confirm("Are you sure you want to reset this budget? All expenses will be deleted")) {
            try {
                // For loop calls delete route on each expense associated with the budget
                for(const expense of budget.Expenses) {
                    await axios.delete(`http://localhost:4000/expenses/${expense.id}`);
                }
                alert("Budget has been reset")
                // Refreshes page upon successful call
                refreshBudget()
            } catch (error) {
                console.error("Error resetting budget:", error);
                alert("Failed to reset this budget. Please try again.");
            }
        }
    }

    //Fetches all details related to the specific budget
    const fetchBudgetDetails = async () => {
        // Ensures user is logged in, most likely can remove this or the first check above due to code redundancy
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }
        // Sets a loading state to ensure all details are fetched before the updated budget is displayed
        try {
            setIsLoading(true);
            // Gets budget details
            const response = await axios.get(`http://localhost:4000/budgets/${budgetId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Fetched budget details:', response.data);
            setBudget(response.data);
            // Gets associated expenses
            setExpenseList(response.data.Expenses || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching budget details:', error);
            if (error.response && error.response.status === 401) {
                alert('Your session has expired. Please log in again.');
                sessionStorage.removeItem('accessToken');
                navigate('/login');
            } else {
                setError('Failed to fetch budget details. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Function that calls the put route to edit the budget amount
    const handleUpdateAmount = async () => {
        // Validate the input: positive number with up to 2 decimal places
        const amountRegex = /^\d+(\.\d{1,2})?$/;
        if (!amountRegex.test(newAmount) || parseFloat(newAmount) <= 0) {
            alert('Please enter a positive number with up to two decimal places.');
            return;
        }

        try {
            // Calls put route
            await axios.put(`http://localhost:4000/budgets/${budgetId}`, { amount: newAmount });
            // Alert user and reset form and page
            alert('Budget amount updated successfully');
            setNewAmount('');
            refreshBudget();
        } catch (error) {
            console.error("Error updating budget amount:", error);
            alert("Failed to update budget amount. Please try again.");
        }
    };

    // Fetches all savings when the component mounts or navigation occurs
    useEffect(() => {
        fetchBudgetDetails();
    }, [budgetId, navigate]);

    // Variable that represents the sum of all the amounts of expense items associated to the budget's id
    const totalExpenses = useMemo(() => {
        if (budget && budget.Expenses) {
            return budget.Expenses.reduce((sum, expense) => sum + parseFloat(expense.cost), 0);
        }
        return 0;
    }, [budget]);

    // Circular progress bar for the budget item, based upon the one created for savings items
    const CircularProgressBar = ({ percentage }) => {
        // Defines the radius
        const radius = 50;
        // Calculates the circumference from the radius
        const circumference = radius * 2 * Math.PI;
        // Ensures the percentage does not exceed 100%
        const clampedPercentage = Math.min(percentage, 100);
        // Calculate the cutoff for the line of the progress bar
        const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

        return (
            <svg height="124" width="124" viewBox="0 0 124 124">
                {/* Outer border circle */}
                <circle
                    stroke="#000000"
                    fill="transparent"
                    strokeWidth="2"
                    r="55"
                    cx="62"
                    cy="62" />

                {/* Background circle with light purple fill */}
                <circle
                    stroke="transparent"
                    fill='#f0e6ff'
                    strokeWidth="0"
                    r={radius}
                    cx="62"
                    cy="62" />

                {/* Outer circle with white border */}
                <circle
                    stroke="white"
                    fill="transparent"
                    strokeWidth="10"
                    r={radius}
                    cx="62"
                    cy="62" />

                {/* Inner border circle */}
                <circle
                    stroke="#000000"
                    fill="transparent"
                    strokeWidth="1"
                    r="45"
                    cx="62"
                    cy="62" />

                {/* Progress circle */}
                <circle
                    stroke='#3f0373'
                    fill="transparent"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                    }}
                    r={radius}
                    cx="62"
                    cy="62"
                />

                {/* Text in the center of the circle */}
                <text x="51%" y="49%" textAnchor="middle" dy=".3em" fill="#000" fontSize="20">
                    {`${percentage.toFixed(1)}%`}
                </text>
                {percentage >= 100 && (
                    <text x="51%" y="65%" textAnchor="middle" fill='#3f0373' fontSize="12">
                        Over-budget
                    </text>
                )}
            </svg>
        );
    };

    // Conditional rendering for loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Conditional rendering for error state
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Check for null budget
    if (!budget) {
        return <div>No budget found</div>;
    }

    // Calculating the percent of the progress bar that has been used
    const progressPercentage = (totalExpenses / budget.amount) * 100;

    // Returns a page with budget details and progress bar above all associated expenses alongside a component to add new expenses and management options to change the amount and delete the budget
    return (
        <div className="homepage-container">
            <div className="homepage-container-budgets">
                {/* Budget Name */}
                <h1>{budget.name}</h1>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <table style={{marginRight: '20px'}}>
                        <tbody>
                        <tr>
                            {/* Budget Amount Available */}
                            <td><strong>Budget Amount:</strong></td>
                            <td>${budget.amount}</td>
                        </tr>
                        <tr>
                            {/* Budget Amount Used */}
                            <td><strong>Expenses Total:</strong></td>
                            <td>${totalExpenses.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                    {/* Budget Circular Progress Bar */}
                    <CircularProgressBar percentage={progressPercentage}/>
                </div>

                {/* Budget's Expenses List */}
                <h2 className="add-expense-header">Expenses</h2>
                <ul className="expense-list">
                    {/* Maps each expense item to the expense display component for the list */}
                    {budget.Expenses && budget.Expenses.map((expense) => (
                        <ExpenseDisplay
                            key={expense.id}
                            expense={expense}
                            onDelete={handleDeleteExpense}
                        />
                    ))}
                </ul>
            </div>
            <div className="add-expense-to-budget">
                {/* Add Expense Component */}
                <AddExpenseToBudget
                    name={budget.name}
                    BudgetId={Number(budgetId)}
                    onExpenseAdded={refreshBudget}
                />
                <h1 className="add-expense-header">Manage Budget</h1>

                {/* Update Budget Amount */}
                <div>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="New budget amount"
                    />
                    <button className="centered-add-button" onClick={handleUpdateAmount}>Update Amount</button>
                </div>

                {/* Reset Budget Button */}
                <button className="centered-add-button" onClick={handleResetBudget}>
                    Reset Budget
                </button>

                {/* Handle Delete Button */}
                <button
                    onClick={handleDeleteBudget}
                    className="delete-button"
                >
                    Delete Budget
                    <TrashIcon width={20} height={20}/>
                </button>

            </div>
        </div>
    );
}

export default BudgetPage;