// AddEventToPage is the component on the AccEventsPage that allows the user to add new events to their account

// Imports
import React, { useState } from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AddEventToPage({ onEventAdded, setErrors }) {
    // State hooks
    const navigate = useNavigate();
    const [isMultiDay, setIsMultiDay] = useState(false);

    // Array that defines the types of events and associates a unique color with each event type
    const typeColors = {
        anniversary: "#FFA07A",
        appointment: "#c8ea8b",
        class: "#850a60",
        concert: "#005001",
        conference: "#465795",
        festival: "#88ffc0",
        holiday: "#00CED1",
        meeting: "#55ff00",
        practice: "#ff376d",
        reunion: "#fb0000",
        sport: "#9cd6ff",
        vacation: "#ff5733",
        wedding: "#33ff57",
        other: "#c533ff"
    };

    // Sets the initial values for the event item
    const initialValues = {
        name: "",
        amount: "",
        frequency: "once",
        type: "",
        startDate: "",
        endDate: "",
    };

    const validationSchema = Yup.object().shape({
        // Ensures a name represented as a string is entered
        name: Yup.string().required("Name is required"),
        // Ensures that if an amount is added it is positive
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
            .nullable(),
        // Ensures the frequency is selected from one of the five given choices
        frequency: Yup.string().oneOf(['once', 'daily', 'weekly', 'monthly', 'annually']).required("Frequency is required"),
        // Ensures that the type matches one of the predetermined types in the array
        type: Yup.string().oneOf(Object.keys(typeColors)).required("Type is required"),
        // Ensures a start date is entered
        startDate: Yup.date().required("Start date is required"),
        // Ensures that if an end date has been entered it occurs after the start date
        endDate: Yup.date().min(Yup.ref('startDate'), "End date must be after start date").nullable(),
    });

    // Adjusts date strings into javascript Date objects
    const adjustDate = (dateString) => {
        // Returns null on an invalid input, used to catch instances where deselecting a date caused errors before
        if (!dateString)
        {
            return null;
        }
        // Deconstructs the date string at each hyphen to get the values for the Date object
        const [year, month, day] = dateString.split('-');
        // month is 0-indexed in JS Date
        return new Date(year, month - 1, day);
    };

    // Handles the submission request to add a new event item to the database
    const onSubmit = async (data, { resetForm }) => {
        // Ensures there is a logged-in user before submitting the item to the database
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            navigate("/login");
            return;
        }
        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.id;

        // Start and end dates are created from the event data entered using helper function adjustDate
        console.log("Original start date:", data.startDate);
        console.log("Original end date:", data.endDate);
        const startDate = adjustDate(data.startDate);
        const endDate = adjustDate(data.endDate);
        console.log("Parsed start date:", startDate);
        console.log("Parsed end date:", endDate);

        // Checks for errors inside the submission form and adds them to the errors array
        const errors = {};
        // End date has to be after start date
        // Currently does not display error message but does prevent end dates before start dates from being selected
        if (isMultiDay && (!endDate || endDate <= startDate)) {
            errors.endDate = "End date must be after start date for multi-day events";
        }
        // Make sure events are not longer than the selected frequency can repeat
        if (data.frequency !== 'once' && isMultiDay) {
            const duration = (endDate - startDate) / (1000 * 60 * 60 * 24); // duration in days
            if (data.frequency === 'daily') {
                alert("Daily events can not occur over multiple days")
                errors.frequency = "Daily events can not occur over multiple days";
            }
            if (data.frequency === 'weekly' && duration > 7) {
                alert("Events longer than a week cannot repeat weekly")
                errors.frequency = "Events longer than a week cannot repeat weekly";
            }
            if (data.frequency === 'monthly' && duration > 31) {
                alert("Events longer than a month cannot repeat monthly")
                errors.frequency = "Events longer than a month cannot repeat monthly";
            }
            if (data.frequency === 'annually' && duration > 365) {
                alert("Events longer than a year cannot repeat annually")
                errors.frequency = "Events longer than a year cannot repeat annually";
            }
        }

        // If the errors array is not empty then stop the submission form
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        // Consolidates all the event data into one object
        const eventData = {
            name: data.name,
            amount: data.amount || null,
            frequency: data.frequency,
            type: data.type,
            // Grabs associated color from the typeColors array
            color: typeColors[data.type],
            startDate: startDate.toISOString(),
            // Converts end date to an ISO string if it exists, otherwise is null
            endDate: isMultiDay && endDate ? endDate.toISOString() : null,
            // Stores the day of the week as a number 0-6 where 0 is sunday, otherwise is null
            dayOfWeek: data.frequency === 'weekly' ? startDate.getDay() : null,
            // Selected day of the month is stored for monthly and annual events, otherwise is null
            dayOfMonth: ['monthly', 'annually'].includes(data.frequency) ? startDate.getDate() : null,
            // Month is stored for annual events as a number 1-12, otherwise is null
            month: data.frequency === 'annually' ? startDate.getMonth() + 1 : null,
            UserId: userId
        };

        console.log("Event data being sent:", eventData);
        try {
            // Posts the event data to the route to make a new event item
            const response = await axios.post("http://localhost:4000/events",
                eventData,
                { headers: { accessToken: accessToken } },
            );
            console.log("Received event:", response.data);
            // Alert user on successful creation, refreshes page using onEventAdded parameter, and resets the form
            alert("Your new event has been added successfully");
            onEventAdded();
            resetForm();
            setIsMultiDay(false);
        } catch (error) {
            console.error("Error creating event:", error.response?.data || error.message);
            alert("Failed to create event. Please try again.");
        }
    };

    // Returns submission form that adds event to the events page
    return (
        <div className="add-event">
            <h2 className="add-expense-header">Add An Event</h2>
            <Formik
                // Build submission form
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                <Form className="add-expense-form">
                    <table className="add-expense-table">
                        <tbody>
                            {/* Name Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="name">Event Name:</label></td>
                                <td>
                                    <Field id="name" name="name" placeholder="Enter Event Name" />
                                </td>
                                <ErrorMessage name="name" component="div" className="error-message" />
                            </tr>

                            {/* Amount Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="amount">Amount (Optional):</label></td>
                                <td>
                                    <Field id="amount" name="amount" type="number" step="0.01" placeholder="Enter Amount" />
                                </td>
                            </tr>

                            {/* Type Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="type">Type:</label></td>
                                <td>
                                    <Field id="type" name="type" as="select">
                                        <option value="">Select type</option>
                                        {Object.keys(typeColors).map(type => (
                                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="type" component="div" className="error-message" />
                                </td>
                            </tr>

                            {/* Start Date Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="startDate">Start Date:</label></td>
                                <td>
                                    <Field id="startDate" name="startDate" type="date" />
                                </td>
                                <ErrorMessage name="startDate" component="div" className="error-message" />
                            </tr>

                            {/* Multi-Day Checkbox */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="isMultiDay">Is this a multi-day event?</label></td>
                                <td>
                                    <input
                                        type="checkbox"
                                        id="isMultiDay"
                                        checked={isMultiDay}
                                        onChange={() => setIsMultiDay(!isMultiDay)}
                                    />
                                </td>
                            </tr>

                            {/* End Date Field (only for multi-day events) */}
                            {isMultiDay && (
                                <tr>
                                    <td><label className="add-expense-label" htmlFor="endDate">End Date:</label></td>
                                    <td>
                                        <Field id="endDate" name="endDate" type="date" />
                                    </td>
                                </tr>
                            )}

                            {/* Frequency Field */}
                            <tr>
                                <td><label className="add-expense-label" htmlFor="frequency">Frequency:</label></td>
                                <td>
                                    <Field id="frequency" name="frequency" as="select">
                                        <option value="once">Once</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="annually">Annually</option>
                                    </Field>
                                    <ErrorMessage name="frequency" component="div" className="error-message" />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    <button type="submit" className="add-button">Add Event</button>
                </Form>
            </Formik>
        </div>
    );
}

export default AddEventToPage;