import { displayUserName, initializeDateBar } from "./homeInit.js";
import { fetchEventsByDate } from "./homeAPI.js";

export async function loadEventsForDay(date) {
  const taskContainer = document.querySelector(".task-container");
  taskContainer.innerHTML = "<p>Loading...</p>"; // Loading indicator

  try {
    const data = await fetchEventsByDate(date);

    taskContainer.innerHTML = ""; // Clear previous data

    if (!data.success || data.data.length === 0) {
      taskContainer.innerHTML = "<p>Você não possui nenhuma aula hoje!</p>";
      return;
    }

    // Render events
    data.data.forEach((event) => {
      const subjectElement = document.createElement("div");
      subjectElement.className = "task-item";

      const infoContainer = document.createElement("div");
      infoContainer.className = "subject-info";

      const nameElement = document.createElement("h4");
      nameElement.textContent = event.subject_name;
      nameElement.className = "subject-name";

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
}

// Popup functionality
document.addEventListener("DOMContentLoaded", function () {
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

    try {
      // Get user email
      const user = await getUserInfo();
      if (!user || !user.email) {
        alert("Authentication error. Please log in again.");
        window.location.href = "/auth/login";
        return;
      }

      // Get selected weekdays
      const selectedDays = [];
      document.querySelectorAll(".weekday-box.selected").forEach((day) => {
        selectedDays.push(parseInt(day.dataset.day));
      });

      // Validate form data
      const subjectName = document.getElementById("subjectName").value;
      const classTime = document.getElementById("classTime").value;
      const startPeriod = document.getElementById("startPeriod").value;
      const endPeriod = document.getElementById("endPeriod").value;

      if (!subjectName) {
        alert("Subject name is required.");
        return;
      }

      if (selectedDays.length === 0) {
        alert("Please select at least one weekday.");
        return;
      }

      if (!classTime) {
        alert("Class time is required.");
        return;
      }

      if (!startPeriod) {
        alert("Start period is required.");
        return;
      }

      if (!endPeriod) {
        alert("End period is required.");
        return;
      }

      // Validate that end period is after start period
      if (new Date(endPeriod) < new Date(startPeriod)) {
        alert("End period must be after start period.");
        return;
      }

      // Create subject object
      const subject = {
        userId: user.user_id,
        subjectName: subjectName,
        weekdays: selectedDays,
        classTime: classTime,
        startPeriod: startPeriod,
        endPeriod: endPeriod,
        isRequired: document.getElementById("isRequired").checked,
      };

      // Show loading indicator or disable submit button
      const submitButton = document.querySelector(".submit-btn");
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Saving...";
      submitButton.disabled = true;

      const res = await fetch("/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subject),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const subjectId = data.data.subject_id; // Extract subject_id

      // Now, send a POST request to /events and pass the subjectId
      const eventRes = await fetch(`/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      });

      if (!eventRes.ok) {
        throw new Error(`Failed to create events: ${eventRes.statusText}`);
      }

      console.log("Events created successfully");

      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;

      if (res.ok) {
        // Close the popup
        document.getElementById("subjectPopup").style.display = "none";

        // Get the currently selected day index
        const selectedDateItem = document.querySelector(".date-item.selected");
        const currentDayIndex = parseInt(selectedDateItem.dataset.dayIndex);

        // Reload subjects for the current day
        loadEventsForDay(currentDayIndex);

        // Reset the form
        subjectForm.reset();
        document.querySelectorAll(".weekday-box.selected").forEach((day) => {
          day.classList.remove("selected");
        });

        // Show success message
        alert("Subject was created successfully!");
      } else {
        // Error handling based on status code
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error occurred" }));

        if (res.status === 400) {
          alert(`Validation error: ${errorData.message}`);
        } else if (res.status === 401 || res.status === 403) {
          alert("Authentication error. Please log in again.");
          window.location.href = "/auth/login";
        } else if (res.status === 409) {
          alert("This subject already exists.");
        } else {
          alert(`Error creating subject: ${errorData.message}`);
        }
        console.error("Error creating subject:", errorData);
      }
    } catch (error) {
      console.error("Client-side error:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  });
});
