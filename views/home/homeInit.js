import { getUserInfo } from "../common/auth.js";
import { loadEventsForDay } from "../common/utils.js";
import { dayNames, dayNamesAbbreviated, monthNames } from "./dateConstants.js";
import { submitForm } from "./eventHandlers.js";

export async function displayUserName() {
  const welcomeMessage = document.getElementById("welcome");
  const user = await getUserInfo();

  if (user) {
    welcomeMessage.textContent = `Olá, ${user.username}!`;
  }
}

export async function initializeDateBar() {
  // Get the user information
  const user = await getUserInfo();

  // Get the dateBar and taskContainer component
  const dateBar = document.getElementById("dateBar");
  const taskContainer = document.querySelector(".task-container");

  // Get the current day
  const today = new Date();

  // Get the day where the week started
  const startOfWeek = new Date(today);
  startOfWeek.setDate(
    // Example: Today is Thursday the 27th, then we do 27 (getDate) - 4 (getDay) + 1 = 24th (Monday)
    // Example: Today is Sunday the 30th, then we do 30 (getDate) - 0 (getDay) + (-6) = 24th (Monday)
    today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
  );


  // Iterate through every day of week
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);


    // Get the dayIndex (0 for Sunday, 1 for Munday, ..., 6 for Saturday)
    const dayIndex = date.getDay();
    // Map dayIndex to a Day of Week string
    const dayName = dayNamesAbbreviated[dayIndex];
    // Get the Day and Month for the current Date
    const dayNumber = date.getDate();
    const monthIndex = date.getMonth();

    // Create a data-item div
    const dateItem = document.createElement("div");
    dateItem.className = "date-item";

    // Store the full date information as data attributes
    dateItem.dataset.dayIndex = dayIndex;
    dateItem.dataset.monthIndex = monthIndex;
    dateItem.dataset.dayNumber = dayNumber;

    // Store the full date as a dataset
    const options = { 
      timeZone: 'America/Sao_Paulo', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };

    const formattedDate = date.toLocaleDateString('en-CA', options); // "YYYY-MM-DD"
    dateItem.dataset.date = formattedDate;

    // Make Today be selected as default
    if (formattedDate === today.toLocaleDateString('en-CA', options)) {
      dateItem.classList.add("selected");

      // Set the textContent in date-header to a string of the following format:
      // "Segunda, 24 de Março"
      document.querySelector(
        ".date-header"
      ).textContent = `${dayNames[dayIndex]}, ${dayNumber} de ${monthNames[monthIndex]}`;
      loadEventsForDay(formattedDate, user.user_id, taskContainer); // Pass full date instead of index
    }

    // Set the date-item div to have the day of week name and day number
    dateItem.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div class="day-number">${dayNumber}</div>
      `;

    dateItem.addEventListener("click", function () {
      // Get the date information from data attributes
      const selectedDayIndex = parseInt(this.dataset.dayIndex);
      const selectedMonthIndex = parseInt(this.dataset.monthIndex);
      const selectedDayNumber = parseInt(this.dataset.dayNumber);

      // Get the full date from dataset
      const selectedDate = this.dataset.date;

      // Set the header text to the full day name and month
      document.querySelector(
        ".date-header"
      ).textContent = `${dayNames[selectedDayIndex]}, ${selectedDayNumber} de ${monthNames[selectedMonthIndex]}`;

      // Remove selected class from all date items
      document.querySelectorAll(".date-item").forEach((item) => {
        item.classList.remove("selected");
      });

      // Add selected class to selected item
      this.classList.add("selected");

      loadEventsForDay(selectedDate, user.user_id, taskContainer);
    });

    dateBar.appendChild(dateItem);
  }
}

export async function initializePopupForm() {
  const addSubjectBtn = document.getElementById("addSubjectBtn");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const subjectPopup = document.getElementById("subjectPopup");
  const subjectForm = document.getElementById("subjectForm");
  const weekdayBoxes = document.querySelectorAll(".weekday-box");

  // Open popup
  addSubjectBtn.addEventListener("click", function () {
    subjectPopup.style.display = "flex";
  });

  // Close popup
  closePopupBtn.addEventListener("click", function () {
    subjectPopup.style.display = "none";
  });

  // Close popup when clicking outside
  subjectPopup.addEventListener("click", function (e) {
    if (e.target === subjectPopup) {
      subjectPopup.style.display = "none";
    }
  });

  // Toggle weekday selection
  weekdayBoxes.forEach((box) => {
    box.addEventListener("click", function () {
      this.classList.toggle("selected");
    });
  });

  // Form submission
  subjectForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    submitForm();
  });
}

// I STILL NEED TO MAKE A LOGOUT BUTTON

// const logoutButton = document.getElementById("logoutButton");

// // Handle logout button click
// logoutButton.addEventListener("click", () => {
//   localStorage.removeItem("accessToken");
//   window.location.href = "/auth/login";
// });
