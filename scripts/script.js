const loginButton = document.querySelector('.login-btn');
const forgotButton = document.getElementById('forgot-password');
const signupButton = document.getElementById('signup');
const closeButton = document.querySelector('.close-btn');

loginButton.addEventListener('click', () => {
  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  window.location.href = `home.html?email=${encodeURIComponent(email)}`;
});

forgotButton.addEventListener('click', () => {
  alert('Password reset instructions will be sent to your email.');
});

signupButton.addEventListener('click', () => {
  alert('Sign up flow will open here.');
});

closeButton.addEventListener('click', () => {
  document.querySelector('.login-card').style.display = 'none';
});