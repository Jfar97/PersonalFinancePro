// SavingsPage is the frontend page that displays all savings items, and has a component that allows new savings items to be created

// Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CreateSavings from "../components/CreateSavings.jsx";

function SavingsPage() {
    // State hooks
    const [savingsList, setSavingsList] = useState([]);
    const navigate = useNavigate();

    // Fetches all savings items associated with the logged-in user
    const fetchSavings = async () => {
        // Check if a user is logged in with a JWT token
        const accessToken = sessionStorage.getItem('accessToken');
        if(!accessToken){
            navigate('/login');
            return;
        }
        try {
            // Decodes token for user id
            const decodedToken = jwtDecode(accessToken);
            console.log("Decoded user ID:", decodedToken.id);

            // Get all savings items
            axios.get("http://localhost:4000/savings", {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            // Next filter all savings items to only those with a UserId that matches the token
            }).then((response) => {
                console.log("All savings data:", response.data);
                const userSavings = response.data.filter(saving => saving.UserId === decodedToken.id);
                console.log("Filtered user savings:", userSavings);
                setSavingsList(userSavings);
            }).catch(error => {
                console.log("Error fetching savings:", error);
            });
        } catch (error) {
            console.log("Error decoding token:", error);
        }
    }

    // Fetches all savings when the component mounts
    useEffect(() => {
        fetchSavings()
    }, []);

    console.log("Rendering with savingsList:", savingsList);

    // Returns a page that displays all associated savings items and a component to create new savings items
    return (
        <div className="homepage-container">
            <div className="homepage-container-budgets">
                {/* All Savings Header */}
                <h1>Your Savings Goals</h1>
                <div className="budget-card-container-centered">
                    {/* Savings Items List */}
                    {savingsList.map((saving, key) => {
                        // Percent of progress made towards savings goal
                        const percentAchieved = Math.min((saving.currentAmount / saving.goal) * 100, 100);
                        return (
                            // Savings items are also links to their individual savings pages
                            <Link to={`/savings/${saving.id}`} key={saving.id} style={{textDecoration: 'none', color: 'inherit'}}>
                                <div className="savings-card">
                                    {/* Savings Name */}
                                    <div className="savings-header">
                                        {saving.name}
                                    </div>
                                    <div className="savings-body">
                                        {/* Savings Goal */}
                                        Goal: ${saving.goal}
                                        <br/>

                                        {/* Savings Progress Bar */}
                                        Current: ${saving.currentAmount}
                                        <div className="savings-progress-bar">
                                            <div
                                                className="savings-progress"
                                                style={{width: `${percentAchieved}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <CreateSavings onSavingAdded={fetchSavings} />
        </div>
    );
}

export default SavingsPage;