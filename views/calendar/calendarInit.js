export function initializeCalendar(sampleData) {
  class Calendar {
    constructor(containerElement, data) {
      this.containerElement = containerElement;
      this.data = data;
      this.currentDate = new Date();
    }

    render() {
      // Clear previous content
      this.containerElement.innerHTML = "";

      // Create header
      const header = document.createElement("div");
      header.className = "calendar-header";
      header.innerHTML = `
                    <h2>${this.getCurrentMonthYear()}</h2>
                `;
      this.containerElement.appendChild(header);

      // Create grid
      const grid = document.createElement("div");
      grid.className = "calendar-grid";

      // Add weekday headers
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      weekdays.forEach((day) => {
        const dayHeader = document.createElement("div");
        dayHeader.textContent = day;
        dayHeader.style.textAlign = "center";
        dayHeader.style.fontWeight = "bold";
        grid.appendChild(dayHeader);
      });

      // Get first and last day of current month
      const firstDay = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        0
      );

      // Calculate padding days
      const startingDay = firstDay.getDay();
      const totalDays = lastDay.getDate();

      // Add padding days before first day
      for (let i = 0; i < startingDay; i++) {
        const paddingDay = document.createElement("div");
        paddingDay.className = "calendar-day";
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
        const dateString = this.formatDate(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth() + 1,
          day
        );
        const daySubjects = this.data.filter((item) => item[0] === dateString);

        if (daySubjects.length > 0) {
          dayElement.classList.add("has-subject");
        }

        grid.appendChild(dayElement);
      }

      this.containerElement.appendChild(grid);
    }

    getCurrentMonthYear() {
      return this.currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    formatDate(year, month, day) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  const calendarContainer = document.querySelector(".calendar-container");
  const calendar = new Calendar(calendarContainer, sampleData);
  calendar.render();
}