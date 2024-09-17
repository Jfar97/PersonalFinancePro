// AddExpenseOnExpensePage is the component on Expenses that allows the user to add an expense to any budgets associated with the account

// Imports
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {jwtDecode} from "jwt-decode";

function AddExpenseOnExpensePage({onExpenseAdded}) {
    // State hooks
    const navigate = useNavigate();
    const [budgetList, setBudgetList] = useState([]);
    const [userID, setUserID] = useState(null);

    // Fetches all expenses when the component mounts or a navigation occurs
    useEffect(() => {
        // Check to ensure a user is logged in by having a valid JWT token stored, otherwise navigate to login
        const token = sessionStorage.getItem("accessToken");
        if(!token) {
            console.log("No token found, navigating to home");
            navigate('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUserID(decodedToken.id);
            console.log("User ID set:", decodedToken.id);
            // Fetches all budgets
            axios.get("http://localhost:4000/budgets", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            // Filters budget to user associated budgets
            }).then((response) => {
                const userBudgets = response.data.filter(budget => {
                    return budget.UserId === decodedToken.id;
                });

                console.log("Filtered budgets:", userBudgets);
                setBudgetList(userBudgets);
            })
        } catch(error) {
            console.log("Token decoding error: ", error)
        }
    }, [])

    // Sets up the initial values for the expense item
    const initialValues = {
        name: "",
        cost: "",
        BudgetId: ""
    }

    const validationSchema = Yup.object().shape({
        // Ensures the name is a string
        name: Yup.string().required("Name is required"),
        // Ensures the amount of the expense item is a positive number to two decimal places maximum
        cost: Yup.number()
            .typeError("Amount must be a number") // Number check
            .positive("Amount must be greater than zero") // Positive check
            .test(
                "is-decimal",
                "Amount cannot have more than 2 decimal places",
                (val) => {
                    if (val != null) {
                        return /^\d+(\.\d{1,2})?$/.test(val.toString()); // Two decimal places check
                    }
                    return true;
                }
            )
            .required("Cost of the expense is required"),
        BudgetId: Yup.string().required("Budget selection is required")
    })

    // Handles the submission request to add a new expense item to the selected budget
    const onSubmit = async (data, {resetForm}) => {
        console.log("onSubmit triggered with data:", data);
        // Checks for logged-in user through JWT token
        // Most likely can be removed due to redundancy of check earlier in code
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            console.log("No access token found in onSubmit");
            alert("You must be logged in to add an expense");
            navigate('/login');
            return;
        }

        console.log("Sending expense data:", data);

        try {
            // Posts expense to the database through route
            const response = await axios.post("http://localhost:4000/expenses",
                data,
                { headers: { accessToken: accessToken } }
            );
            console.log("Expense created:", response.data);
            alert("Expense Added Successfully");
            // Extra expense error logging as the expense items were having issues being added and associated to the budgets at first
            if (onExpenseAdded) {
                console.log("Calling onExpenseAdded");
                onExpenseAdded();
            } else {
                console.log("onExpenseAdded is not defined");
            }
            // Reset form after successful submission
            resetForm();
        } catch (error) {
            console.error("Error creating expense:", error.response?.data || error.message);
            alert("Failed to create expense. Please try again.");
        }
    };

    // Returns a form that adds a new expense to a selected budget
    return (
        <div className="add-expense">
            <h2 className="add-expense-header">Add An Expense To A Budget</h2>
            <Formik
                // Build submission form
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
            >
                <Form className="add-expense-form">
                    <table className="add-expense-table">
                        <tbody>
                            {/* Name Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="name">Expense Name:</label></td>
                                <td>
                                    <Field
                                        id="name"
                                        name="name"
                                        placeholder="Enter Expense"
                                    />
                                    <ErrorMessage name="name" component="div" className="error-message" />
                                </td>
                            </tr>

                            {/* Cost Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="cost">Expense Cost:</label></td>
                                <td>
                                    <Field
                                        id="cost"
                                        name="cost"
                                        placeholder="Enter Cost"
                                    />
                                    <ErrorMessage name="cost" component="div" className="error-message" />
                                </td>
                            </tr>

                            {/* BudgetId Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="BudgetId">Select a Budget:</label></td>
                                <td>
                                    <Field
                                        as="select"
                                        name="BudgetId"
                                        id="BudgetId"
                                    >
                                        {/* Displays budgets in order of their createdAt date */}
                                        <option value="">Select a budget</option>
                                        {budgetList.sort((a, b) => a.createdAt - b.createdAt).map((budget) => (
                                            <option key={budget.id} value={budget.id}>
                                                {budget.name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="BudgetId" component="div" className="error-message" />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    <div className="button-container">
                        <button type="submit" className="add-button">Add Expense</button>
                    </div>
                </Form>
            </Formik>
        </div>
    );
}

export default AddExpenseOnExpensePage;