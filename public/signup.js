document.addEventListener('DOMContentLoaded', () => {
    auth.redirectIfAuthenticated();
    
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', handleSignup);
});

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const errorDiv = document.getElementById('error');
    
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block'; 
        return;
    }
    
    try {
        await auth.signup(email, password, name);
        window.location.href = 'login.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}
