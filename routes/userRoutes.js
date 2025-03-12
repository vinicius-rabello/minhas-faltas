const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticate');

router.get('/', authenticateToken, userController.getUsers);
router.get('/me', authenticateToken, userController.getCurrentUser);
router.post('/login', userController.loginUser);
router.post('/register', userController.createUser);

module.exports = router;