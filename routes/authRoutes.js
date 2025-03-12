const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login/login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register/register.html'));
});

router.post('/login', authController.login);
router.post('/token', authController.refreshAccessToken);
router.post('/verify', authController.authenticateUser);
router.delete('/logout', authController.logout);

module.exports = router;