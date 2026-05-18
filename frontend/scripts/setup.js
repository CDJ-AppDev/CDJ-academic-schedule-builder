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


const setupButton = document.querySelector('.setup-btn');
const closeButton = document.querySelector('.close-btn');
const programSelect = document.getElementById('program-select');
const yearSelect = document.getElementById('year-select');
const semesterSelect = document.getElementById('semester-select');

if (setupButton) {
  setupButton.addEventListener('click', async () => {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    const program_id = programSelect.value.trim();
    const year_level = parseInt(yearSelect.value);
    const semester = semesterSelect.value.trim();

    if (!name || !program_id || !year_level || !semester) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please sign up again.');
        window.location.href = './signup.html';
        return;
      }

      const response = await fetch(`${API_BASE}/term`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, program_id, year_level, semester })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('termId', program_id + year_level);
        // Redirect to home page
        window.location.href = './home.html';
      } else {
        alert(data.error || 'Setup failed');
      }
    } catch (error) {
      alert('Setup failed: ' + error.message);
    }
  });
}

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}
