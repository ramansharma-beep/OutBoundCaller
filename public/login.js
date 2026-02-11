document.addEventListener('DOMContentLoaded', () => {
    auth.redirectIfAuthenticated();
    
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    
    try {

        await auth.login(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}
