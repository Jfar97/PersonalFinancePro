// AddExpenseToBudget is the component on a specific budget's BudgetPage that allows new expenses to be added to that budget

// Imports
import React from 'react';
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import {ErrorMessage, Field, Form, Formik} from "formik";


function AddExpenseToBudget({name, BudgetId, onExpenseAdded}) {
    // State hooks
    const navigate = useNavigate();

    console.log("AddExpenseToBudget received props:", { name, BudgetId });
    // Sets the initial values for the expense item
    const initialValues = {
        name: "",
        cost: "",
    }

    const validationSchema = Yup.object().shape({
        // Ensures the name is a string
        name: Yup.string().required("Name is required"),
        // Ensures the amount of the expense item is a positive number to two decimal places
        cost: Yup.number()
            .typeError("Amount must be a number") // Number Check
            .positive("Amount must be greater than zero") // Positive Check
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
    })

    // Function that handles the submission request to create a new expense item associated to the budget
    const onSubmit = async (data, {resetForm}) => {
        // Checks if a JWT token is stored representing the logged-in user
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must be logged in to add an expense");
            navigate('/login');
            return;
        }
        console.log("Sending expense data:", { ...data, BudgetId });
        // Posts new expense item to the database and then refreshes the page after alerting user if it succeeds
        try {
            const response = await axios.post("http://localhost:4000/expenses",
                { ...data, BudgetId: BudgetId },
                { headers: { accessToken: accessToken } }
            );
            console.log("Expense created:", response.data);
            alert("Expense Added Successfully");
            onExpenseAdded();
            resetForm();
        } catch (error) {
            console.error("Error creating expense:", error.response?.data || error.message);
            alert("Failed to create expense. Please try again.");
        }
    };

    // Returns the form to add a new expense item to the BudgetPage of a specific budget
    return (
        <>
            <h2 className="add-expense-header">Add An Expense To {name}</h2>
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

                        </tbody>
                    </table>
                    <div>
                        <button type="submit" className="add-button">Add Expense</button>
                    </div>
                </Form>
            </Formik>
        </>
    );
}

export default AddExpenseToBudget;