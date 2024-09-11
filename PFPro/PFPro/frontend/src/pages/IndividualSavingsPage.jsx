// IndividualSavingsPage is the page navigated to when a savings item is clicked, which displays its history of updates in a bar graph and a list and has a component that allows the savings to be modified with a new addition or subtraction

// Imports
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine, Rectangle
} from 'recharts';import ModifySavings from "../components/ModifySavings.jsx";
import {TrashIcon} from "@heroicons/react/24/solid/index.js";

function IndividualSavingsPage() {
    // State hooks
    const [saving, setSaving] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetches all updates associated with the specific saving item
    const fetchSavingDetails = async () => {
        // Check to ensure there is a JWT token representing a logged-in user
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Sets loading state while axios call is being processed
            setIsLoading(true);
            // Gets all associated savings updates, does not need to be filtered since it accessing the specific id route for the savings item
            const response = await axios.get(`http://localhost:4000/savings/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Fetched saving details:', response.data);
            setSaving(response.data);
            setUpdates(response.data.SavingsUpdates || []);

            // Prepare data for the graph
            let runningTotal = 0;
            const graphData = response.data.SavingsUpdates.map((update, index) => {
                runningTotal += parseFloat(update.amount);
                return {
                    name: `Update ${index + 1}`,
                    amount: runningTotal,
                    goal: response.data.goal // Add goal to each data point
                };
            });
            // If there are no updates, add a single data point
            if (graphData.length === 0) {
                graphData.push({
                    name: 'Start',
                    amount: 0,
                    goal: response.data.goal
                });
            }
            setGraphData(graphData);

            setError(null);
        } catch (error) {
            console.error('Error fetching saving details:', error);
            if (error.response && error.response.status === 401) {
                alert('Your session has expired. Please log in again.');
                sessionStorage.removeItem('accessToken');
                navigate('/login');
            } else {
                setError('Failed to fetch saving details. Please try again.');
            }
        } finally {
            // All data for the page has been successfully loaded or the errors have been sent
            setIsLoading(false);
        }
    };

    // Calls route to delete the savings item
    const handleDeleteSavings = async () => {
        if(confirm("Are you sure you want to delete this savings goal? It cannot be recovered.")) {
            try {
                // Axios call to delete the savings item
                const token = sessionStorage.getItem('accessToken');
                await axios.delete(`http://localhost:4000/savings/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Alerts user on success and returns to the general savings page
                alert("Savings goal deleted");
                navigate('/savings');
            } catch (error) {
                console.error("Error deleting savings goal:", error);
                alert("Failed to delete savings goal. Please try again.");
            }
        }
    };

    // Function that calls the fetchSavingsDetails when a saving item is modified
    // Component can not use the fetchSavingsDetails function directly as this results in an infinite loop, likely due to the setLoadingState but need to debug further
    const handleSavingsModified = () => {
        console.log('Savings modified, fetching updated details');
        fetchSavingDetails();
    };

    // Fetches all savings when the component mounts or a page navigation occurs
    useEffect(() => {
        fetchSavingDetails();
    }, [id, navigate]);

    // Circular progress bar for the savings item
    const CircularProgressBar = ({ percentage }) => {
        // Defines the radius
        const radius = 50;
        // Calculates circumference from the radius
        const circumference = radius * 2 * Math.PI;
        // Ensures the percentage can not go over 100%
        const clampedPercentage = Math.min(percentage, 100);
        // Calculate the cutoff for the line of the progress bar
        const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

        return (
            <svg height="124" width="124" viewBox="0 0 124 124">
                {/* Outer border circle */}
                <circle
                    stroke="#000000"
                    fill="transparent"
                    strokeWidth="2"
                    r="55"
                    cx="62"
                    cy="62"
                />
                {/* Background circle with light green fill */}
                <circle
                    stroke="transparent"
                    fill="#e6f7e6"
                    strokeWidth="0"
                    r={radius}
                    cx="62"
                    cy="62"
                />
                {/* Outer circle with white border */}
                <circle
                    stroke="white"
                    fill="transparent"
                    strokeWidth="10"
                    r={radius}
                    cx="62"
                    cy="62"
                />
                {/* Inner border circle */}
                <circle
                    stroke="#000000"
                    fill="transparent"
                    strokeWidth="1"
                    r="45"
                    cx="62"
                    cy="62"
                />
                {/* Progress circle */}
                <circle
                    stroke="#4CAF50"
                    fill="transparent"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                    }}
                    r={radius}
                    cx="62"
                    cy="62"
                />
                {/* Text in the center of the circle */}
                <text x="51%" y="49%" textAnchor="middle" dy=".3em" fill="#000" fontSize="20">
                    {`${percentage.toFixed(1)}%`}
                </text>
                {percentage > 100 && (
                    <text x="51%" y="65%" textAnchor="middle" fill="#000000" fontSize="12">
                        Goal Reached
                    </text>
                )}
            </svg>
        );
    };

    // Conditional rendering for loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Conditional rendering for error state
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Check for null saving
    if (!saving) {
        return <div>No saving found</div>;
    }

    // Calculating the percent of the progress bar that has been used
    const progressPercentage = (saving.currentAmount / saving.goal) * 100;
    const CustomBackground = (props) => {
        const {x, y, width, height} = props;
        return <Rectangle x={x} y={y} width={width} height={height} fill="#e6f7e6" />;
    };

    // Returns a page with the savings details graphed in a progress circle and an actual bar graph, with a component that allows the savings item to be updated
    return (
        <div className="homepage-container">
            <div className="homepage-container-savings">
                {/* Savings Name */}
                <h1>{saving.name}</h1>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <table style={{marginRight: '20px'}}>
                        <tbody>
                        {/* Savings Ultimate Goal */}
                        <tr>
                            <td><strong>Savings Goal:</strong></td>
                            <td>${saving.goal}</td>
                        </tr>

                        {/* Current Amount Saved */}
                        <tr>
                            <td><strong>Current Amount:</strong></td>
                            <td>${saving.currentAmount}</td>
                        </tr>
                        </tbody>
                    </table>

                    {/* Circular Progress Bar */}
                    <CircularProgressBar percentage={progressPercentage}/>
                </div>

                {/* Bar Chart Section */}
                <div style={{width: '100%', height: '400px', marginTop: '20px'}}>
                    <h2 className="add-expense-header">Savings Progress</h2>
                    <div style={{width: '100%', height: '350px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                                data={graphData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 30,
                                }}
                            >
                                {/* Grid Lines */}
                                <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true}/>

                                {/* X-Axis */}
                                <XAxis
                                    dataKey="name"
                                    tick={{fontSize: 12}}
                                    height={60}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />

                                {/* Y-Axis */}
                                <YAxis
                                    domain={[0, Math.max(saving.goal, Math.max(...graphData.map(data => data.amount)))]}
                                    label={{value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: -5}}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    width={80}
                                />

                                {/* Data Hover Information */}
                                <Tooltip
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                    labelFormatter={(label) => `${label}`}
                                />

                                {/* Chart Legend */}
                                <Legend wrapperStyle={{paddingTop: '10px'}}/>

                                {/* Custom Background Area */}
                                <Bar
                                    dataKey="amount"
                                    fill="#4CAF50"
                                    name="Saved Amount"
                                    background={<CustomBackground/>}
                                    barCategoryGap="0%" // No bar gap
                                    barGap={-1} // Slight overlap - this does not work need to try and fix it
                                    maxBarSize={40} // Adjust bar size
                                />

                                {/* Savings Goal Reference Line */}
                                <ReferenceLine y={saving.goal} label="Goal" stroke="green" strokeDasharray="3 3"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="modify-savings">
                {/* Modify Savings Component */}
                <ModifySavings savingsId={id} onSavingsModified={handleSavingsModified}/>
                <h2 className="add-expense-header">Savings Updates</h2>

                {/* Savings Update List */}
                {updates.length > 0 ? (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        {/* Table Headers */}
                        <thead>
                        <tr>
                            <th style={{textAlign: 'left', padding: '8px'}}>Amount</th>
                            <th style={{textAlign: 'left', padding: '8px'}}>Date</th>
                            <th style={{textAlign: 'left', padding: '8px'}}>Description</th>
                        </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                        {/* Mapping updates by their createdAt date */}
                        {updates.map(update => (
                            <tr key={update.id}>
                                <td style={{padding: '8px'}}>${update.amount}</td>
                                <td style={{padding: '8px'}}>{new Date(update.createdAt).toLocaleDateString()}</td>
                                <td style={{padding: '8px'}}>{update.description || 'N/A'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No updates yet.</p>
                )}
                <h2 className="add-expense-header">Manage Savings</h2>
                {/* Savings Delete Button */}
                <button
                    onClick={handleDeleteSavings}
                    className="delete-button"
                >
                    Delete Savings
                    <TrashIcon width={20} height={20}/>
                </button>
            </div>
        </div>

    );
}

export default IndividualSavingsPage;