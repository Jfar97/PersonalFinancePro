// ExpenseRoutes acts as the route endpoints for expenses

// Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const Budget = db.Budget;
const Expense = db.Expense;
const {validateToken} = require("../middlewares/AuthMiddleware");


// REQUESTS
// Get request to pull in all expenses currently in the database with associated budget
router.get('/', async (req, res) => {
    try {
        const listOfExpenses = await Expense.findAll({
            include: [{ model: Budget, attributes: ['name'] }]
        });

        res.json(listOfExpenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new expense for a budget
router.post('/', validateToken, async (req, res) => {
    console.log("Received expense creation request"); // ADDED: Log received request
    try {
        const { name, cost, BudgetId } = req.body;
        const newExpense = await Expense.create({
            name,
            cost,
            BudgetId
        });
        console.log("New expense created:", newExpense); // ADDED: Log created budget
        res.status(201).json(newExpense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete an expense based upon its unique id
router.delete('/:id', async (req, res) => {
    const expenseId = req.params.id;
    try {
        const result = await Expense.destroy({
            where: { id: expenseId }
        })
        res.json({message: `Expense was deleted`})
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;