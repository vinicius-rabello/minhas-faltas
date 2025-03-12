const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require("../db/db");
const { generateAccessToken, generateRefreshToken } = require('../config/auth');
const { validateEmail } = require('../utils/validation');

let refreshTokens = [];

/**
 * Generates a new access token using a valid refresh token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const refreshAccessToken = (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) return res.sendStatus(401); // Unauthorized if no token is provided
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403); // Forbidden if token is invalid

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken });
    });
};

/**
 * Logs in a user, generating access and refresh tokens.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const login = (req, res) => {
    const { email } = req.body;
    const user = { email };

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
};

/**
 * Logs out a user by removing their refresh token from the stored list.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const logout = (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204); // No content response on successful logout
};

/**
 * Verifies user credentials (email and password) for authentication.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Both email and password are required.' });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Query the database for the user
        const result = await pool.query(
            "SELECT email, username, hashed_password FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'No account found with that email.' });
        }

        const user = result.rows[0];

        // Compare the provided password with the hashed password
        if (await bcrypt.compare(password, user.hashed_password)) {
            res.status(200).json({ message: 'Success' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500); // Internal server error
    }
};

// Export authentication functions
module.exports = { refreshAccessToken, login, logout, authenticateUser };