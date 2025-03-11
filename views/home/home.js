document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('accessToken'); // Get the token from localStorage
    const welcomeMessage = document.getElementById('welcome');
    const logoutButton = document.getElementById('logoutButton');

    if (!token) {
        window.location.href = '/auth/login'; // Redirect to login if no token
        return;
    }

    try {
        // Send token in Authorization header to validate it
        const res = await fetch('/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `BEARER ${token}`, // Send the token in the Authorization header
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const user = await res.json(); // Assuming the response contains user data
            welcomeMessage.textContent = `Hello, ${user.name}!`; // Display username in the home page
        } else {
            // If the token is invalid, clear it and redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('accessToken'); // Clear token on error
        window.location.href = '/auth/login'; // Redirect to login
    }

    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken'); // Clear the access token
        window.location.href = '/auth/login'; // Redirect to the login page
    });
});