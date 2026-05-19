/**
 * @file setup.js
 * @description Controls the user onboarding flow (collecting name, program department, target year, and semester).
 */

// Detect API base URL from centralized configuration
const API_BASE = window.APP_CONFIG ? window.APP_CONFIG.API_BASE : 'http://localhost:3000/api';

/** @type {Array<Object>} */
let programsList = [];

// Fetch academic program templates on page load
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

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

/**
 * Populates the primary academic programs dropdown menu.
 * Escapes program titles to neutralize dynamic XSS injection vectors.
 */
function populatePrograms() {
  if (!programSelect) return;
  programSelect.innerHTML = '<option value="">-- Select a program --</option>' + 
    programsList.map(p => `<option value="${p.programid}">${escapeHtml(p.programname)}</option>`).join('');
}

// Dependent Dropdown Handler: Populate year levels and semesters on program change
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

    // Build year options depending on program length (e.g. 4-year vs 5-year courses)
    let yearHtml = '<option value="">-- Select year level --</option>';
    for (let i = 1; i <= prog.totalyears; i++) {
      yearHtml += `<option value="${i}">Year ${i}</option>`;
    }
    yearSelect.innerHTML = yearHtml;
    yearSelect.disabled = false;

    // Build semester terms depending on semestral schedule structure
    let semHtml = '<option value="">-- Select semester --</option>';
    const semLabels = ['First Semester', 'Second Semester', 'Summer Term'];
    for (let i = 1; i <= prog.semestertype; i++) {
      semHtml += `<option value="${i}">${semLabels[i - 1]}</option>`;
    }
    semesterSelect.innerHTML = semHtml;
    semesterSelect.disabled = false;
  });
}

/**
 * Escapes HTML characters to prevent XSS payloads.
 * Delegates to centralized APP_UTILS helper when loaded.
 * @param {string} str - Raw text input
 * @returns {string} Escaped string representation
 */
function escapeHtml(str) {
  if (window.APP_UTILS && window.APP_UTILS.escapeHtml) {
    return window.APP_UTILS.escapeHtml(str);
  }
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Onboarding Submission Event Listener
if (setupButton) {
  setupButton.addEventListener('click', async () => {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : '';
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
        window.location.href = './home.html';
      } else {
        alert(data.error || 'Setup failed');
      }
    } catch (error) {
      alert('Setup failed: ' + error.message);
    }
  });
}

// Redirect trigger to return to landing page
if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}
