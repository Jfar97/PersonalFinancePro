// Register is the page that a user registers on when they wish to create a new account. It posts the new user to the database and redirects to Login.jsx upon success

// Imports
import React, {useState} from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

// The array of security questions that a user must choose from when creating an account - these are used to change the user's password if they wish
const securityQuestions = [
    "What was the name of your first pet?",
    "In which city were you born?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What was the make of your first car?"
];

function Register(props) {
    // State hooks
    let navigate = useNavigate();

    // Sets the initial values for all fields of the User model
    const initialValues = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        securityQuestion: "",
        securityAnswer: "",
    };

    const validationSchema = Yup.object().shape({
        //  Ensures the username is a string with a set range of 3-15 characters
        username: Yup.string().min(3).max(15).required("Username is required"),
        // Ensures a valid email is entered
        email: Yup.string().email("Invalid email format").required("Email is required"),
        // Ensures a password is set in the range of 4-20 characters
        password: Yup.string().min(4).max(20).required("Password is required"),
        // Confirm password is a string that is used to confirm that the user has entered the password that they would like to associate with the account
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
        // Requires one of the items in the security question array
        securityQuestion: Yup.string().required("Security question is required"),
        // Saves the user's answer to the question as a string
        securityAnswer: Yup.string().required("Security answer is required"),
    })

    // Handles the submission request to create a new user
    const onSubmit = async (data) => {
        try {
            // Posts new user to database and then navigates to the login page after confirming to the user that their account was created
            const response = await axios.post("http://localhost:4000/users", data);
            console.log(data);
            alert("Registration successful! Please log in to begin setting up your account.");
            navigate('/login');
        } catch (error) {
            console.log(error);
            if (error.response) {
                // Switch case handles displaying the error behind why a registration request failed and displays the detailed error to the user
                switch (error.response.status) {
                    case 400:
                        alert("Registration failed. The username or email may already be in use.");
                        break;
                    case 500:
                        alert("Server error. Please try again later.");
                        break;
                    default:
                        alert("An unexpected error occurred. Please try again.");
                }
            // Error messages set up for if the form inputs are valid but the post request still fails
            } else if (error.request) {
                alert("No response received from the server. Please check your internet connection and try again.");
            } else {
                alert("An error occurred while setting up the request. Please try again.");
            }
        }
    };

    // Returns a form with fields for the user to enter all required user information for a new user item in the database, alongside an option to navigate to Login if the user already has an account
    return (
        <div className="page-container-register">
            <div className="auth-box-register">
                {/* Register Form Header */}
                <h2>Create Account</h2>
                <Formik
                    // Build Submission Form
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                >
                    <Form className="formContainer">
                        {/* Username field */}
                        <label className="loginRegister-input">
                            Username:{" "}
                        </label>
                        <Field
                            id="inputCreatePost"
                            name="username"
                            placeholder="Enter username"
                            required
                        />
                        <ErrorMessage name="username" component="span" className="error-message"/>

                        {/* Password field */}
                        <label className="loginRegister-input">
                            Email:{" "}
                        </label>
                        <Field
                            id="inputCreatePost"
                            name="email"
                            placeholder="Enter email"
                            required
                        />
                        <ErrorMessage name="email" component="span" className="error-message"/>

                        {/* Password field */}
                        <label className="loginRegister-input">
                            Password:{" "}
                        </label>
                        <Field
                            type="password"
                            id="inputCreatePost"
                            name="password"
                            placeholder="Enter password"
                            required
                        />
                        <ErrorMessage name="password" component="span" className="error-message"/>

                        {/* Confirm Password field */}
                        <label className="loginRegister-input">
                            Confirm Password:{" "}
                        </label>
                        <Field
                            type="password"
                            id="inputConfirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            required
                        />
                        <ErrorMessage name="confirmPassword" component="span" className="error-message"/>

                        {/* Security Question field */}
                        <label className="loginRegister-input">
                            Security Question:{" "}
                        </label>
                        <Field
                            as="select"
                            id="securityQuestion"
                            name="securityQuestion"
                            required
                        >
                            {/* Maps security questions from the array */}
                            <option value="">Select a security question</option>
                            {securityQuestions.map((question, index) => (
                                <option key={index} value={question}>
                                    {question}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage name="securityQuestion" component="span" className="error-message"/>

                        {/* Security Answer field */}
                        <label className="loginRegister-input">
                            Security Answer:{" "}
                        </label>
                        <Field
                            id="securityAnswer"
                            name="securityAnswer"
                            placeholder="Enter your answer"
                            required
                        />
                        <ErrorMessage name="securityAnswer" component="span" className="error-message"/>

                        {/* Register Form Submission Button */}
                        <button type="submit">
                            Register Account
                        </button>

                        {/* Login Navigation Button */}
                        <button
                            onClick={() => navigate('/login')}
                        >
                            Returning user? Login now!
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>

    );
}

export default Register;