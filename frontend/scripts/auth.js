// Detect API base URL based on environment
const API_BASE = (() => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // In Kubernetes/production, use same hostname with /api path
  const port = window.location.port ? ':' + window.location.port : '';
  return `${protocol}//${hostname}${port}/api`;
})();

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
        window.location.href = `./home.html`;
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
    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document.querySelectorAll('input[type="password"]')[0].value.trim();
    const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value.trim();

    if (!email || !password || !confirmPassword) {
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

    try {
      // Call signup endpoint
      const signupResponse = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const signupData = await signupResponse.json();
      
      if (!signupResponse.ok) {
        alert(signupData.error || 'Signup failed');
        return;
      }

      // Auto-login to get token
      const loginResponse = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        // Store user info and token
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        // Redirect to setup page
        window.location.href = `./setup.html`;
      } else {
        alert(loginData.error || 'Login failed');
      }
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
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
