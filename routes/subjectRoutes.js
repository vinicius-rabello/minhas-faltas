const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);
router.get('/:user_id/:weekday', subjectController.getSubjectsByUserAndWeekDay)

module.exports = router;