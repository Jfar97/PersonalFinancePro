// UserRoutes acts as the route endpoints for the User model

// Imports
const express = require('express');
const router = express.Router();
const {User} = require('../models')
const bcrypt = require('bcrypt');
const {sign} = require('jsonwebtoken')

// Routes
// Gets all users, and returns their id, username, and email
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'email'] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post request to create a new user item in the database
router.post('/', async (req, res) => {
    try {
        const { username, email, password, securityQuestion, securityAnswer } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ where: { username: username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ where: { email: email } });
        if (existingEmail) {
            return res.status(400).json({ error: "Email address already in use" });
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            securityQuestion,
            securityAnswer,
        });
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post request to log a user in by creating a JWT token
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt for user:", username);

        // Check if the user exists
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            console.log("User not found:", username);
            return res.status(404).json({ error: "User does not exist" });
        }

        // Compare passwords
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            console.log("Incorrect password for user:", username);
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Create and send json web token once successful login
        const accessToken = sign({
            username: user.username,
            id: user.id,
        }, "dafwegaxhsasdasescx")
        console.log("Login successful, token generated for user:", username);
        res.json({ message: "You have successfully logged in!", accessToken})

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "An error occurred during login" });
    }
});

// Post route that returns a user's associated security question
// Originally made into a post request due to having to send a security answer for a check, but most likely can be converted to a get route as this seems to be unnecessary
router.post('/get-security-question', async (req, res) => {
    try {
        const { username } = req.body;
        // Filters specific user using username from webtoken
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post route that resets a users password
router.post('/reset-password', async (req, res) => {
    try {
        const { username, securityAnswer, newPassword } = req.body;
        // Filters specific user using username from webtoken
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Checks to see if the security answer is correct
        if (user.securityAnswer !== securityAnswer) {
            return res.status(400).json({ error: "Incorrect security answer" });
        }
        // Hashes new password and updates user item with it
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletes a user by their specific id
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Attempts to find and destroy user with id
        const result = await User.destroy({
            where: {
                id: userId,
            }
        });
        // Sends error if user not found
        if (result === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({message: `User was deleted and orphaned data cleaned up`});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;