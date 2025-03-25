const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/", eventController.createEventsBetweenStartAndEndPeriod);
router.get("/:date", eventController.getEventsForDate);
router.put("/:eventId", eventController.updateStatus);
router.get("/:userId/attendance", eventController.getDailyAttendance);

module.exports = router;
