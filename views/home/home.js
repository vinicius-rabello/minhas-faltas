// Welcolme Section
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('accessToken');
    const welcomeMessage = document.getElementById('welcome');
    const logoutButton = document.getElementById('logoutButton');

    if (!token) {
        window.location.href = '/auth/login';
        return;
    }

    try {
        const res = await fetch('/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `BEARER ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const userData = await res.json();
        
            const userProfileRes = await fetch(`/users/${userData.email}`, {
                method: 'GET',
                headers: {
                    'Authorization': `BEARER ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (userProfileRes.ok) {
                const userProfile = await userProfileRes.json();
                const user = Array.isArray(userProfile) ? userProfile[0] : userProfile;
                welcomeMessage.textContent = `Olá, ${user.username}!`;
            } else {
                console.error('Failed to fetch user profile');
            }
        } else {
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
    }

    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
    });
});

// DateBar
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const dayNamesAbbreviated = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

document.addEventListener('DOMContentLoaded', function() {
    const dateBar = document.getElementById('dateBar');
    const today = new Date();
    
    // Generate dates for a week (starting from today)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayIndex = date.getDay();
      const dayName = dayNamesAbbreviated[dayIndex];
      const dayNumber = date.getDate();
      const monthIndex = date.getMonth();
      
      const dateItem = document.createElement('div');
      dateItem.className = 'date-item';
      
      // Store the full date information as data attributes
      dateItem.dataset.dayIndex = dayIndex;
      dateItem.dataset.monthIndex = monthIndex;
      dateItem.dataset.dayNumber = dayNumber;
      
      // Set the current day (or a specific day) as selected
      if (i === 0) { // Making the first day selected
        dateItem.classList.add('selected');
        // Set initial header text with day and month
        document.querySelector('.date-header').textContent = `${dayNames[dayIndex]}, ${dayNumber} de ${monthNames[monthIndex]}`;
      }
      
      dateItem.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div class="day-number">${dayNumber}</div>
      `;
      
      dateItem.addEventListener('click', function() {
        // Get the date information from data attributes
        const clickedDayIndex = parseInt(this.dataset.dayIndex);
        const clickedMonthIndex = parseInt(this.dataset.monthIndex);
        const clickedDayNumber = parseInt(this.dataset.dayNumber);
        
        // Set the header text to the full day name and month
        document.querySelector('.date-header').textContent = 
          `${dayNames[clickedDayIndex]}, ${clickedDayNumber} de ${monthNames[clickedMonthIndex]}`;
        
        // Remove selected class from all date items
        document.querySelectorAll('.date-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add selected class to clicked item
        this.classList.add('selected');
      });
      
      dateBar.appendChild(dateItem);
    }
});

// Pop-up Methods
// Popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const subjectPopup = document.getElementById('subjectPopup');
    const subjectForm = document.getElementById('subjectForm');
    const weekdayCircles = document.querySelectorAll('.weekday-box');
    
    // Open popup
    addSubjectBtn.addEventListener('click', function() {
        subjectPopup.style.display = 'flex';
    });
    
    // Close popup
    closePopupBtn.addEventListener('click', function() {
        subjectPopup.style.display = 'none';
    });
    
    // Close popup when clicking outside
    subjectPopup.addEventListener('click', function(e) {
        if (e.target === subjectPopup) {
            subjectPopup.style.display = 'none';
        }
    });
    
    // Toggle weekday selection
    weekdayCircles.forEach(circle => {
        circle.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Form submission
    subjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected weekdays
        const selectedDays = [];
        document.querySelectorAll('.weekday-box.selected').forEach(day => {
            selectedDays.push(parseInt(day.dataset.day));
        });
        
        // Create subject object
        const subject = {
            name: document.getElementById('subjectName').value,
            weekdays: selectedDays,
            classTime: document.getElementById('classTime').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            isRequired: document.getElementById('isRequired').checked
        };
        
        console.log('Subject data:', subject);
        
        // Here you would typically save this data to your backend or localStorage
        
        // Close the popup
        subjectPopup.style.display = 'none';
        
        // Reset the form
        subjectForm.reset();
        document.querySelectorAll('.weekday-box.selected').forEach(day => {
            day.classList.remove('selected');
        });
    });
});