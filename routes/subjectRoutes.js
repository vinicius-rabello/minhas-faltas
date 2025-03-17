const express = require('express');
const path = require('path');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);
router.get('/:email/:weekday', subjectController.findSubjectByEmailAndWeekDay)

module.exports = router;