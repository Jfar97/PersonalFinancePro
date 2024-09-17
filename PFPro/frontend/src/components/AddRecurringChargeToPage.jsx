// AddRecurringChargeToPage is the component on the RecurringChargesPage that allows the user to add a new recurring charge item to their account

// Imports
import React, {useState} from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AddRecurringChargeToPage({onChargeAdded, setErrors}) {
    // State hooks
    const navigate = useNavigate();
    const [frequency, setFrequency] = useState('');

    // Define types of charges and map unique colors to these types
    const typeColors = {
        bill: "#0c3fca",
        insurance: "#d87708",
        loan: "#00d3b3",
        membership: "#ff04de",
        service: "#2e1965",
        subscription: "#7712a6",
        other: "#eaff00"
    };

    // Sets the initial values for the charge item
    const initialValues = {
        name: "",
        amount: "",
        frequency: "",
        type: "",
        dayOfWeek: "",
        dayOfMonth: "",
        month: ""
    };

    const validationSchema = Yup.object().shape({
        // Ensures a string name is entered
        name: Yup.string().required("Name is required"),
        // Ensures a positive number is entered
        amount: Yup
            .number()
            .positive("Amount must be positive")
            .test(
                'is-decimal',
                'Amount should have up to 2 decimal places',
                (val) => {
                    if (val != null) {
                        return /^\d+(\.\d{1,2})?$/.test(val.toString());
                    }
                    return true;
                }
            )
            .required("Amount is required"),
        // Ensures one of the pre-defined frequencies is selected
        frequency: Yup.string().oneOf(['daily', 'weekly', 'monthly', 'annually']).required("Frequency is required"),
        // Ensures one of the pre-defined types in the typeColors array is selected
        type: Yup.string().oneOf(Object.keys(typeColors)).required("Type is required"),
        // If dayOfWeek field is entered, ensures it is a number from 0 to 6
        dayOfWeek: Yup.number().min(0).max(6),
        // If dayOfMonth field is entered, ensures it is a number from 1 to 31
        dayOfMonth: Yup.number().min(1).max(31),
        // If month field is entered, ensures it is a number from 1 to 12
        month: Yup.number().min(1).max(12)
    });

    const getNextDayOfWeek = (dayOfWeek) => {
        // Gets today's date and copies it to result
        const today = new Date();
        const result = new Date(today.getTime());
        // Calculates how many days to add to get the next day of the week
        // If the day has not occurred yet, gives days until the next day of the week
        // If the day has already occurred in the week, gives the days until when it occurs again in the next week
        result.setDate(today.getDate() + (7 + dayOfWeek - today.getDay()) % 7);
        return result;
    }

    // Handles the submission request to create a new charge item using the form
    const onSubmit = async (data, {resetForm}) => {
        // Ensures that a user is logged in with a stored token and then grabs the user ID from the token
        const accessToken = sessionStorage.getItem("accessToken");
        if(!accessToken){
            navigate("/login");
            return;
        }
        const decodedToken = jwtDecode(accessToken)
        const userId = decodedToken.id

        // Ensures that the necessary fields are filled in for the selected frequency
        const errors = {};
        if (data.frequency === 'weekly' && data.dayOfWeek === '') {
            errors.dayOfWeek = "Day of week is required for weekly charges";
        }
        if ((data.frequency === 'monthly' || data.frequency === 'annually') && data.dayOfMonth === '') {
            errors.dayOfMonth = "Day of month is required for monthly and annual charges";
        }
        if (data.frequency === 'annually' && data.month === '') {
            errors.month = "Month is required for annual charges";
        }
        // Stops user from submitting the form until any form errors are handled
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        // Consolidates all currently known data inside a chargeData object
        let dateOfCharge;
        const chargeData = {
            name: data.name,
            amount: data.amount,
            frequency: data.frequency,
            type: data.type,
            color: typeColors[data.type],
            UserId: userId
        };

        // Switch statement gets the dateOfCharge based upon frequency
        // This section is not actually used as the frontend pages all recalculate the next charge date based upon the stored frequency, date, and the current date
        // This section can be removed from the frontend and the model can be reworked to not include it in the future
        switch (data.frequency) {
            case 'daily':
                dateOfCharge = new Date().toISOString().split('T')[0];
                break;
            case 'weekly':
                dateOfCharge = getNextDayOfWeek(parseInt(data.dayOfWeek)).toISOString().split('T')[0];
                chargeData.dayOfWeek = parseInt(data.dayOfWeek);
                break;
            case 'monthly':
                dateOfCharge = new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(data.dayOfMonth)).toISOString().split('T')[0];
                chargeData.dayOfMonth = parseInt(data.dayOfMonth);
                break;
            case 'annually':
                dateOfCharge = new Date(new Date().getFullYear(), parseInt(data.month) - 1, parseInt(data.dayOfMonth)).toISOString().split('T')[0];
                chargeData.dayOfMonth = parseInt(data.dayOfMonth);
                chargeData.month = parseInt(data.month);
                break;
        }
        chargeData.dateOfCharge = dateOfCharge;

        try {
            // Posts the data in the form to the database through the backend route
            const response = await axios.post("http://localhost:4000/charges",
                chargeData,
                { headers: { accessToken: accessToken } },
            )
            console.log("Received charge:", response.data);
            // Alerts user on success, uses parameter function passed in, and resets the form
            alert("You're new charge has been added successfully")
            onChargeAdded()
            resetForm()
        } catch(error) {
            console.error("Error creating recurring charge:", error.response?.data || error.message);
            alert("Failed to create recurring charge. Please try again.");
        }
    }

    // Returns a form that allows a new recurring charge to be added to the charges page
    return (
        <div className="add-charge">
            <h2 className="add-expense-header">Add A Recurring Charge</h2>
            <Formik
                // Build submission form
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {/* values wrapper keeps track of frequency state to display necessary extra fields */}
                {({ values, setFieldValue }) => (
                    <Form className="add-expense-form">
                        <table className="add-expense-table">
                            <tbody>
                                {/* Name Field */}
                                <tr>
                                    <td><label className="add-expense-label" htmlFor="name">Charge Name:</label></td>
                                    <td>
                                        <Field
                                            id="name"
                                            name="name"
                                            placeholder="Enter Charge Name"
                                        />
                                        <ErrorMessage name="name" component="div" className="error-message" />
                                    </td>
                                </tr>

                                {/* Amount Field */}
                                <tr>
                                    <td><label className="add-expense-label" htmlFor="amount">Amount:</label></td>
                                    <td>
                                        <Field
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter Amount"
                                        />
                                        <ErrorMessage name="amount" component="div" className="error-message" />
                                    </td>
                                </tr>

                                {/* Type Field */}
                                <tr>
                                    <td><label className="add-expense-label" htmlFor="type">Type:</label></td>
                                    <td>
                                        <Field
                                            id="type"
                                            name="type"
                                            as="select"
                                        >
                                            <option value="">Select type</option>
                                            {Object.keys(typeColors).map(type => (
                                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="type" component="div" className="error-message" />
                                    </td>
                                </tr>

                                {/* Frequency Field */}
                                <tr>
                                    <td><label className="add-expense-label" htmlFor="frequency">Frequency:</label></td>
                                    <td>
                                        <Field
                                            id="frequency"
                                            name="frequency"
                                            as="select"
                                        >
                                            <option value="">Select frequency</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="annually">Annually</option>
                                        </Field>
                                        <ErrorMessage name="frequency" component="div" className="error-message" />
                                    </td>
                                </tr>

                                {/* dayOfWeek Field */}
                                {values.frequency === 'weekly' && (
                                    // Displays if the frequency selected is 'weekly'
                                    <tr>
                                        <td><label className="add-expense-label" htmlFor="dayOfWeek">Day Of The Week:</label></td>
                                        <td>
                                            <Field as="select" id="dayOfWeek" name="dayOfWeek">
                                                <option value="">Select day</option>
                                                <option value="0">Sunday</option>
                                                <option value="1">Monday</option>
                                                <option value="2">Tuesday</option>
                                                <option value="3">Wednesday</option>
                                                <option value="4">Thursday</option>
                                                <option value="5">Friday</option>
                                                <option value="6">Saturday</option>
                                            </Field>
                                        </td>
                                    </tr>
                                )}

                                {/* dayOfMonth Field */}
                                {(values.frequency === 'monthly' || values.frequency === 'annually') && (
                                    // Displays if the frequency selected is 'monthly' or 'annually'
                                    <tr>
                                        <td><label className="add-expense-label" htmlFor="dayOfMonth">Day Of The Month:</label></td>
                                        <td>
                                            <Field type="number" id="dayOfMonth" name="dayOfMonth" min="1" max="31"/>
                                        </td>
                                    </tr>
                                )}

                                {/* month Field */}
                                {values.frequency === 'annually' && (
                                    // Displays if the frequency selected is 'annually'
                                    <tr>
                                        <td><label className="add-expense-label" htmlFor="month">Month:</label></td>
                                        <td>
                                            <Field as="select" id="month" name="month">
                                                <option value="">Select month</option>
                                                <option value="1">January</option>
                                                <option value="2">February</option>
                                                <option value="3">March</option>
                                                <option value="4">April</option>
                                                <option value="5">May</option>
                                                <option value="6">June</option>
                                                <option value="7">July</option>
                                                <option value="8">August</option>
                                                <option value="9">September</option>
                                                <option value="10">October</option>
                                                <option value="11">November</option>
                                                <option value="12">December</option>
                                            </Field>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                        <div className="button-container">
                            <button type="submit" className="add-button">Add Recurring Charge</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default AddRecurringChargeToPage;