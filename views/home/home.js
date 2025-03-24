import { displayUserName, initializeDateBar, initializePopupForm } from "./homeInit.js";
import { fetchEventsByDate } from "./homeAPI.js";
import { submitForm } from "./eventHandlers.js";

// This method loads all events that current user has at the specified date
export async function loadEventsForDay(date) {
  // Set innerHTML as a loading indicator while the events are loading
  const taskContainer = document.querySelector(".task-container");
  taskContainer.innerHTML = "<p>Carregando...</p>";

  try {
    // Fetches all the events by date (and user)
    const data = await fetchEventsByDate(date);
    taskContainer.innerHTML = ""; // Clear previous data

    // If anything goes wrong, or if response has 0 rows, then say user has no events today.
    if (!data.success || data.data.length === 0) {
      taskContainer.innerHTML = "<p>Você não possui nenhuma aula hoje!</p>";
      return;
    }

    // Render events
    data.data.forEach((event) => {
      // Create a task-item div
      const subjectElement = document.createElement("div");
      subjectElement.className = "task-item";

      // Create a container for the info on task (class name and class time, for example)
      const infoContainer = document.createElement("div");
      infoContainer.className = "subject-info";

      // Create a nameElement to be added to infoContainer
      const nameElement = document.createElement("h4");
      nameElement.textContent = event.subject_name;
      nameElement.className = "subject-name";

      // Create a timeElement to be added to infoContainer
      const timeElement = document.createElement("p");
      timeElement.textContent = event.class_time.substring(0, 5);
      timeElement.className = "subject-time";

      // Create status toggle element
      const statusElement = document.createElement("div");
      statusElement.className = "status-toggle";
      statusElement.dataset.eventId = event.id;
      statusElement.dataset.currentStatus = event.status || "pending";
      updateStatusAppearance(statusElement);

      // Add click event to cycle through statuses
      statusElement.addEventListener("click", handleStatusToggle);

      // Combine the elements together
      infoContainer.appendChild(nameElement);
      infoContainer.appendChild(timeElement);
      subjectElement.appendChild(infoContainer);
      subjectElement.appendChild(statusElement);
      taskContainer.appendChild(subjectElement);
    });
  } catch (error) {
    console.error("Error loading events:", error);
    taskContainer.innerHTML = "<p>Error loading tasks.</p>";
  }
}

// Welcome Section
document.addEventListener("DOMContentLoaded", async () => {
  displayUserName();
  initializeDateBar();
  initializePopupForm();
});

// Status options
const STATUS_OPTIONS = ["pending", "attended", "missed", "canceled"];

// Function to handle status toggle click
async function handleStatusToggle(event) {
  const statusElement = event.currentTarget;
  const eventId = statusElement.dataset.eventId;
  const currentStatus = statusElement.dataset.currentStatus;

  // Get next status in cycle
  const currentIndex = STATUS_OPTIONS.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
  const newStatus = STATUS_OPTIONS[nextIndex];

  try {
    // Update status in database
    const response = await fetch(`/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (result.success) {
      // Update UI if successful
      statusElement.dataset.currentStatus = newStatus;
      updateStatusAppearance(statusElement);
    } else {
      console.error("Failed to update status:", result.message);
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

function updateStatusAppearance(statusElement) {
  const status = statusElement.dataset.currentStatus;

  // Clear previous classes
  statusElement.classList.remove(
    "status-pending",
    "status-attended",
    "status-missed",
    "status-canceled"
  );

  // Add appropriate class
  statusElement.classList.add(`status-${status}`);

  // Set just the icon
  let statusIcon = "";

  switch (status) {
    case "pending":
      statusIcon = "";
      break;
    case "attended":
      statusIcon = "✅";
      break;
    case "missed":
      statusIcon = "❌";
      break;
    case "canceled":
      statusIcon = "🚫";
      break;
  }
  statusElement.innerHTML = statusIcon;
};