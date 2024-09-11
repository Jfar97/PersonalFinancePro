// RecurringChargeRoutes defines the routes used by the charge item

// Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.User
const RecurringCharge = db.RecurringCharge
const {validateToken} = require("../middlewares/AuthMiddleware");

// Helper function used in the weekly charges to calculate the next upcoming date of the charge
function getNextDayOfWeek(dayOfWeek) {
    const today = new Date();
    const result = new Date(today.getTime());
    // Gets the day of the month (1-31) and day of the week (0-6)
    // Adding 7 moves to the next week, and then the %7 operation calculates the actual number of days until the next charge date
    result.setDate(today.getDate() + (7 + dayOfWeek - today.getDay()) % 7);
    return result;
}

//REQUESTS
// Gets all charge items in the database with their associated UserId
router.get('/', async (req, res) => {
    try {
        const listOfCharges = await RecurringCharge.findAll({
            include: [{
                model: User,
                attributes: ['id'],
            }]
        })
        res.json(listOfCharges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Creates a new charge item
router.post('/', validateToken, async (req, res) => {
    console.log("Received charge creation request")
    try {
        const { name, amount, frequency, type, color, dayOfWeek, dayOfMonth, month } = req.body;

        // Calculates next date of charge, but this implementation did not work as intended
        // Due to this, and the need to continuously update the backend charge date, a new implementation in the frontend is used to calculate all next charge dates
        // This section is thus unnecessary since the nextDateOfCharge element is not actually used and should be removed in future updates to the code
        let nextDateOfCharge = new Date()
        switch(frequency) {
            case 'daily':
                break;
            case 'weekly':
                nextDateOfCharge = getNextDayOfWeek(parseInt(dayOfWeek));
                break;
            case 'monthly':
                nextDateOfCharge.setDate(parseInt(dayOfMonth))
                if(nextDateOfCharge < new Date()) {
                    nextDateOfCharge.setMonth(nextDateOfCharge.getMonth()+1)
                }
                break;
            case 'annually':
                nextDateOfCharge = new Date(nextDateOfCharge.getFullYear(), parseInt(month) - 1, parseInt(dayOfMonth))
                if(nextDateOfCharge < new Date()) {
                    nextDateOfCharge.setFullYear(nextDateOfCharge.getFullYear() + 1)
                }
                break;
        }

        const newRecurringCharge = await RecurringCharge.create({
            name,
            amount,
            frequency,
            type,
            color,
            dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : null,
            dayOfMonth: ['monthly', 'annually'].includes(frequency) ? parseInt(dayOfMonth) : null,
            month: frequency === 'annually' ? parseInt(month) : null,
            dateOfCharge: nextDateOfCharge,
            UserId: req.user.id
        });
        console.log("New charge created: ", newRecurringCharge)
        res.status(201).json(newRecurringCharge);
    } catch (error) {
        console.log("Error creating charge: ", error)
        res.status(500).json({ error: error.message });
    }
})

// Deletes a charge item based upon its unique id
router.delete('/:id', async (req, res) => {
    const chargeId = req.params.id;
    try {
        const result = await RecurringCharge.destroy({
            where: { id: chargeId }
        })
        // Check since validate token does not work due to different build origins of the frontend and backend
        if (result === 0) {
            return res.status(404).json({ message: "Charge not found" });
        }
        res.json({message: `Charge was deleted`})
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;