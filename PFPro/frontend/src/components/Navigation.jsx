// Navigation is the component that displays the title and login/register links if there is no logged-in user, and displays page links and a logout option if there is a stored JWT token indicating a logged-in user

// Imports
import React, { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';

function Navigation() {
    // State hooks
    const navigate = useNavigate();
    const location = useLocation();
    const accessToken = sessionStorage.getItem("accessToken");

    // Handles the logout call by removing the stored token and navigating to the login page
    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        navigate('/login');
    }

    // Tracks the active page(path) that the user is currently on to display this on the navbar links
    const isActive = (path) => location.pathname === path;

    // Handles the navbar when the user is not logged-in, displaying login and register
    if (!accessToken) {
        return (
            <header className="header">
                {/* App Title Bar */}
                <div className="titleBar">
                    <h1>Personal Finance Pro</h1>
                    <p>Pound-For-Pound the Best Personal Finance App</p>
                </div>

                {/* Navigation Bar */}
                <nav className="navbar">
                    <ul>
                        {/* Login Page */}
                        <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link></li>

                        {/* Register Page */}
                        <li><Link to="/register" className={isActive('/register') ? 'active' : ''}>Register</Link></li>

                    </ul>
                </nav>
            </header>
        );
    }

    // Returns the navbar for a logged-in user, displaying links to all the pages and a button with the option to logout
    return (
        <nav className="solonavbar">
            <ul>
                {/* Homepage Page */}
                <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home Page</Link></li>

                {/* Account Page */}
                <li><Link to="/account" className={isActive('/account') ? 'active' : ''}>Account</Link></li>

                {/* All Savings Page */}
                <li><Link to="/savings" className={isActive('/savings') ? 'active' : ''}>Savings</Link></li>

                {/* All Budgets Page */}
                <li><Link to="/budgets" className={isActive('/budgets') ? 'active' : ''}>Budgets</Link></li>

                {/* All Expenses Page */}
                <li><Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>Expenses</Link></li>

                {/* All Recurring Charges Page */}
                <li><Link to="/recurring-charges" className={isActive('/recurring-charges') ? 'active' : ''}>Charges</Link></li>

                {/* All Events Page */}
                <li><Link to="/events" className={isActive('/events') ? 'active' : ''}>Events</Link></li>

                {/* Calendar Page */}
                <li><Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>Calendar</Link></li>

                {/* Logout Button */}
                <li>
                    <button
                        onClick={handleLogout}
                        className="nav-button"
                    >
                        Logout
                    </button>
                </li>

            </ul>
        </nav>
    );
}

export default Navigation;