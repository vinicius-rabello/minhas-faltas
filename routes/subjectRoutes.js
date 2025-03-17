const express = require('express');
const path = require('path');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);

module.exports = router;