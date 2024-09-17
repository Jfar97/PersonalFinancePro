// SavingsRoutes acts as the route endpoints for the Savings model

// Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const Savings = db.Savings;
const SavingsUpdate = db.SavingsUpdate;
const User = db.User;
const jwt = require('jsonwebtoken');
const {validateToken} = require("../middlewares/AuthMiddleware");
const { Expense, sequelize } = require('../models');



// REQUESTS
// Get request to pull in all Savings currently in the database with associated UserId
router.get('/', async (req, res) => {
    try {
        const listOfSavings = await Savings.findAll({
            include: [{
                model: SavingsUpdate,
                attributes: []
            }],
            attributes: [
                'id',
                'name',
                'goal',
                'currentAmount',
                'UserId'
            ],
            group: ['Savings.id', 'Savings.UserId']
        });
        res.json(listOfSavings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new savings item in the database
router.post('/', validateToken, async (req, res) => {
    console.log("Received savings creation request");
    console.log("User from token:", req.user);
    try {
        const { name, goal } = req.body;
        const newSaving = await Savings.create({
            name,
            goal,
            currentAmount: 0,
            UserId: req.user.id
        });
        console.log("New saving created:", newSaving);
        res.status(201).json(newSaving);
    } catch (error) {
        console.error("Error creating saving goal:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a savings item based upon its unique id
router.delete('/:savingId', async (req, res) => {
    const savingId = req.params.savingId;  // This line is correct
    try {
        const result = await Savings.destroy({
            where: {
                id: savingId,
            }
        })
        if (result === 0) {
            return res.status(404).json({ message: "Savings not found" });
        }
        res.json({message: `Savings was deleted`})
    } catch (error) {
        console.error("Error deleting savings:", error);
        res.status(500).json({ error: error.message });
    }
})

// Edit a savings item amount towards the goal
router.put('/:savingsId/update-amount', async (req, res) => {
    const { savingsId } = req.params;
    const { amount, isAddition, description } = req.body;

    try {
        const savings = await Savings.findByPk(savingsId);
        if (!savings) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }

        console.log('Current amount before update:', savings.currentAmount);
        console.log('Amount to add/subtract:', amount);
        console.log('Is addition:', isAddition);

        // Calculate new amount
        const newAmount = isAddition
            ? parseFloat(savings.currentAmount) + parseFloat(amount)
            : parseFloat(savings.currentAmount) - parseFloat(amount);

        // Check if new amount would be negative
        if (newAmount < 0) {
            return res.status(400).json({ message: 'Cannot reduce savings below 0' });
        }

        // Start a transaction
        await sequelize.transaction(async (t) => {
            await savings.update({ currentAmount: newAmount }, { transaction: t });

            // Create a SavingsUpdate record
            const update = await SavingsUpdate.create({
                SavingsId: savings.id,  // Use the id from the savings record
                amount: isAddition ? parseFloat(amount) : -parseFloat(amount),
                description: description || null
            }, { transaction: t });

            console.log('Created SavingsUpdate:', update.toJSON());
        });

        // Fetch the updated Savings record with its SavingsUpdates
        const updatedSavings = await Savings.findByPk(savingsId, {
            include: [{
                model: SavingsUpdate,
                attributes: ['id', 'amount', 'description', 'createdAt'],
                order: [['createdAt', 'DESC']]
            }]
        });

        console.log('Final updated savings:', updatedSavings.toJSON());
        res.json(updatedSavings);
    } catch (error) {
        console.error('Error in update route:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific savings item based upon the item id
router.get('/:savingsId', async (req, res) => {
    const { savingsId } = req.params;
    try {
        const saving = await Savings.findByPk(savingsId, {
            include: [{
                model: SavingsUpdate,
                attributes: ['id', 'amount', 'description', 'createdAt'],
                order: [['createdAt', 'DESC']]
            }]
        });
        if (!saving) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }
        res.json(saving);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;