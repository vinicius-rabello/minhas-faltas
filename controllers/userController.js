const { validateEmail, validateUsername, validatePassword } = require('../utils/validation');
const { DateTime } = require("luxon");

const bcrypt = require('bcrypt');
const pool = require("../db/db");

/**
 * Retrieves all users from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Retrieves a user by email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const findUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Returns the currently authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getCurrentUser = (req, res) => {
    res.json(req.user);
};

/**
 * Inserts a new user into the database.
 * @param {Object} user - The user object containing email, username, and hashed password.
 * @returns {Object} The inserted user.
 */
const createUser = async (user) => {
    const { email, username, hashedPassword } = user;
    try {
        const result = await pool.query(
            "INSERT INTO users (email, username, hashed_password) VALUES ($1, $2, $3) RETURNING *",
            [email, username, hashedPassword]
        );
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

/**
 * Registers a new user after validating input and checking for existing accounts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate request body
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

        // Check if user already exists
        const userExists = await pool.query("SELECT email FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash the password and insert user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, username, hashedPassword };
        await createUser(user);

        res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const updateLastLoggedAt = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const lastLoggedAt = DateTime.now().setZone("America/Sao_Paulo").toISO();

        const result = await pool.query(
            `UPDATE users
            SET last_logged_at = $1
            WHERE email = $2
            RETURNING *`,
            [lastLoggedAt, email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Export controller functions
module.exports = { getUsers, registerUser, getCurrentUser, findUserByEmail, updateLastLoggedAt };