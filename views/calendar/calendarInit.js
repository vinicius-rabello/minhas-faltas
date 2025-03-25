import {
  dayNames,
  dayNamesAbbreviatedLowerCase,
  monthNames,
} from "../home/dateConstants.js";
import { loadEventsForDay } from "../common/utils.js";
import { getUserInfo } from "../common/auth.js";
import { getUserAttendance } from "./calendarAPI.js";

export function initializeCalendar(attendanceData, smoothScroll = false) {
  // Extract date range information
  const firstDate = new Date(attendanceData[0].date);
  const lastDate = new Date(attendanceData[attendanceData.length - 1].date);
  const currentDate = new Date();

  const startMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  const endMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

  // Convert attendanceData to a map for easier lookup
  const attendanceMap = new Map(
    attendanceData.map((item) => [item.date.split("T")[0], item])
  );

  // Utility functions
  function getMonthYear(date) {
    return date
      .toLocaleString("pt-BR", { month: "long", year: "numeric" })
      .replace(/^./, (match) => match.toUpperCase());
  }

  function formatDate(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  function getAttendanceBackgroundColor(attendanceInfo) {
    if (!attendanceInfo) return "inherit"; // default color for days without data

    if (attendanceInfo.is_missed_day === 1) {
      return "#ff4d4d"; // bright red for missed days
    }

    if (attendanceInfo.total_classes > 0 && attendanceInfo.attendance === 0) {
      return "inherit"; // original background for days with classes but no attendance
    }

    // Green gradient based on attendance (like GitHub contribution graph)
    const greenShades = [
      "#9be9a8", // lightest green
      "#40c463", // light green
      "#30a14e", // medium green
      "#216e39", // dark green
    ];

    // Map attendance (0-1) to green shade index
    const shadeIndex = Math.floor(
      attendanceInfo.attendance * (greenShades.length - 1)
    );
    return greenShades[shadeIndex];
  }

  function createMonthElement(monthDate) {
    const monthContainer = document.createElement("div");
    monthContainer.className = "calendar-month";
    monthContainer.dataset.month = monthDate.getMonth();
    monthContainer.dataset.year = monthDate.getFullYear();

    // Create header
    const header = document.createElement("div");
    header.className = "calendar-header";
    header.innerHTML = `<h3>${getMonthYear(monthDate)}</h3>`;
    monthContainer.appendChild(header);

    // Create grid
    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    // Add weekday headers
    dayNamesAbbreviatedLowerCase.forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-grid-header";
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });

    // Get first and last day of this month
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const lastDay = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    );

    // Calculate padding days
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Add padding days before first day
    for (let i = 0; i < startingDay; i++) {
      const paddingDay = document.createElement("div");
      paddingDay.className = "calendar-day-padding";
      grid.appendChild(paddingDay);
    }

    // Render days
    for (let day = 1; day <= totalDays; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";

      // Create day number
      const dayNumber = document.createElement("span");
      dayNumber.className = "calendar-day-number";
      dayNumber.textContent = day;
      dayElement.appendChild(dayNumber);

      // Check if this day has subjects
      const dateString = formatDate(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        day
      );

      const attendanceInfo = attendanceMap.get(dateString);
      if (
        attendanceInfo &&
        (attendanceInfo.is_missed_day === 1 || attendanceInfo.attendance > 0)
      ) {
        // Set background color based on attendance
        dayElement.style.backgroundColor =
          getAttendanceBackgroundColor(attendanceInfo);
      }

      // Add subject marker if there are classes
      if (attendanceInfo && attendanceInfo.total_classes > 0) {
        dayElement.classList.add("has-subject");
      }

      // Add click event to days with subjects
      dayElement.addEventListener("click", () => {
        openEventModal(dateString);
      });

      grid.appendChild(dayElement);
    }

    monthContainer.appendChild(grid);
    return monthContainer;
  }
  function scrollToCurrentMonth(wrapper, smoothScroll) {
    // If smoothScroll is false, do nothing
    if (!smoothScroll) {
      return; // Explicitly return without any scrolling
    }

    const currentMonthElement = wrapper.querySelector(
      `[data-month="${currentDate.getMonth()}"][data-year="${currentDate.getFullYear()}"]`
    );

    if (currentMonthElement) {
      currentMonthElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  function renderCalendar() {
    const calendarContainer = document.querySelector(".calendar-container");

    // Clear previous content
    calendarContainer.innerHTML = "";

    // Create calendar container with scrolling
    const calendarWrapper = document.createElement("div");
    calendarWrapper.className = "calendar-wrapper";

    // Render months from January to December
    let currentRenderDate = new Date(startMonth);
    while (currentRenderDate <= endMonth) {
      const monthContainer = createMonthElement(currentRenderDate);

      calendarWrapper.appendChild(monthContainer);

      // Move to next month
      currentRenderDate.setMonth(currentRenderDate.getMonth() + 1);
    }

    // Scroll to current month
    calendarContainer.appendChild(calendarWrapper);
    scrollToCurrentMonth(calendarWrapper, smoothScroll);
  }

  // Invoke the render function
  renderCalendar();
}

export async function openEventModal(date) {
  let modal = document.getElementById("event-modal");
  let modalBody = document.getElementById("event-modal-body");
  let closeModalBtn = document.getElementById("closeEventModalBtn");

  // Store the current scroll position before opening the modal
  const calendarWrapper = document.querySelector(".calendar-wrapper");
  const scrollPositionBeforeModal = calendarWrapper
    ? calendarWrapper.scrollTop
    : 0;

  // Create modal structure if it doesn't exist
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "event-modal";
    modal.className = "event-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "event-modal-content";

    // Create date header
    const dateHeader = document.createElement("h3");
    dateHeader.className = "date-header";
    modalContent.appendChild(dateHeader);

    closeModalBtn = document.createElement("span");
    closeModalBtn.id = "closeEventModalBtn";
    closeModalBtn.className = "event-modal-close";
    closeModalBtn.innerHTML = "&times;";

    modalBody = document.createElement("div");
    modalBody.id = "event-modal-body";
    modalBody.className = "event-modal-body";

    modalContent.appendChild(closeModalBtn);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  // Display modal
  modal.style.display = "flex";

  const [year, month, day] = date.split("-");
  const selectedDate = new Date(year, month - 1, day);
  const dayIndex = selectedDate.getDay();
  const dayNumber = selectedDate.getDate();
  const monthIndex = selectedDate.getMonth();

  // Set date header text
  const dateHeaderElement = modal.querySelector(".date-header");
  dateHeaderElement.textContent = `${dayNames[dayIndex]}, ${dayNumber} de ${monthNames[monthIndex]}`;

  // Close modal on button click
  const handleClose = async () => {
    const attendanceData = await getAttendanceData();

    // Reinitialize calendar
    initializeCalendar(attendanceData, false);

    // Restore scroll position
    const updatedCalendarWrapper = document.querySelector(".calendar-wrapper");
    if (updatedCalendarWrapper) {
      updatedCalendarWrapper.scrollTop = scrollPositionBeforeModal;
    }

    modal.style.display = "none";

    // Remove the event listener to prevent multiple bindings
    closeModalBtn.removeEventListener("click", handleClose);
  };

  // Add event listener
  closeModalBtn.addEventListener("click", handleClose);

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target === modal) {
      handleClose();
      modal.removeEventListener("click", handleOutsideClick);
    }
  };

  modal.addEventListener("click", handleOutsideClick);

  // Load events for the day
  await loadEventsForDay(date, modalBody);
}
// export async function openEventModal(date) {
//   let modal = document.getElementById("event-modal");
//   let modalBody = document.getElementById("event-modal-body");
//   let closeModalBtn = document.getElementById("closeEventModalBtn");

//   // Create modal structure if it doesn't exist
//   if (!modal) {
//     modal = document.createElement("div");
//     modal.id = "event-modal";
//     modal.className = "event-modal";

//     const modalContent = document.createElement("div");
//     modalContent.className = "event-modal-content";

//     // Create date header
//     const dateHeader = document.createElement("h3");
//     dateHeader.className = "date-header";
//     modalContent.appendChild(dateHeader);

//     closeModalBtn = document.createElement("span");
//     closeModalBtn.id = "closeEventModalBtn";
//     closeModalBtn.className = "event-modal-close";
//     closeModalBtn.innerHTML = "&times;";

//     modalBody = document.createElement("div");
//     modalBody.id = "event-modal-body";
//     modalBody.className = "event-modal-body";

//     modalContent.appendChild(closeModalBtn);
//     modalContent.appendChild(dateHeader);
//     modalContent.appendChild(modalBody);
//     modal.appendChild(modalContent);
//     document.body.appendChild(modal);
//   }

//   // Display modal
//   modal.style.display = "flex";

//   const [year, month, day] = date.split('-');
//   const selectedDate = new Date(year, month - 1, day);
//   const dayIndex = selectedDate.getDay();
//   const dayNumber = selectedDate.getDate();
//   const monthIndex = selectedDate.getMonth();

//   // Set date header text
//   const dateHeaderElement = modal.querySelector(".date-header");
//   dateHeaderElement.textContent = `${dayNames[dayIndex]}, ${dayNumber} de ${monthNames[monthIndex]}`;

//   // Close modal on button click
//   const handleClose = async () => {
//     const attendanceData = await getAttendanceData();

//     // Reinitialize calendar without any scrolling
//     initializeCalendar(attendanceData, false);

//     modal.style.display = "none";

//     // Remove the event listener to prevent multiple bindings
//     closeModalBtn.removeEventListener('click', handleClose);
//   };

//   // Add event listener
//   closeModalBtn.addEventListener('click', handleClose);

//   // Close modal when clicking outside
//   const handleOutsideClick = (e) => {
//     if (e.target === modal) {
//       handleClose();
//       modal.removeEventListener('click', handleOutsideClick);
//     }
//   };

//   modal.addEventListener('click', handleOutsideClick);

//   // Load events for the day
//   await loadEventsForDay(date, modalBody);
// }

export async function getAttendanceData() {
  try {
    const user = await getUserInfo();
    const data = await getUserAttendance(user.user_id);

    if (!data) {
      throw new Error("Failed to fetch attendance data");
    }

    const { data: attendanceData } = data;

    // Check if attendanceData is empty
    if (!attendanceData || attendanceData.length === 0) {
      console.warn("No attendance data available");
      const calendarContainer = document.querySelector(".calendar-container");
      if (calendarContainer) {
        calendarContainer.innerHTML = `
          <div class="error-message">
            <p>Você ainda não tem nenhuma matéria!</p>
          </div>
        `;
      }
      return;
    }

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    const calendarContainer = document.querySelector(".calendar-container");
    if (calendarContainer) {
      calendarContainer.innerHTML = `
        <div class="error-message">
          <p>Ocorreu um erro ao carregar o Calendário.</p>
        </div>
      `;
    }
  }
}
