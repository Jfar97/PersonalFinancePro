// ModifySavings is the component on the IndividualSavingsPage that is used to make changes to the savings item

// Imports
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

function ModifySavings({savingsId, onSavingsModified}) {
    // State hooks
    const [amount, setAmount] = useState('');
    const [isAddition, setIsAddition] = useState(true);
    const [description, setDescription] = useState('');
    const [key, setKey] = useState(0);
    const formRef = useRef(null);
    const navigate = useNavigate();

    // Function checks that the number entered to modify the savings is a positive number with a maximum of two decimal places
    const validateAmount = (amount) => {
        const amountRegex = /^\d+(\.\d{1,2})?$/;
        if (!amountRegex.test(amount) || amount <= 0) {
            return "Please enter a positive number with up to two decimal places.";
        }
        return null;
    };

    // Function called when the component makes a submission
    const handleSubmit = async (e) => {
        // Prevents the initial browser refresh on form submission until all changes are made
        e.preventDefault();
        // Checks if there is a JWT token stored representing the logged-in user
        // This section can likely be removed due to residing inside the IndividualSavingsPage which already does a JWT token check
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            alert('You must be logged in to modify savings');
            navigate('/login');
            return;
        }

        // Ensure the number is positive before allowing the form to be submitted
        const error = validateAmount(amount, isAddition);
        if (error) {
            alert(error);
            return;
        }

        try {
            // Calls the put route to modify the savings amount and create a new update item in the database
            console.log('Sending update request with data:', { amount, isAddition, description });
            console.log('Token:', token);
            const response = await axios.put(
                `http://localhost:4000/savings/${savingsId}/update-amount`,
                {
                    amount: parseFloat(amount),
                    isAddition,
                    description
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            console.log('Server response:', response.data);
            alert('Savings updated successfully');

            // Reset form fields
            setAmount('');
            setDescription('');
            setIsAddition(true);
            setKey(prevKey => prevKey + 1);
            if (formRef.current) formRef.current.reset();

            // Notify parent component
            onSavingsModified();
        } catch (error) {
            console.error('Error updating savings:', error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                alert('Your session has expired. Please log in again.');
                sessionStorage.removeItem('accessToken');
                navigate('/login');
            } else {
                alert('Failed to update savings. Please try again.');
            }
        }
    };

    // Returns a component with input fields that allow the user to modify the savings item
    return (
        <>
            <h2 className="add-expense-header">Modify Savings</h2>
            {/* Formik was seemingly causing errors with the sequelize association of the update items in the database, so a regular form was used */}
            {/* Should try to reimplement Formik later since the sequelize association is now working */}
            <form onSubmit={handleSubmit} className="add-expense-form">
                <table className="add-expense-table">
                    <tbody>
                        {/* Amount Field */}
                        <tr>
                            <td><label className="add-expense-label" htmlFor="amount">Amount:</label></td>
                            <td>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </td>
                        </tr>

                        {/* Type: Add or Subtract Field */}
                        <tr>
                            <td><label className="add-expense-label">Type:</label></td>
                            <td>
                                <label>
                                    <input
                                        type="radio"
                                        // Switches to addition
                                        checked={isAddition}
                                        onChange={() => setIsAddition(true)}
                                    />
                                    Add
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        // Switches to subtraction
                                        checked={!isAddition}
                                        onChange={() => setIsAddition(false)}
                                    />
                                    Subtract
                                </label>
                            </td>
                        </tr>

                        {/* Description Field */}
                        <tr>
                            <td><label className="add-expense-label" htmlFor="description">Description:</label></td>
                            <td>
                                <input
                                    id="description"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description (optional)"
                                />
                            </td>
                        </tr>

                    </tbody>
                </table>
                    <button type="submit" className="add-button">Update Savings</button>
            </form>
        </>
    );
}

export default ModifySavings;