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

async function loadSubjectsForDay(weekday) {
    const taskContainer = document.querySelector('.task-container');
    taskContainer.innerHTML = '<p>Loading...</p>'; // Indicador de carregamento

    try {
        // Obter informações do usuário
        const user = await getUserInfo();
        if (!user || !user.email) {
            alert('Authentication error. Please log in again.');
            window.location.href = '/auth/login';
            return;
        }

        // Fazer requisição ao endpoint
        const res = await fetch(`/subjects/${user.email}/${weekday}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            taskContainer.innerHTML = '<p>Você não possui nenhuma aula hoje!</p>';
            return;
        }

        const subjects = await res.json();
        taskContainer.innerHTML = ''; // Limpar antes de inserir novos dados

        if (subjects.length === 0) {
            taskContainer.innerHTML = '<p>Você não possui nenhuma aula hoje!.</p>';
            return;
        }

        // Inserir cada matéria na task-container
        subjects.forEach(subject => {
            const subjectName = subject.subject_name;
            const classTime = subject.class_time.substring(0, 5);
            const subjectElement = document.createElement('div');
            subjectElement.className = 'task-item';
            
            // Create left side container for subject name and time
            const infoContainer = document.createElement('div');
            infoContainer.className = 'subject-info';
            
            // Add subject name and class time
            const nameElement = document.createElement('h4');
            nameElement.textContent = subjectName;
            nameElement.className = 'subject-name';
            
            const timeElement = document.createElement('p');
            timeElement.textContent = classTime;
            timeElement.className = 'subject-time';
            
            infoContainer.appendChild(nameElement);
            infoContainer.appendChild(timeElement);
            
            // Create checkbox that cycles between states
            const checkbox = document.createElement('div');
            checkbox.className = 'attendance-status';
            checkbox.innerHTML = '<span class="checkbox-empty">□</span>'; // Initial state: class didn't happen (blank circle)
            
            // Add cycling functionality
            let status = 0; // 0: didn't happen, 1: attended, 2: missed
            checkbox.addEventListener('click', () => {
                status = (status + 1) % 3;
                checkbox.classList.remove('status-none', 'status-attended', 'status-missed');
                
                if (status === 0) {
                    checkbox.innerHTML = '<span class="checkbox-empty">□</span>'; // Class didn't happen (blank circle)
                    checkbox.classList.add('status-none');
                } else if (status === 1) {
                    checkbox.innerHTML = '<span class="checkbox-checked">☑</span>'; // Attended (green check)
                    checkbox.classList.add('status-attended');
                } else {
                    checkbox.innerHTML = 'x'; // Missed (red x)
                    checkbox.classList.add('status-missed');
                }
            });
            
            // Append everything to the subject element
            subjectElement.appendChild(infoContainer);
            subjectElement.appendChild(checkbox);
            
            taskContainer.appendChild(subjectElement);
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
        taskContainer.innerHTML = '<p>Error loading tasks.</p>';
    }
}

// Welcome Section
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
        loadSubjectsForDay(dayIndex);
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

        loadSubjectsForDay(clickedDayIndex);
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
                // Close the popup
                document.getElementById('subjectPopup').style.display = 'none';

                // Get the currently selected day index
                const selectedDateItem = document.querySelector('.date-item.selected');
                const currentDayIndex = parseInt(selectedDateItem.dataset.dayIndex);

                // Reload subjects for the current day
                loadSubjectsForDay(currentDayIndex);
                
                // Reset the form
                subjectForm.reset();
                document.querySelectorAll('.weekday-box.selected').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Show success message
                alert('Subject was created successfully!');
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