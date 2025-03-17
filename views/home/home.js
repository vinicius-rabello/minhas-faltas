// User authentication and profile functions
async function getUserInfo() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        window.location.href = '/auth/login';
        return null;
    }

    try {
        // Get basic user data first
        const res = await fetch('/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `BEARER ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
            return null;
        }

        const userData = await res.json();
        
        // Get detailed user profile
        const userProfileRes = await fetch(`/users/${userData.email}`, {
            method: 'GET',
            headers: {
                'Authorization': `BEARER ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userProfileRes.ok) {
            console.error('Failed to fetch user profile');
            return userData; // Return basic data if profile fetch fails
        }

        const userProfile = await userProfileRes.json();
        return Array.isArray(userProfile) ? userProfile[0] : userProfile;
    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        return null;
    }
}

// Welcolme Section
document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome');
    const logoutButton = document.getElementById('logoutButton');

    const user = await getUserInfo();

    if (user) {
        welcomeMessage.textContent = `Olá, ${user.username}!`;
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
    subjectForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Get user email
            const user = await getUserInfo();
            if (!user || !user.email) {
                alert('Authentication error. Please log in again.');
                window.location.href = '/auth/login';
                return;
            }
            
            // Get selected weekdays
            const selectedDays = [];
            document.querySelectorAll('.weekday-box.selected').forEach(day => {
                selectedDays.push(parseInt(day.dataset.day));
            });
            
            // Validate form data
            const subjectName = document.getElementById('subjectName').value;
            const classTime = document.getElementById('classTime').value;
            
            if (!subjectName) {
                alert('Subject name is required.');
                return;
            }
            
            if (selectedDays.length === 0) {
                alert('Please select at least one weekday.');
                return;
            }
            
            if (!classTime) {
                alert('Class time is required.');
                return;
            }
            
            // Create subject object
            const subject = {
                userEmail: user.email,
                subjectName: subjectName,
                weekdays: selectedDays,
                classTime: classTime,
                isRequired: document.getElementById('isRequired').checked
            };
            
            // Show loading indicator or disable submit button
            const submitButton = document.querySelector('.submit-btn');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Saving...';
            submitButton.disabled = true;
            
            const res = await fetch('/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subject)
            });
            
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            
            if (res.ok) {
                // Success scenario
                const responseData = await res.json();
                console.log('Subject created:', responseData);
                
                // Close the popup
                document.getElementById('subjectPopup').style.display = 'none';
                
                // Reset the form
                subjectForm.reset();
                document.querySelectorAll('.weekday-box.selected').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Show success message
                alert('Subject was created successfully!');
                
                // Optionally, refresh the subjects list or add to UI
                // refreshSubjectsList();
            } else {
                // Error handling based on status code
                const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred' }));
                
                if (res.status === 400) {
                    alert(`Validation error: ${errorData.message}`);
                } else if (res.status === 401 || res.status === 403) {
                    alert('Authentication error. Please log in again.');
                    window.location.href = '/auth/login';
                } else if (res.status === 409) {
                    alert('This subject already exists.');
                } else {
                    alert(`Error creating subject: ${errorData.message}`);
                }
                console.error('Error creating subject:', errorData);
            }
        } catch (error) {
            console.error('Client-side error:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
});