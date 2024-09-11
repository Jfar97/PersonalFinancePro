// RRD imports
import {BrowserRouter, Routes, Route, Link, useLocation} from 'react-router-dom';

// Import styles
import './App.css'
import backgroundImage from './assets/BackgroundImage2.jpg';

// Pages imports
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreateBudget from "./components/CreateBudget.jsx";
import Expenses from "./pages/Expenses.jsx";
import BudgetPage from "./pages/BudgetPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import RecurringChargesPage from "./pages/RecurringChargesPage.jsx";

// Component imports
import ChangePassword from "./components/ChangePassword.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Navigation from "./components/Navigation.jsx";
import RecChargesCalendar from "./components/RecChargesCalendar.jsx";
import SavingsPage from "./pages/SavingsPage.jsx";
import IndividualSavingsPage from "./pages/IndividualSavingsPage.jsx";
import AllBudgets from "./pages/AllBudgets.jsx";
import AccEventsPage from "./pages/AccEventsPage.jsx";

function CalendarWrapper() {
    const location = useLocation();
    const { charges } = location.state || { charges: [] };

    console.log("Calendar Wrapper State:", location.state);
    console.log("Charges:", charges);

    return <RecChargesCalendar charges={charges} />;
}


// Main app component
function App() {

    return (
        <BrowserRouter>
            <div className="App">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Homepage/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/budgets" element={<AllBudgets/>}/>
                    <Route path="/expenses" element={<Expenses/>}/>
                    <Route path="/budgets/:budgetId" element={<BudgetPage />} />
                    <Route path="/account" element={<AccountPage/>}/>
                    <Route path="/change-password" element={<ChangePassword/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/recurring-charges" element={<RecurringChargesPage/>}/>
                    <Route path="/calendar" element={<CalendarWrapper/>}/>
                    <Route path="/savings" element={<SavingsPage/>}/>
                    <Route path="/savings/:id" element={<IndividualSavingsPage/>}/>
                    <Route path="/events" element={<AccEventsPage/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
