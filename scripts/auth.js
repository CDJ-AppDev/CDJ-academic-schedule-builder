const API_BASE = 'http://localhost:3000/api';

const loginButton = document.querySelector('.login-btn');
const forgotButton = document.getElementById('forgot-password');
const signupButton = document.getElementById('signup');
const closeButton = document.querySelector('.close-btn');

if (loginButton) {
  loginButton.addEventListener('click', async () => {
    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document.querySelector('input[type="password"]').value.trim();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = `pages/home.html`;
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Login failed');
    }
  });
}

if (signupButton) {
  signupButton.addEventListener('click', async () => {
    const name = prompt('Enter your name:');
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');

    if (!name || !email || !password) return;

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Signup successful! Please login.');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Signup failed');
    }
  });
} if (closeButton) {
  closeButton.addEventListener('click', () => {
    document.querySelector('.login-card').style.display = 'none';
  });
}