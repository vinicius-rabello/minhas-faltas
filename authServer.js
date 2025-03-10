require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json());

let refreshTokens = [];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = genereateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});

app.post('/login', (req, res) => {
    // User authentication goes here
    const username = req.body.username;
    const user = { name: username };

    const accessToken = genereateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function genereateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const users = [];

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', async (req,res) => {
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {
            name: req.body.name,
            password: hashedPassword
        }
        users.push(user);
        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    };
});

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name);
    if (user == null) {
        return res.status(400).send('User not found');
    };
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success.');
        } else { res.send('Not Allowed.')}
    } catch {
        res.sendStatus(500);
    };
});

app.listen(4000);