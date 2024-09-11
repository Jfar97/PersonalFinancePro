// SavingsUpdateRoutes acts as the routes for the savingsupdate item

// Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const SavingsUpdate = db.SavingsUpdate;
const Savings = db.Savings;
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sequelize } = require('../models');

// Get all the savings updates for a specific savings item based upon id
router.get('/:savingsId', async (req, res) => {
    const { savingsId } = req.params;
    try {
        const updates = await SavingsUpdate.findAll({
            where: { SavingsId: savingsId },
            order: [['createdAt', 'DESC']]
        });
        res.json(updates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new savings item
router.post('/', validateToken, async (req, res) => {
    const { savingsId, amount, description } = req.body;
    try {
        // Transaction used to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // Specific associated savings model found first
            const savings = await Savings.findByPk(savingsId, { transaction: t });
            if (!savings) {
                throw new Error('Savings goal not found');
            }

            // Update the amount in the savings item
            const newAmount = savings.currentAmount + amount;
            await savings.update({ currentAmount: newAmount }, { transaction: t });

            // Create a new savings update item
            const update = await SavingsUpdate.create({
                SavingsId: savingsId,
                amount,
                description
            }, { transaction: t });

            return { savings, update };
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;