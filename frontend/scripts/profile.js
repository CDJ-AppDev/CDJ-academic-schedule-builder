if (typeof API_BASE === 'undefined') {
  window.API_BASE = (() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    const port = window.location.port ? ':' + window.location.port : '';
    return `${protocol}//${hostname}${port}/api`;
  })();
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
});

// Cache variables
let programsList = [];

// DOM References - Profile Left Column
const usernameInput = document.getElementById('profile-username');
const emailInput = document.getElementById('profile-email');
const passwordInput = document.getElementById('profile-password');
const editUsernameBtn = document.getElementById('edit-btn-username');
const editEmailBtn = document.getElementById('edit-btn-email');
const editPasswordBtn = document.getElementById('edit-btn-password');

// DOM References - Academic Right Column
const programSelect = document.getElementById('program-select');
const yearSelect = document.getElementById('year-select');
const semesterSelect = document.getElementById('semester-select');
const applyBtn = document.getElementById('apply-courses-btn');
const selectedCoursesDisplay = document.getElementById('selected-courses');
const schedulePickerBtn = document.getElementById('schedule-picker-btn');

// ----------------- PART 1: PROFILE INFORMATION EDITING -----------------

async function handleFieldToggle(input, button, fieldName) {
  if (input.disabled) {
    // Enable for editing
    input.disabled = false;
    input.focus();
    button.classList.add('editing');
  } else {
    // Save to server
    const value = input.value.trim();
    if (!value && fieldName !== 'password') {
      alert(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot be empty.`);
      return;
    }
    
    const body = {};
    body[fieldName] = value;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      let resData = {};
      try {
        resData = await response.json();
      } catch (jsonErr) {
        console.error('Error parsing JSON response:', jsonErr);
        let errText = 'An unexpected server error occurred.';
        try {
          const rawText = await response.text();
          if (rawText && rawText.length < 150) {
            errText = rawText;
          }
        } catch (_) {}
        alert('Server Error: ' + errText);
        return;
      }
      
      if (!response.ok) {
        alert(resData.error || 'Failed to update profile detail.');
        return;
      }
      
      alert(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
      
      // Update local storage if username/email changed
      if (fieldName === 'username') {
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        userObj.username = value;
        userObj.name = value;
        localStorage.setItem('user', JSON.stringify(userObj));

        // Refresh navbar username display immediately
        if (typeof populateHeaderUsername === 'function') {
          populateHeaderUsername(userObj);
        }
      }
      
      input.disabled = true;
      button.classList.remove('editing');
    } catch (err) {
      console.error(err);
      alert('Error updating profile detail: ' + err.message);
    }
  }
}

if (editUsernameBtn && usernameInput) {
  editUsernameBtn.addEventListener('click', () => handleFieldToggle(usernameInput, editUsernameBtn, 'username'));
}
if (editEmailBtn && emailInput) {
  editEmailBtn.addEventListener('click', () => handleFieldToggle(emailInput, editEmailBtn, 'email'));
}
if (editPasswordBtn && passwordInput) {
  editPasswordBtn.addEventListener('click', () => handleFieldToggle(passwordInput, editPasswordBtn, 'password'));
}

// Toggle password visibility (Show/Hide)
const togglePasswordVisibilityBtn = document.getElementById('toggle-password-visibility-btn');
const eyeIcon = document.getElementById('eye-icon');

if (togglePasswordVisibilityBtn && passwordInput && eyeIcon) {
  togglePasswordVisibilityBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      // Change SVG icon to Eye Off (Slashed Eye)
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M21 21l-3.562-3.562M21 21L3 3m18 18l-3.562-3.562M18 17.562A9.96 9.96 0 0112 19.5c-4.638 0-8.573-3.007-9.963-7.178a1.883 1.883 0 010-.639 9.878 9.878 0 014.28-5.385m10.12 10.12a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
      `;
      togglePasswordVisibilityBtn.style.opacity = '1';
    } else {
      passwordInput.type = 'password';
      // Restore standard Eye Icon
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      `;
      togglePasswordVisibilityBtn.style.opacity = '0.6';
    }
  });
}

// ----------------- PART 2: SERVER SAVE & LOAD -----------------

async function saveToServer(program_id, year_level, semester) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. User may not be logged in.');
      return false;
    }

    console.log('saveToServer - Saving to server:', { program_id, year_level, semester });

    const response = await fetch(`${API_BASE}/term`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        program_id,
        year_level,
        semester
      })
    });

    const data = await response.json();
    console.log('saveToServer - Response:', data, 'Status:', response.status);

    if (!response.ok) {
      console.error('Failed to save term to server:', data);
      alert('Failed to save term selection: ' + (data.error || 'Unknown error'));
      return false;
    }

    localStorage.setItem('termId', data.term_id);
    console.log('saveToServer - Term saved successfully:', data);
    return true;
  } catch (err) {
    console.error('saveToServer - Server request error:', err);
    alert('Error saving program: ' + err.message);
    return false;
  }
}

async function loadFromServer() {
  try {
    const token = localStorage.getItem('token');
    console.log('loadFromServer - Token exists:', !!token);
    if (!token) return null;

    const response = await fetch(`${API_BASE}/term`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('loadFromServer - Response status:', response.status);
    if (!response.ok) {
      console.error('loadFromServer - Response not OK:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('loadFromServer - Data received:', data);

    // server returns null if no row found
    if (!data) {
      console.log('loadFromServer - No term data found for user');
      return null;
    }

    localStorage.setItem('termId', data.term_id);

    return {
      course: data.program_id,
      year: String(data.year_level),
      semester: String(data.semester),
      req_units: data.req_units
    };

  } catch (err) {
    console.error('Error loading from server:', err);
    return null;
  }
}

function saveToLocalStorage(course, year, semester) {
  const data = { course, year, semester };
  localStorage.setItem('courseSelection', JSON.stringify(data));
}

// ----------------- PART 3: DROPDOWN SELECTORS IMPLEMENTATION -----------------

function updateDropdownOptions(progId) {
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
}

// ---------------- UI UPDATE ----------------

function applySelectionToUI(course, year, semester) {
  console.log('applySelectionToUI called with:', { course, year, semester });

  if (programSelect) programSelect.value = course;
  updateDropdownOptions(course);
  if (yearSelect) yearSelect.value = year;
  if (semesterSelect) semesterSelect.value = semester;

  const ord = ['st', 'nd', 'rd', 'th'];
  const prog = programsList.find(p => p.programid === course);
  const courseLabel = prog ? prog.programname : course;

  const yearNum = parseInt(year);
  const semNum = parseInt(semester);
  const yearLabel = `${yearNum}${ord[yearNum - 1] || 'th'} Year`;

  const semLabels = ['First Semester', 'Second Semester', 'Summer Term'];
  const semesterLabel = semLabels[semNum - 1] || `${semNum} Semester`;

  const displayText = `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;

  console.log('Setting display text to:', displayText);
  selectedCoursesDisplay.textContent = displayText;
  schedulePickerBtn.removeAttribute('hidden');

  // URL normalization (keeps backward compatibility)
  window.history.replaceState(
    {},
    document.title,
    `profile.html?course=${course}&year=${year}&semester=${semester}`
  );
}

// ---------------- APPLY BUTTON ----------------

applyBtn.addEventListener('click', async () => {
  const course = programSelect.value;
  const year = yearSelect.value;
  const semester = semesterSelect.value;

  if (!course || !year || !semester) {
    alert('Please select a program, year level, and semester.');
    return;
  }

  saveToLocalStorage(course, year, semester);

  // Wait for server save to complete (convert to integers for backend)
  const saved = await saveToServer(course, parseInt(year), parseInt(semester));

  if (saved) {
    // Load the term data to get req_units
    const termData = await loadFromServer();
    if (termData && termData.req_units) {
      localStorage.setItem('reqUnits', termData.req_units);
    }
    applySelectionToUI(course, year, semester);
  }
});

// ---------------- SERVER-FIRST PAGE LOAD ----------------

window.addEventListener('load', async () => {
  let course, year, semester;

  // 1. Fetch user session to pre-fill profile fields
  try {
    const token = localStorage.getItem('token');
    const userRes = await fetch(`${API_BASE}/user-session`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      if (usernameInput) usernameInput.value = userData.name || '';
      if (emailInput) emailInput.value = userData.email || '';
      if (passwordInput) passwordInput.value = userData.password || '';
    }
  } catch (error) {
    console.error('Error pre-filling profile fields:', error);
  }

  // 2. Fetch programs list
  try {
    const response = await fetch(`${API_BASE}/programs`);
    if (response.ok) {
      programsList = await response.json();
      if (programSelect) {
        programSelect.innerHTML = '<option value="">-- Select a program --</option>' +
          programsList.map(p => `<option value="${p.programid}">${p.programname}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
  }

  if (programSelect) {
    programSelect.addEventListener('change', () => {
      updateDropdownOptions(programSelect.value);
    });
  }

  console.log('Profile page loading...');

  // 3. Try server FIRST
  const serverData = await loadFromServer();
  console.log('Server data:', serverData);
  if (serverData) {
    course = serverData.course;
    year = serverData.year;
    semester = serverData.semester;
    // Store required units from server
    if (serverData.req_units) {
      localStorage.setItem('reqUnits', serverData.req_units);
    }
  }

  // 4. If no server data → try localStorage
  if (!course || !year || !semester) {
    const savedData = localStorage.getItem('courseSelection');
    console.log('LocalStorage data:', savedData);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (!course) course = data.course;
        if (!year) year = data.year;
        if (!semester) semester = data.semester;
      } catch (err) {
        console.error('LocalStorage parse error:', err);
      }
    }
  }

  // 5. If still nothing → try URL parameters
  if (!course || !year || !semester) {
    const params = new URLSearchParams(window.location.search);
    const urlCourse = params.get('course');
    const urlYear = params.get('year');
    const urlSemester = params.get('semester');
    console.log('URL params:', { course: urlCourse, year: urlYear, semester: urlSemester });
    if (!course) course = urlCourse;
    if (!year) year = urlYear;
    if (!semester) semester = urlSemester;
  }

  // 6. Apply UI if any data found
  console.log('Final selection to apply:', { course, year, semester });
  if (course && year && semester) {
    applySelectionToUI(course, year, semester);
  } else {
    console.warn('Could not load complete selection data. Course:', course, 'Year:', year, 'Semester:', semester);
  }
});
