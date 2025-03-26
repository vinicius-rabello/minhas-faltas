import { fetchAttendanceSummary } from "./summaryAPI.js";

export async function displayUserNameSummary(user) {
  const welcomeMessage = document.getElementById("welcome");

  if (user) {
    welcomeMessage.textContent = `Resumo de ${user.username}`;
  }
}

export async function loadAttendanceSummary(user) {
  // Set innerHTML as a loading indicator while the data is loading
  const container = document.querySelector(".summary-container")
  container.innerHTML = "<p>Carregando...</p>";

  try {
    // Fetch attendance summary for the user
    const response = await fetchAttendanceSummary(user.user_id);

    // Clear previous data
    container.innerHTML = "";

    // If anything goes wrong, or if response has 0 rows, then say no data is available
    if (!response.success || response.data.length === 0) {
      container.innerHTML = "<p>Nenhum dado de presença encontrado!</p>";
      return;
    }

    // Render each subject's attendance
    response.data.forEach((subject) => {
      // Create subject item
      const subjectElement = document.createElement("div");
      subjectElement.className = "subject-item";

      // Create info container
      const infoContainer = document.createElement("div");
      infoContainer.className = "subject-info";

      // Subject name
      const nameElement = document.createElement("h4");
      nameElement.className = "subject-name";
      nameElement.textContent = `${subject.subject_name} ${
        subject.is_required ? "(Obrigatória)" : ""
      }`;

      // Attendance details
      const detailsElement = document.createElement("p");
      detailsElement.className = "subject-time";
      detailsElement.textContent = `Presença: ${subject.attended_classes} / ${subject.total_classes} (${subject.attendance}%)`;

      // Status element
      const statusElement = document.createElement("div");
      statusElement.className = "subject-status";

      // Determine status based on attendance
      const attendancePercentage = parseFloat(subject.attendance);
      if (attendancePercentage >= 75) {
        subjectElement.classList.add("status-good");
      } else if (attendancePercentage < 75) {
        subjectElement.classList.add("status-bad");
      } else {
        subjectElement.classList.add("status-pending");
      }
      statusElement.textContent = `${Math.round(attendancePercentage)}%`;

      // Assemble the subject item
      infoContainer.appendChild(nameElement);
      infoContainer.appendChild(detailsElement);
      subjectElement.appendChild(infoContainer);
      subjectElement.appendChild(statusElement);
      container.appendChild(subjectElement);
    });
  } catch (error) {
    console.error("Error loading attendance summary:", error);
    container.innerHTML = "<p>Error loading attendance summary.</p>";
  }
}
