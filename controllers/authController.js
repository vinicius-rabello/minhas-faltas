const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require("../db/db");
const { generateAccessToken, generateRefreshToken } = require('../config/auth');
const { validateEmail } = require('../utils/validation');


let refreshTokens = [];

const token = (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });
};

const login = (req, res) => {
    // User authentication goes here
    const email = req.body.email;
    const user = { email: email };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
};

const logout = (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Both email and password are required.' });
    }

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
          return res.status(400).json({ message: 'No account found with that e-mail.' });
        }
    
        const user = result.rows[0];

        if (await bcrypt.compare(password, user.hashed_password)) {
            res.status(200).json({ message: 'Success' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch {
        res.sendStatus(500);
    }
};

module.exports = { token, login, logout, loginUser };