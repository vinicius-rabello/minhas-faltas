const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/", eventController.createEventsBetweenStartAndEndPeriod);
router.get("/date/:date/user/:userId", eventController.getEventsForDateAndUser);
router.put("/:eventId", eventController.updateStatus);
router.get("/user/:userId/attendance", eventController.getDailyAttendance);

module.exports = router;
