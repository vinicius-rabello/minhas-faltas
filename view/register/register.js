document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username   = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = '/auth/login';
        } else {
            alert('Registration failed.');
        }
    });
});