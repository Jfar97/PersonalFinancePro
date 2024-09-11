// BudgetRoutes.js acts as the route endpoints for the Budget model

// Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const Budget = db.Budget;
const User = db.User;
const jwt = require('jsonwebtoken');
const {validateToken} = require("../middlewares/AuthMiddleware");
const { Expense, sequelize } = require('../models');


// REQUESTS
// Get request to pull in all Budgets currently in the database with the sum of all  expenses
router.get('/', async (req, res) => {
    try {
        const listOfBudgets = await Budget.findAll({
            include: [{
                model: Expense,
                attributes: []
            }],
            attributes: [
                'id',
                'name',
                'amount',
                'UserId',
                // Calculate sum of associated expense items
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Expenses.cost')), 0), 'totalExpenses']
            ],
            group: ['Budget.id', 'Budget.UserId']
        });
        res.json(listOfBudgets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gets a specific budget with its sum of all associated expenses
router.get('/:budgetId', async (req, res) => {
    const {budgetId} = req.params;
    try {
        const budget = await Budget.findOne({
            where: { id: budgetId },
            include: [{
                model: Expense,
                attributes: ['id', 'name', 'cost', 'createdAt'] // Changed to match your model
            }],
            attributes: [
                'id',
                'name',
                'amount',
                'UserId',
                // Calculate sum of associated expense items
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Expenses.cost')), 0), 'expensesSum']
            ],
            group: ['Budget.id', 'Expenses.id']
        });
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        console.error("Error fetching detailed budget page: ", error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new budget
router.post('/', validateToken, async (req, res) => {
    console.log("Received budget creation request");
    console.log("User from token:", req.user);
    try {
        const { name, amount } = req.body;
        const newBudget = await Budget.create({
            name,
            amount,
            UserId: req.user.id
        });
        console.log("New budget created:", newBudget);
        res.status(201).json(newBudget);
    } catch (error) {
        console.error("Error creating budget:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a budget based upon its unique id
router.delete('/:budgetId', async (req, res) => {
    const { budgetId } = req.params;
    try {
        const result = await Budget.destroy({
            where: {
                id: budgetId,
            }
        })
        if (result === 0) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json({message: `Budget was deleted`})
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ error: error.message });
    }
})

// Update the amount allocated to a budget
router.put('/:budgetId', async (req, res) => {
    const budgetId = req.params.budgetId;
    const { amount } = req.body;
    try {
        // Filter budget based upon the budget id
        const budget = await Budget.findByPk(budgetId);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }
        budget.amount = amount;
        await budget.save();
        res.json(budget);
    } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;