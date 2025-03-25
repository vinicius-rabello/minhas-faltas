export function initializeCalendar(sampleData) {
  class Calendar {
    constructor(containerElement, data) {
      this.containerElement = containerElement;
      this.data = data;
      this.currentDate = new Date();

      this.firstDate = new Date(sampleData[0][0]);
      this.lastDate = new Date(sampleData[sampleData.length - 1][0]);

      this.startMonth = new Date(
        this.firstDate.getFullYear(),
        this.firstDate.getMonth(),
        1
      );
      this.endMonth = new Date(
        this.lastDate.getFullYear(),
        this.lastDate.getMonth() + 1,
        0
      ); // Gets last day of month
    }

    render() {
      // Clear previous content
      this.containerElement.innerHTML = "";

      // Create calendar container with scrolling
      const calendarWrapper = document.createElement("div");
      calendarWrapper.className = "calendar-wrapper";

      // Render months from January to December
      let currentRenderDate = new Date(this.startMonth);
      while (currentRenderDate <= this.endMonth) {
        const monthContainer = this.createMonthElement(currentRenderDate);

        calendarWrapper.appendChild(monthContainer);

        // Move to next month
        currentRenderDate.setMonth(currentRenderDate.getMonth() + 1);
      }

      // Scroll to current month
      this.containerElement.appendChild(calendarWrapper);
      this.scrollToCurrentMonth(calendarWrapper);
    }

    createMonthElement(monthDate) {
      const monthContainer = document.createElement("div");
      monthContainer.className = "calendar-month";
      monthContainer.dataset.month = monthDate.getMonth();
      monthContainer.dataset.year = monthDate.getFullYear();

      // Create header
      const header = document.createElement("div");
      header.className = "calendar-header";
      header.innerHTML = `<h3>${this.getMonthYear(monthDate)}</h3>`;
      monthContainer.appendChild(header);

      // Create grid
      const grid = document.createElement("div");
      grid.className = "calendar-grid";

      // Add weekday headers
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      weekdays.forEach((day) => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-grid-header";
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
      });

      // Get first and last day of this month
      const firstDay = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
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
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          day
        );
        const daySubjects = this.data.filter((item) => item[0] === dateString);

        if (daySubjects.length > 0) {
          dayElement.classList.add("has-subject");
        }

        grid.appendChild(dayElement);
      }

      monthContainer.appendChild(grid);
      return monthContainer;
    }

    scrollToCurrentMonth(wrapper) {
      const currentMonthElement = wrapper.querySelector(
        `[data-month="${this.currentDate.getMonth()}"][data-year="${this.currentDate.getFullYear()}"]`
      );
      if (currentMonthElement) {
        currentMonthElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    getMonthYear(date) {
      return date
        .toLocaleString("pt-BR", { month: "long", year: "numeric" })
        .replace(/^./, (match) => match.toUpperCase());
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
