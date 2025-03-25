import { dayNamesAbbreviatedLowerCase } from "../home/dateConstants.js";

export function initializeCalendar(attendanceData) {
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

      grid.appendChild(dayElement);
    }

    monthContainer.appendChild(grid);
    return monthContainer;
  }

  function scrollToCurrentMonth(wrapper) {
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
    scrollToCurrentMonth(calendarWrapper);
  }

  // Invoke the render function
  renderCalendar();
}
