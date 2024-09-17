// ForgotPassword is the component that allows a user to change their password when they are NOT logged in, and requires the user to input their username, security question, and security answer all tied to the account before it will let the user change the password of their account

// Imports
import React, {useEffect, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Array containing the security questions that can be associated with the account when registering
const securityQuestions = [
    "What was the name of your first pet?",
    "In which city were you born?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What was the make of your first car?"
];

function ForgotPassword() {
    // State hooks
    const [userSecurityQuestion, setUserSecurityQuestion] = useState('');
    const navigate = useNavigate();

    // Sets the initial values for all the fields necessary in the form
    const initialValues = {
        username: '',
        securityQuestion: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: '',
    };

    const validationSchema = Yup.object().shape({
        // Ensures the username is a string
        username: Yup.string().required('Username is required'),
        // Ensures the security question selected is the correct one associated with the account
        // This can be handled better, and eventually I wish to rework it so that if the security question or answer do not match, it just states that one of them is wrong so as not to provide information about a user that is not immediately apparent to those who do not own the account
        securityQuestion: Yup.string().required('Security question is required')
            .test('match-user-question', 'Selected question does not match user\'s security question',
                function(value) {
                    return value === userSecurityQuestion;
                }),
        // Ensures the security answer is entered as a string
        securityAnswer: Yup.string().required('Security answer is required'),
        // Ensures a new password string is entered
        newPassword: Yup.string().min(4).max(20).required('New password is required'),
        // Ensures a string that matches the new password is entered
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm new password is required'),
    });

    // Gets the associated security question with the entered username in order to check if it matches the selected security question in the form
    const fetchUserSecurityQuestion = async (username) => {
        try {
            const response = await axios.post('http://localhost:4000/users/get-security-question', { username });
            setUserSecurityQuestion(response.data.securityQuestion);
        } catch (error) {
            console.error('Error fetching security question:', error);
            alert('Error fetching security question. Please check the username and try again.');
        }
    };

    // Handles the submission request to try and change the password field in the user database for the entered username
    const onSubmit = async (data, { setErrors }) => {
        // Ensures the selected security question is the one pulled in from the selected user
        if (data.securityQuestion !== userSecurityQuestion) {
            setErrors({ securityQuestion: 'Selected question does not match user\'s security question' });
            return;
        }
        try {
            // Posts the information to the reset-password route in order to make the change in the database
            await axios.post('http://localhost:4000/users/reset-password', {
                username: data.username,
                securityQuestion: data.securityQuestion,
                securityAnswer: data.securityAnswer,
                newPassword: data.newPassword,
            });
            // Alerts user of success and navigates to login page
            alert('Password reset successful. Please log in with your new password.');
            navigate('/login');
        } catch (error) {
            console.error('Password reset error:', error.response || error);
            // The if statements alert the user to the error that stops the form submission from being processed
            if (error.response && error.response.data) {
                if (error.response.data.error === 'User not found') {
                    alert('Username not found. Please check and try again.');
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
    
    // Returns a container with a form for a user to enter their relevant information in order to change the password associated with their account in the database
    return (
        <div className="page-container-register">
            <div className="auth-box-register">
                <h2>Forgot Password</h2>
                <Formik
                    // Build submission form
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                >
                    <Form className="formContainer">
                        {/* Username Field */}
                        <label className="loginRegister-input">Username:</label>
                        <Field
                            id="inputCreatePost"
                            name="username"
                            placeholder="Enter username"
                            // Grabs the associated security question from the database when a valid username is entered into the field
                            onBlur={(e) => {
                                if (e.target.value) {
                                    fetchUserSecurityQuestion(e.target.value);
                                }
                            }}
                        />
                        <ErrorMessage name="username" component="span" className="error-message"/>

                        {/* Security Question Field */}
                        <label className="loginRegister-input">Security Question:</label>
                        <Field as="select" name="securityQuestion">
                            <option value="">Select a security question</option>
                            {securityQuestions.map((question, index) => (
                                <option key={index} value={question}>{question}</option>
                            ))}
                        </Field>
                        <ErrorMessage name="securityQuestion" component="span" className="error-message"/>

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

export default ForgotPassword;