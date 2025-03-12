const { validateEmail, validateUsername, validatePassword } = require('../utils/validation');
const bcrypt = require('bcrypt');
const pool = require("../db/db");
const users = [];

const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCurrentUser = (req, res) => {
    res.json(req.user);
}

const insertUser = async (user) => {
    const { email, username, hashedPassword } = user;
    try {
        const result = await pool.query(
          "INSERT INTO users (email, username, hashed_password) VALUES ($1, $2, $3) RETURNING *",
          [email, username, hashedPassword]
        );
        return result.rows[0]
      } catch (err) {
        throw(err);
      }
}

const registerUser = async (req, res) => {
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

        const existingUser = await pool.query(
            "SELECT email FROM users WHERE email = $1",
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, username, hashedPassword };
        await insertUser(user);
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

module.exports = { getUsers, registerUser, loginUser, getCurrentUser, getUserByEmail };