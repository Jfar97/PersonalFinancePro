// Login is the default page the app navigates too upon being launched when there is no logged-in user, and posts an accessToken to the session storage to allow a valid user to login and access their account

// Imports
import React, {useState} from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import {useNavigate} from "react-router-dom";
import {ErrorMessage, Field, Form, Formik} from "formik";

function Login() {
    // State hooks
    const navigate = useNavigate();

    // The initial login values for the user are set to null
    const initialValues = {
        username: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        // Ensures the username is entered and is a string
        username: Yup.string().required("Username is required"),
        // Ensures the password is entered and is a string
        password: Yup.string().required("Password is required"),
    });

    // Function that handles the submission request to the post the user as an accessToken to the session storage
    const onSubmit = async (data, { setSubmitting, setFieldError }) => {
        try {
            // Tests the post request by attempting to post the response and checks to see if there is a stored JSON web token acting as a logged-in user
            const response = await axios.post("http://localhost:4000/users/login", data);
            if (response.data.accessToken) {
                sessionStorage.setItem("accessToken", response.data.accessToken);
                console.log("Login successful, token:", response.data.accessToken);
                navigate('/');
            } else {
                console.error("Login successful but no token received");
                setFieldError('general', 'Login successful but no token received');
            }
        } catch (error) {
            console.log("Login error:", error);
            let errorMessage = "An error occurred during login.";
            // The if statements handle the specific errors that may occur to let the user know why I login may have failed
            if (error.response) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            // More general error messaging at the end if a specific form input is not the issue
            } else if (error.request) {
                errorMessage = "No response received from the server. Please check your internet connection and try again.";
            } else {
                errorMessage = "An unexpected error occurred. Please try again.";
            }
            alert(errorMessage);
            setFieldError('general', errorMessage);
        }
        setSubmitting(false);
    };

    // Returns the login window with the username and password fields, as well as options to create an account and change a password if the user has forgotten theirs
    return (
        <div className="page-container-login">
            <div className="auth-box-login">
                {/* Login Form Header */}
                <h2>Login Below</h2>
                <Formik
                    // Build Submission Form
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {/* Wrapper ensures the user can not post multiple login requests and post multiple tokens to session storage */}
                    {({ isSubmitting }) => (
                        <Form className="formContainer">
                            {/* Username Field */}
                            <label className="budget-input">Username: </label>
                            <Field
                                type="text"
                                id="budget-input"
                                name="username"
                                placeholder="Enter Username"
                            />
                            <ErrorMessage name="username" component="span" className="error-message" />

                            {/* Password Field */}
                            <label className="budget-input">Password: </label>
                            <Field
                                type="password"
                                id="loginRegister-input"
                                name="password"
                                placeholder="Enter Password"
                            />
                            <ErrorMessage name="password" component="span" className="error-message" />

                            <ErrorMessage name="general" component="div" className="error-message" />

                            {/* Login Form Submission Button */}
                            <button type="submit" disabled={isSubmitting}>
                                Login
                            </button>
                        </Form>
                    )}
                </Formik>

                {/* Forgot Password Navigation Button */}
                <button onClick={() => navigate('/forgot-password')}>Forgot Password?</button>

                {/* Register Navigation Button */}
                <button onClick={() => navigate('/register')}>Don't have an account? Sign up now!</button>
            </div>
        </div>
    );
}

export default Login;