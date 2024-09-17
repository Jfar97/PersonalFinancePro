// CreateBudget is the component on the AllBudgets page that allows the user to create a new budget

// Imports
import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import {useNavigate} from "react-router-dom";
import * as Yup from 'yup';
import axios from 'axios';

function CreateBudget({onBudgetAdded}) {
    //State hooks
    const navigate = useNavigate();

    // Sets the initial values for the budget item
    const initialValues = {
        name: "",
        amount: "",
    }

    const validationSchema = Yup.object().shape({
        // Ensures the name is a string
        name: Yup.string().required("Name is required"),
        // Ensures the amount set for the budget is a positive number with a maximum of two decimal places
        amount: Yup.number()
            .typeError("Amount must be a number") // Number Check
            .positive("Amount must be greater than zero") // Positive Check
            .test(
                "is-decimal",
                "Amount cannot have more than 2 decimal places",
                (val) => {
                    // Check to see if there is one number before the decimal minimum and two decimal places maximum
                    if (val != null) {
                        return /^\d+(\.\d{1,2})?$/.test(val.toString());
                    }
                    return true;
                }
            )
            .required("Amount is required"),
    })

    // Function that handles the submission request to create a new Budget
    const onSubmit = async (data, {resetForm}) => {
        // Checks if a JWT token is stored representing the logged-in user
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must be logged in to create a budget");
            navigate('/login');
            return;
        }
        // Posts new budget item to the database and refreshes the page after alerting the user if successful
        try {
            const response = await axios.post("http://localhost:4000/budgets", data, {
                headers: { accessToken: accessToken }
            });
            console.log("Budget created:", response.data);
            alert("Budget created successfully");
            onBudgetAdded()
            resetForm()
        } catch (error) {
            console.error("Error creating budget:", error.response?.data || error.message);
            alert("Failed to create budget. Please try again.");
        }
    }

    // Returns the form to add a new budget to AllBudgets page
    return (
        <div className="add-budget">
            <h2 className="add-budget-header">Create Budget</h2>
            <Formik
                // Build submission form
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
            >
                <Form className="add-budget-form">
                    <table className="add-expense-table">
                        <tbody>
                            {/* Name Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="name">Budget Name:</label></td>
                                <td>
                                    <Field
                                        id="name"
                                        name="name"
                                        placeholder="Enter Budget Name"
                                    />
                                    <ErrorMessage name="name" component="div" className="error-message" />
                                </td>
                            </tr>

                            {/* Amount Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="amount">Budget Amount:</label></td>
                                <td>
                                    <Field
                                        id="amount"
                                        name="amount"
                                        placeholder="Enter Budget Amount"
                                    />
                                    <ErrorMessage name="amount" component="div" className="error-message" />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    <div className="button-container">
                        <button type="submit" className="add-button">Create Budget</button>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default CreateBudget;