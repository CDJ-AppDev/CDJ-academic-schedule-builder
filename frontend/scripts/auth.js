/**
 * @file auth.js
 * @description Manages user authentication, route guards, token extraction, navigation updates, and login/signup flows.
 */

// Detect API base URL from centralized configuration
const API_BASE = window.APP_CONFIG ? window.APP_CONFIG.API_BASE : 'http://localhost:3000/api';

/**
 * Retrieves the session token from either URL search parameters or standard local storage.
 * URL-based extraction is required for dynamic protocol sandboxing (e.g. file:// protocols crossing directory scopes).
 * @returns {string|null} The current session token
 */
function getToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('token', urlToken);
    const urlUser = urlParams.get('user');
    if (urlUser) {
      try {
        localStorage.setItem('user', decodeURIComponent(urlUser));
      } catch (e) {
        console.error('Failed to parse cached user data from URL parameters:', e);
      }
    }
    return urlToken;
  }
  return localStorage.getItem('token');
}

/**
 * Redirects to a target page while propagating security tokens if running under local sandboxed file protocols.
 * @param {string} targetUrl - Target path of the page to redirect to
 */
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

/**
 * Computes the relative file path to the secure admin page.
 * Detects if the current document is inside pages directory or root directory.
 * @returns {string} Relative path to admin.html
 */
function getAdminPath() {
  const pathname = window.location.pathname;
  if (pathname.includes('/pages/')) {
    return '../private/admin.html';
  }
  return './private/admin.html';
}

/**
 * Dynamic Navbar Modifier.
 * Inspects user credentials and injects the 'Admin' navigation panel button if they possess admin access roles.
 */
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
          adminBtn.style.backgroundColor = '#00cc66'; // Distinct green theme for Admin Portal
          adminBtn.style.color = '#fff';
          adminBtn.innerHTML = '<img src="../assets/admin.png" alt="Admin" class="nav-icon"> Admin';
          adminBtn.onclick = () => {
            const isInsidePages = window.location.pathname.includes('/pages/');
            const isAlreadyAtAdmin = window.location.pathname.includes('/private/') && window.location.pathname.includes('admin.html');
            if (isAlreadyAtAdmin) {
              return;
            }
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

/**
 * Core Authentication Guard.
 * Evaluated on page initialization:
 * 1. Synchronizes token status with backend real-time database schema.
 * 2. Diverts authenticated users from authentication landing screens to proper home screens.
 * 3. Injects custom navigational buttons for admins.
 * 4. Limits UI administrative settings access if matching standard super admin accounts.
 */
async function initAuth() {
  const token = getToken();

  if (token) {
    try {
      // Keep local session status completely synchronized with real-time backend updates
      const response = await fetch(`${API_BASE}/user-session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const freshUser = await response.json();
        localStorage.setItem('user', JSON.stringify(freshUser));

        const pathname = window.location.pathname;
        const isLandingOrAuth = pathname.endsWith('/') || pathname.includes('index.html') || pathname.includes('login.html') || pathname.includes('signup.html');

        if (isLandingOrAuth) {
          if (freshUser.email === 'admin@gmail.com') {
            redirectWithToken(getAdminPath());
          } else {
            redirectWithToken('./home.html');
          }
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          console.warn('Backend session check error. Falling back to local offline session cache.');
          fallbackAutologinRedirect();
        }
      }
    } catch (e) {
      console.error('Error syncing user session:', e);
      fallbackAutologinRedirect();
    }
  }

  // Inject panel navigation hooks
  injectAdminNavbarButton();

  // Populate navigation bar metadata
  const currentUserStr = localStorage.getItem('user');
  if (currentUserStr) {
    try {
      const u = JSON.parse(currentUserStr);
      populateHeaderUsername(u);
    } catch (e) {
      console.error('Error loading current user details for headers:', e);
    }
  }
}

/**
 * Formats and inserts the username in the upper-right navigational header panel.
 * Safeguards layout bounds by truncating names exceeding character limits.
 * Additionally disables edit privileges for standard super admin accounts.
 * @param {Object} user - User metadata object
 */
function populateHeaderUsername(user) {
  const display = document.getElementById('header-username-display');
  if (display && user) {
    const rawName = user.username || user.name || user.email || 'User';
    display.textContent = rawName.length > 16 ? rawName.slice(0, 16) + '…' : rawName;
    display.title = rawName;
  }

  // Hard security: Disable profile edits on the super admin account
  if (user && user.email === 'admin@gmail.com') {
    const settingsBtn = document.querySelector('.header-controls .header-icon-btn[onclick*="profile.html"]');
    if (settingsBtn) {
      settingsBtn.disabled = true;
      settingsBtn.style.opacity = '0.5';
      settingsBtn.style.cursor = 'not-allowed';
      settingsBtn.removeAttribute('onclick');
    }
  }
}

// Attach lifecycle events
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

/**
 * Fallback Route Guard.
 * Executed if the backend server is temporarily offline. Prevents page hanging by using cached local user state.
 */
function fallbackAutologinRedirect() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const pathname = window.location.pathname;
      const isLandingOrAuth = pathname.endsWith('/') || pathname.includes('index.html') || pathname.includes('login.html') || pathname.includes('signup.html');

      if (isLandingOrAuth) {
        if (user.email === 'admin@gmail.com') {
          redirectWithToken(getAdminPath());
        } else {
          redirectWithToken('./home.html');
        }
      }
    } catch (e) {
      console.error('Offline fallback redirection parsing error:', e);
    }
  }
}

// -------------------------------------------------------------
// USER ACCESS EVENT INTERFACES
// -------------------------------------------------------------

const loginButton = document.querySelector('.login-btn');
const signupButton = document.querySelector('.signup-btn');
const forgotButton = document.getElementById('forgot-password');
const signupLinkButton = document.getElementById('signup');
const loginLinkButton = document.getElementById('login');
const closeButton = document.querySelector('.close-btn');

// Login Event Trigger
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
          redirectWithToken(getAdminPath());
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

// Signup Event Trigger
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

      // Automatically trigger backend login routine on successful registration
      const loginResponse = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        redirectWithToken(`./setup.html`);
      } else {
        alert(loginData.error || 'Login verification failed post-signup');
      }
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  });
}

// Password Reset Prompt
if (forgotButton) {
  forgotButton.addEventListener('click', () => {
    alert('Password reset instructions will be sent to your email.');
  });
}

// Redirections between Login and Signup screens
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

// Redirections to main splash page
if (closeButton) {
  if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
    closeButton.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
}
