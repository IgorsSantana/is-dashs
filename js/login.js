// Gerenciamento de login

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// Inicializar usuários padrão
initializeDefaultUsers();

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validar campos
    if (!username || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    // Validar login
    const result = validateLogin(username, password);
    
    if (!result.success) {
        showError(result.message);
        return;
    }
    
    // Salvar sessão
    const session = {
        id: result.user.id,
        username: result.user.username,
        company: result.user.company,
        department: result.user.department,
        isAdmin: result.user.isAdmin,
        isAdminTI: result.user.isAdminTI,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('session', JSON.stringify(session));
    
    // Redirecionar para dashboard
    window.location.href = 'dashboard.html';
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

// Verificar se já está logado
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('session');
    if (session) {
        // Se já está logado, redirecionar para dashboard
        window.location.href = 'dashboard.html';
    }
});
