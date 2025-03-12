document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !username || !password) {
            alert('All fields are required.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!validateUsername(username)) {
            alert('Username can only contain letters, spaces, accents, and tildes.');
            return;
        }

        if (!validatePassword(password)) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        const res = await fetch('/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });

        if (res.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = '/auth/login';
        } else {
            alert('Registration failed. Please try again.');
        }
    });
});

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Função para validar nome de usuário (permitindo acentos e espaços)
const validateUsername = (username) => {
    const re = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/;
    return re.test(username);
};

// Função para validar senha (mínimo 6 caracteres)
const validatePassword = (password) => {
    return password.length >= 6;
};