import { initializeCalendar } from "./calendarInit.js";
import { getUserInfo } from "../common/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUserInfo();
    const response = await fetch(`/events/${user.user_id}/attendance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }

    const { data: attendanceData } = await response.json();

    // Check if attendanceData is empty
    if (!attendanceData || attendanceData.length === 0) {
      console.warn('No attendance data available');
      const calendarContainer = document.querySelector('.calendar-container');
      if (calendarContainer) {
        calendarContainer.innerHTML = `
          <div class="error-message">
            <p>Você ainda não tem nenhuma matéria!</p>
          </div>
        `;
      }
      return;
    }

    // Initialize calendar with fetched data
    initializeCalendar(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
      calendarContainer.innerHTML = `
        <div class="error-message">
          <p>Ocorreu um erro ao carregar o Calendário.</p>
        </div>
      `;
    }
  }
});