const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticate');

router.get('/', authenticateToken, userController.getUsers);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);

module.exports = router;