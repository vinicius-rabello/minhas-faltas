const { validateEmail, validateUsername, validatePassword } = require('../utils/validation');
const bcrypt = require('bcrypt');
const pool = require("../db/db");
const users = [];

// Using the same function declaration style for all functions
const getUsers = (req, res) => {
    res.json(users);
};

const getCurrentUser = async (req, res) => {
    res.json(req.user);
}

const createUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({ message: 'Username can only contain letters, spaces, accents, and tildes.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        if (users.some(user => user.email === email)) {
            return res.status(409).json({ message: 'Email already in use.' });  // Send error JSON
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, username, password: hashedPassword };
        const { name, muscle_group, description, difficulty } = req.body;

        res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Both email and password are required.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'No account found with that e-mail.' });
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Success' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch {
        res.sendStatus(500);
    }
};

module.exports = { getUsers, createUser, loginUser, getCurrentUser };