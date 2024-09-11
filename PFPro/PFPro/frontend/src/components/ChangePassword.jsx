// ChangePassword is the component on AccountPage that allows a user to change their password when they ARE logged in, and automatically pulls in their username and associated security question so the user only needs to provide the security answer and the new password they wish to change to

// Imports
import React, {useEffect, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

function ChangePassword() {
    // State hooks
    const [securityQuestion, setSecurityQuestion] = useState('');
    const navigate = useNavigate();
    const [accountUser, setAccountUser] = useState(null);

    // Sets the initial values for the fields that are not pulled in from the user's data
    const initialValues = {
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: '',
    };

    const validationSchema = Yup.object().shape({
        // Ensures the security answer is a string
        securityAnswer: Yup.string().required('Security answer is required'),
        // Ensures the new password is a string
        newPassword: Yup.string().min(4).max(20).required('New password is required'),
        // Ensures the confirmation password field matches the password and is a string
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm new password is required'),
    });

    // Async function used to get the security question to change the password
    const fetchSecurityQuestion = async () => {
        try {
            // Fetches the username from the JWT token of the logged-in user
            const token = sessionStorage.getItem("accessToken");
            const decodedToken = jwtDecode(token);
            const username = decodedToken.username
            setAccountUser(decodedToken.username)

            // Grabs the security question associated with the user in the database for the form
            const response = await axios.post('http://localhost:4000/users/get-security-question', { username });
            console.log("Response from server:", response.data);
            setSecurityQuestion(response.data.securityQuestion);
        } catch (error) {
            console.error('Error fetching security question:', error.response || error);
            setSecurityQuestion('Error fetching question');
        }
    };

    // Fetches the user's security question upon the component mounting
    useEffect(() => {
        fetchSecurityQuestion();
    }, []);

    // Handles submit request to put route to change the password field of a user inside the database
    const onSubmit = async (data, { setErrors }) => {
        try {
            // Posts the information to the reset-password route to change the password in the database
            await axios.post('http://localhost:4000/users/reset-password', {
                username: accountUser,
                securityAnswer: data.securityAnswer,
                newPassword: data.newPassword,
            });
            // Alert user on success and navigates to the login page
            alert('Password reset successful. Please log in with your new password.');
            navigate('/login');
        } catch (error) {
            // Error catching to alert the user what error is preventing the submission from being processed
            console.error('Password reset error:', error.response || error);
            if (error.response && error.response.data) {
                if (error.response.data.error === 'User not found') {
                    alert('User not found. Please try again or contact support.');
                } else if (error.response.data.error === 'Incorrect security answer') {
                    alert('Incorrect security answer. Please try again.');
                } else {
                    alert(error.response.data.error || 'An error occurred during password reset. Please try again.');
                }
            } else {
                alert('An unexpected error occurred. Please try again later.');
            }
            setErrors({ general: error.response?.data?.error || 'An error occurred' });
        }
    };

    // Returns submission form that allows a user to change their password
    return (
        <div className="page-container-register">
            <div className="auth-box-change">
                <h2>Reset Password</h2>
                <Formik
                    // Build submission form
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                >
                    <Form className="formContainer">
                        {/* Username Field */}
                        <label className="loginRegister-input">Username:</label>
                        <div>{accountUser}</div>

                        {/* Security Question Field */}
                        <label className="loginRegister-input">Security Question:</label>
                        <div>{securityQuestion || 'Loading security question...'}</div>

                        {/* Security Answer Field */}
                        <label className="loginRegister-input">Security Answer:</label>
                        <Field
                            id="inputCreatePost"
                            name="securityAnswer"
                            placeholder="Enter security answer"
                        />
                        <ErrorMessage name="securityAnswer" component="span" className="error-message"/>

                        {/* New Password Field */}
                        <label className="loginRegister-input">New Password:</label>
                        <Field
                            type="password"
                            id="inputCreatePost"
                            name="newPassword"
                            placeholder="Enter new password"
                        />
                        <ErrorMessage name="newPassword" component="span" className="error-message"/>

                        {/* Confirm Password Field */}
                        <label className="loginRegister-input">Confirm New Password:</label>
                        <Field
                            type="password"
                            id="inputCreatePost"
                            name="confirmNewPassword"
                            placeholder="Confirm new password"
                        />
                        <ErrorMessage name="confirmNewPassword" component="span" className="error-message"/>

                        <button type="submit">Reset Password</button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
}

export default ChangePassword;