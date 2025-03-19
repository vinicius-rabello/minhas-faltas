const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticate');

router.get('/', authenticateToken, userController.getUsers);
router.get('/me', authenticateToken, userController.getCurrentUser);
router.get('/:email', authenticateToken, userController.findUserByEmail);
router.post('/register', userController.registerUser);
router.put('/last-logged-at', authenticateToken, userController.updateLastLoggedAt)

module.exports = router;