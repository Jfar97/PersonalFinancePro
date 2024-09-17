// server.js is the entry point for the backend portion of this app

// FRAMEWORK AND MODEL IMPORTS
// Importing the Express framework
const express = require('express');

// Creating an Express instance for the app
const app = express();

// Importing the cors framework
const cors = require('cors');

// Importing express.json middleware to parse JSON bodies when handling requests
app.use(express.json());
// White list api on computer to allow connection between frontend and backend
app.use(cors());

// Importing database models
const db = require('./models')

// ROUTERS
const budgetRouter = require('./routes/BudgetRoutes.js');
app.use("/budgets", budgetRouter);

const userRouter = require('./routes/UserRoutes.js');
app.use("/users", userRouter);

const expenseRouter = require('./routes/ExpenseRoutes.js');
app.use("/expenses", expenseRouter);

const chargeRouter = require('./routes/RecurringChargeRoutes.js');
app.use("/charges", chargeRouter);

const savingRouter = require('./routes/SavingsRoutes.js');
app.use("/savings", savingRouter);

const savingsUpdateRouter = require('./routes/SavingsUpdateRoutes.js');
app.use("/savings-updates", savingsUpdateRouter);

const accEventRouter = require('./routes/AccEventRoutes.js');
app.use("/events", accEventRouter);


// Synchronizing the databases and then starting the server
db.sequelize.sync().then(() => {
    app.listen(4000, () => {
        console.log('Server running on port:4000...');
    });
}).catch(error => {
    console.error('Unable to start server:', error);
});
