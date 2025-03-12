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
                welcomeMessage.textContent = `Hello, ${user.username}!`;
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