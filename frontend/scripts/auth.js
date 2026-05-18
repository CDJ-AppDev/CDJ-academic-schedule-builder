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

// URL-based token propagation helper for file:// protocols crossing directory sandboxes
function getToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('token', urlToken);
    const urlUser = urlParams.get('user');
    if (urlUser) {
      try {
        localStorage.setItem('user', decodeURIComponent(urlUser));
      } catch (e) { }
    }
    return urlToken;
  }
  return localStorage.getItem('token');
}

function redirectWithToken(targetUrl) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (window.location.protocol === 'file:' && token) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const params = `token=${encodeURIComponent(token)}` + (user ? `&user=${encodeURIComponent(user)}` : '');
    window.location.href = targetUrl + separator + params;
  } else {
    window.location.href = targetUrl;
  }
}
window.redirectWithToken = redirectWithToken;

// Inject Admin Dashboard button in navbar if they are a promoted Admin
function injectAdminNavbarButton() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.access === 'Admin') {
        const nav = document.querySelector('.app-nav');
        if (nav && !document.getElementById('nav-admin-btn')) {
          const adminBtn = document.createElement('button');
          adminBtn.id = 'nav-admin-btn';
          adminBtn.className = 'nav-button';
          adminBtn.style.backgroundColor = '#00cc66'; // Premium styling
          adminBtn.style.color = '#fff';
          adminBtn.style.fontWeight = 'bold';
          adminBtn.textContent = 'Admin Dashboard';
          adminBtn.onclick = () => {
            const isInsidePages = window.location.pathname.includes('/pages/');
            redirectWithToken(isInsidePages ? '../private/admin.html' : './private/admin.html');
          };
          nav.appendChild(adminBtn);
        }
      }
    } catch (e) {
      console.error('Error rendering admin navbar button:', e);
    }
  }
}

// Autologin Route Guard: Catch already logged-in users/admins and redirect immediately
async function initAuth() {
  const token = getToken();
  const userStr = localStorage.getItem('user');

  if (token) {
    // 1. Fetch real-time user session status from backend to keep it perfectly sync'd!
    try {
      const response = await fetch(`${API_BASE}/user-session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const freshUser = await response.json();
        localStorage.setItem('user', JSON.stringify(freshUser));

        // 2. Redirect check
        const pathname = window.location.pathname;
        const isLandingOrAuth = pathname.endsWith('/') || pathname.includes('index.html') || pathname.includes('login.html') || pathname.includes('signup.html');

        if (isLandingOrAuth) {
          if (freshUser.email === 'admin@gmail.com') {
            // Super Admin always goes to Admin Dashboard
            redirectWithToken('../private/admin.html');
          } else {
            // Regular user/promoted admin goes to Home
            redirectWithToken('./home.html');
          }
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          // If 404 or other server error, fallback to existing local storage session
          console.warn('user-session endpoint not found or error, falling back to local session cache.');
          fallbackAutologinRedirect();
        }
      }
    } catch (e) {
      console.error('Error syncing user session:', e);
      fallbackAutologinRedirect();
    }
  }

  // 3. Inject Admin Dashboard button in navbar if they are a promoted Admin
  injectAdminNavbarButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

function fallbackAutologinRedirect() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const pathname = window.location.pathname;
      const isLandingOrAuth = pathname.endsWith('/') || pathname.includes('index.html') || pathname.includes('login.html') || pathname.includes('signup.html');

      if (isLandingOrAuth) {
        if (user.email === 'admin@gmail.com') {
          redirectWithToken('../private/admin.html');
        } else {
          redirectWithToken('./home.html');
        }
      }
    } catch (e) { }
  }
}

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
        if (data.user && data.user.access === 'Admin') {
          redirectWithToken('../private/admin.html');
        } else {
          redirectWithToken(`./home.html`);
        }
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
        redirectWithToken(`./setup.html`);
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
