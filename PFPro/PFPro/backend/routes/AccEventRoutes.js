// AccEventRoutes defines the routes used for event items

//Imports
const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.User;
const AccEvent = db.AccEvent;
const { validateToken } = require("../middlewares/AuthMiddleware");


// Helper function to validate date inputs
function validateDates(startDate, endDate, frequency) {
    // Set start date and end date values
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    // Ensure end date is after the starting date
    if (end && end <= start) {
        throw new Error("End date must be after start date");
    }
    if (end) {
        // Calculate the full event duration in days
        const duration = (end - start) / (1000 * 60 * 60 * 24);
        // Ensure multi-day events can not be daily
        if (frequency === 'daily' && duration > 1) {
            throw new Error("Multi-day events cannot repeat daily");
        }
        // Ensure events over a week can not be weekly
        if (frequency === 'weekly' && duration > 7) {
            throw new Error("Events longer than a week cannot repeat weekly");
        }
        // Ensure events over a month can not be monthly
        if (frequency === 'monthly' && duration > 31) {
            throw new Error("Events longer than a month cannot repeat monthly");
        }
        // Ensure events over a year can not be annually
        if(frequency === 'annually' && duration > 365) {
            throw new Error("Events longer than a year cannot repeat annually");
        }
    }
}


// REQUESTS
// Gets all events and includes the associated UserId
router.get('/', async (req, res) => {
    try {
        const listOfEvents = await AccEvent.findAll({
            include: [{
                model: User,
                attributes: ['id'],
            }]
        });
        res.json(listOfEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Creates a new event
router.post('/', validateToken, async (req, res) => {
    console.log("Received event creation request");
    try {
        const { name, amount, frequency, type, color, startDate, endDate, dayOfWeek, dayOfMonth, month } = req.body;

        // Ensure selected dates do not have issues with each other or the frequency
        validateDates(startDate, endDate, frequency);

        // Create a new event
        const newEvent = await AccEvent.create({
            name,
            amount,
            frequency,
            type,
            color,
            startDate,
            endDate,
            dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : null,
            dayOfMonth: ['monthly', 'annually'].includes(frequency) ? parseInt(dayOfMonth) : null,
            month: frequency === 'annually' ? parseInt(month) : null,
            UserId: req.user.id
        });
        console.log("New event created: ", newEvent);
        res.status(201).json(newEvent);
    } catch (error) {
        console.log("Error creating event: ", error);
        res.status(400).json({ error: error.message });
    }
});

// Delete an event based up the event id
router.delete('/:id', async (req, res) => {
    const eventId = req.params.id;
    try {
        const result = await AccEvent.destroy({
            where: { id: eventId }
        });
        if (result === 0) {
            return res.status(404).json({ message: "Event not found or you're not authorized to delete it" });
        }
        res.json({ message: `Event was deleted` });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;