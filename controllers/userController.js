const bcrypt = require('bcrypt');
const users = [];

// Using the same function declaration style for all functions
const getUsers = (req, res) => {
    res.json(users);
};

const createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {
            username: req.body.username,
            password: hashedPassword
        }
        users.push(user);
        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    }
};

const loginUser = async (req, res) => {
    const user = users.find(user => user.username === req.body.username);
    if (user == null) {
        return res.status(400).send('User not found');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.status(200).json({ message: 'Success' });
        } else { 
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch {
        res.sendStatus(500);
    }
};

module.exports = { getUsers, createUser, loginUser };