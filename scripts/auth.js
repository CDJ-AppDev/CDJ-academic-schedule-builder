const API_BASE = 'http://localhost:3000/api';

const loginButton = document.querySelector('.login-btn');
const signupButton = document.querySelector('.signup-btn');
const forgotButton = document.getElementById('forgot-password');
const signupLinkButton = document.getElementById('signup');
const loginLinkButton = document.getElementById('login');
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
  signupButton.addEventListener('click', () => {
    const name = document.querySelector('input[type="text"]').value.trim();
    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document.querySelectorAll('input[type="password"]')[0].value.trim();
    const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value.trim();

    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // For now, redirect to home page with email parameter
    // In a real app, this would make an API call to register the user
    window.location.href = `./home.html?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
  });
}

if (forgotButton) {
  forgotButton.addEventListener('click', () => {
    alert('Password reset instructions will be sent to your email.');
  });
}

if (signupLinkButton) {
  signupLinkButton.addEventListener('click', () => {
    window.location.href = './signup.html';
  });
}

if (loginLinkButton) {
  loginLinkButton.addEventListener('click', () => {
    window.location.href = './login.html';
  });
}

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}
