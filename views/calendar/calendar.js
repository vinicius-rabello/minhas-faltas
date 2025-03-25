import { getAttendanceData, initializeCalendar } from "./calendarInit.js";

document.addEventListener("DOMContentLoaded", async () => {
  const attendanceData = await getAttendanceData();
  initializeCalendar(attendanceData, true);
});
