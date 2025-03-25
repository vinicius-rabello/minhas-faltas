import { getUserInfo } from "../common/auth.js";
import { loadEventsForDay } from "../common/utils.js";
import { createEventsFromSubjectId, postSubject } from "./homeAPI.js";

// Method that activates when you submit the add subject form
export async function submitForm() {
  try {
    // Get user info
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

    const data = await postSubject(subject);

    // If post request is not successful, throw error
    if (!data.success) {
      throw new Error(data.message);
    }

    const subjectId = data.data.subject_id; // Extract subject_id

    // Now, send a POST request to /events and pass the subjectId
    const res = await createEventsFromSubjectId(subjectId);

    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;

    if (res.ok) {
      // Close the popup
      document.getElementById("subjectPopup").style.display = "none";

      // Get the currently selected day index
      const selectedDateItem = document.querySelector(".date-item.selected");
      const currentDate = selectedDateItem.dataset.date;

      // Reload subjects for the current day
      loadEventsForDay(currentDate);

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
}