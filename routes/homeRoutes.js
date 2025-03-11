const express = require('express');
const path = require('path');
const authenticateToken = require('../middleware/authenticate');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/home/home.html'));
});

module.exports = router;