document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Both email and password are required.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        const res = await fetch('/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            window.location.href = '/home';

            const tokenRes = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (tokenRes.ok) {
                const { accessToken, refreshToken } = await tokenRes.json();
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                await fetch('/users/last-logged-at', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                window.location.href = '/home';
            } else {
                alert('Token generation failed.');
            }
        } else {
            alert('Invalid credentials.');
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