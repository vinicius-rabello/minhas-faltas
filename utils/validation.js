// Função para validar e-mail
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

module.exports = { validateEmail, validateUsername, validatePassword };