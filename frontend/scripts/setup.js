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

let programsList = [];

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Fetch programs list
  try {
    const response = await fetch(`${API_BASE}/programs`);
    if (response.ok) {
      programsList = await response.json();
      populatePrograms();
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
  }
});

const setupButton = document.querySelector('.setup-btn');
const closeButton = document.querySelector('.close-btn');
const programSelect = document.getElementById('program-select');
const yearSelect = document.getElementById('year-select');
const semesterSelect = document.getElementById('semester-select');

function populatePrograms() {
  if (!programSelect) return;
  programSelect.innerHTML = '<option value="">-- Select a program --</option>' + 
    programsList.map(p => `<option value="${p.programid}">${escapeHtml(p.programname)}</option>`).join('');
}

if (programSelect) {
  programSelect.addEventListener('change', () => {
    const progId = programSelect.value;
    if (!progId) {
      yearSelect.innerHTML = '<option value="">-- Select year level --</option>';
      yearSelect.disabled = true;
      semesterSelect.innerHTML = '<option value="">-- Select semester --</option>';
      semesterSelect.disabled = true;
      return;
    }

    const prog = programsList.find(p => p.programid === progId);
    if (!prog) return;

    // Populate Year Levels
    let yearHtml = '<option value="">-- Select year level --</option>';
    for (let i = 1; i <= prog.totalyears; i++) {
      yearHtml += `<option value="${i}">Year ${i}</option>`;
    }
    yearSelect.innerHTML = yearHtml;
    yearSelect.disabled = false;

    // Populate Semesters
    let semHtml = '<option value="">-- Select semester --</option>';
    const semLabels = ['First Semester', 'Second Semester', 'Summer Term'];
    for (let i = 1; i <= prog.semestertype; i++) {
      semHtml += `<option value="${i}">${semLabels[i - 1]}</option>`;
    }
    semesterSelect.innerHTML = semHtml;
    semesterSelect.disabled = false;
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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
        localStorage.setItem('termId', data.term_id);
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
