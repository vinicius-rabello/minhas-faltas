document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            alert('Login successful!');
            window.location.href = '/home';

            const tokenRes = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            
            if (tokenRes.ok) {
                const { accessToken, refreshToken } = await tokenRes.json();
                localStorage.setItem('accessToken', accessToken);
                window.location.href = '/home'; // Redirect to home
            } else {
                alert('Token generation failed.');
            }
        } else {
            alert('Invalid credentials.');
        }
    });
});