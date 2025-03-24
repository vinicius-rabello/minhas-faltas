import { initializeCalendar } from "./calendarInit.js";

const sampleData = [
    ["2025-03-02", 10, null, false],
    ["2025-03-04", 13, null, false]
];

document.addEventListener("DOMContentLoaded", () => {
    initializeCalendar(sampleData);
});