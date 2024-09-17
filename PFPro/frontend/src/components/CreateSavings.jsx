// CreateSavings is the component on SavingsPage that allows the user to add a new savings item

// Imports
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import axios from 'axios';

function CreateSavings({onSavingAdded}) {
    // State hooks
    const navigate = useNavigate();

    // Initial values for the savings item
    const initialValues = {
        name: "",
        goal: "",
        currentAmount: "0"
    }

    const validationSchema = Yup.object().shape({
        // Ensures the name is a string
        name: Yup.string().required("Savings name is required"),
        // Ensures the goal amount set is a number with a maximum of two decimal places
        goal: Yup.number()
            .typeError("Goal must be a number") // Number check
            .positive("Goal must be greater than zero") // Positive number check
            .test(
                "is-decimal",
                "Goal cannot have more than 2 decimal places",
                (val) => {
                    if (val != null) {
                        return /^\d+(\.\d{1,2})?$/.test(val.toString()); // No more than two decimals check
                    }
                    return true;
                }
            )
            .required("Savings goal is required"),
    })

    // Handles form submission for creating a new savings item
    const onSubmit = async (data, { resetForm }) => {
        // Ensures there is a stored JWT token representing a logged in user
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            alert("You must be logged in to create a savings goal");
            navigate('/login');
            return;
        }

        try {
            // Posts new savings item with data and ensures currentAmount is set to 0
            const response = await axios.post("http://localhost:4000/savings", {
                ...data,
                currentAmount: parseFloat(data.currentAmount) || 0
            }, {
                headers: { accessToken: accessToken }
            });
            console.log("Savings goal created:", response.data);
            // Alerts user if successful and refreshes page and form
            alert("Savings Goal Added Successfully");
            onSavingAdded();
            resetForm();
        } catch (error) {
            console.error("Error creating savings goal:", error.response?.data || error.message);
            alert("Failed to create savings goal. Please try again.");
        }
    }

    // Returns a form that is used to enter the values for a new savings on the savings page
    return (
        <div className="add-budget">
            <h2 className="add-expense-header">Create a New Savings Goal</h2>
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
                                <td><label className="add-expense-label" htmlFor="name">Savings Name:</label></td>
                                <td>
                                    <Field
                                        id="name"
                                        name="name"
                                        placeholder="Enter Savings Name"
                                    />
                                    <ErrorMessage name="name" component="div" className="error-message" />
                                </td>
                            </tr>

                            {/* Goal Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="goal">Savings Goal:</label></td>
                                <td>
                                    <Field
                                        id="goal"
                                        name="goal"
                                        placeholder="Enter Savings Goal"
                                    />
                                    <ErrorMessage name="goal" component="div" className="error-message" />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    <div className="button-container">
                        <button type="submit" className="add-button">Create Savings Goal</button>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default CreateSavings;