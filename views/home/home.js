import { displayUserName, initializeDateBar, initializePopupForm } from "./homeInit.js";

// Welcome Section
document.addEventListener("DOMContentLoaded", async () => {
  displayUserName();
  initializeDateBar();
  initializePopupForm();
});