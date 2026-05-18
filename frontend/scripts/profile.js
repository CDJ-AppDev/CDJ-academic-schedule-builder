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

// Course, Year, and Semester Picker Functionality - Single Selection Only
const courseRadios = document.getElementsByName('course-picker');
const yearRadios = document.getElementsByName('year-picker');
const semesterRadios = document.getElementsByName('semester-picker');
const applyBtn = document.getElementById('apply-courses-btn');
const selectedCoursesDisplay = document.getElementById('selected-courses');
const schedulePickerBtn = document.getElementById('schedule-picker-btn');

// ---------------- SERVER SAVE ----------------

async function saveToServer(program_id, year_level, semester) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. User may not be logged in.');
      return;
    }

    console.log('Saving to server:', { program_id, year_level, semester });

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
    
    if (!response.ok) {
      console.error('Failed to save term to server:', data);
      alert('Failed to save term selection: ' + (data.error || 'Unknown error'));
      return false;
    }
    
    localStorage.setItem('termId', program_id + year_level);
    console.log('Term saved successfully:', data);
    return true;
  } catch (err) {
    console.error('Server request error:', err);
    alert('Error saving program: ' + err.message);
    return false;
  }
}

// ---------------- SERVER LOAD ----------------

async function loadFromServer() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_BASE}/term`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();

    // server returns null if no row found
    if (!data) return null;

    localStorage.setItem('termId', data.program_id + data.year_level);

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

// ---------------- LOCAL SAVE ----------------

function saveToLocalStorage(course, year, semester) {
  const data = { course, year, semester };
  localStorage.setItem('courseSelection', JSON.stringify(data));
}

// ---------------- UI UPDATE ----------------

function applySelectionToUI(course, year, semester) {
  const courseRadio = Array.from(courseRadios).find(r => r.value === course);
  const yearRadio = Array.from(yearRadios).find(r => r.value === year);
  const semesterRadio = Array.from(semesterRadios).find(r => r.value === semester);

  if (courseRadio) courseRadio.checked = true;
  if (yearRadio) yearRadio.checked = true;
  if (semesterRadio) semesterRadio.checked = true;
const ord = ['st', 'nd', 'rd', 'th'];
  const courseLabel = 
    course === 'CS' ? 'Computer Science' : 'Information Technology';
  const yearLabel = `${year}${ord[year - 1]} Year`;
  const semesterLabel = `${semester}${ord[semester - 1]} Semester`;
  selectedCoursesDisplay.textContent =
    `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;
  schedulePickerBtn.removeAttribute('hidden');
  // URL normalization (keeps backward compatibility)
  const courseForUrl = course;
  window.history.replaceState(
    {},
    document.title,
    `coursepicker.html?course=${courseForUrl}&year=${year}&semester=${semester}`
  );
}

// ---------------- APPLY BUTTON ----------------

applyBtn.addEventListener('click', async () => {
  const selectedCourse = Array.from(courseRadios).find(r => r.checked);
  const selectedYear = Array.from(yearRadios).find(r => r.checked);
  const selectedSemester = Array.from(semesterRadios).find(r => r.checked);

  if (!selectedCourse || !selectedYear || !selectedSemester) return;

  const course = selectedCourse.value;
  const year = selectedYear.value;
  const semester = selectedSemester.value;

  saveToLocalStorage(course, year, semester);
  
// Wait for server save to complete
  const saved = await saveToServer(course, year, semester);
  
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

// 1. Try server FIRST
  const serverData = await loadFromServer();
  if (serverData) {
    course = serverData.course;
    year = serverData.year;
    semester = serverData.semester;
    // Store required units from server
    if (serverData.req_units) {
      localStorage.setItem('reqUnits', serverData.req_units);
    }
  }

  // 2. If no server data → try localStorage
  if (!course || !year || !semester) {
    const savedData = localStorage.getItem('courseSelection');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        course = data.course;
        year = data.year;
        semester = data.semester;
      } catch (err) {
        console.error('LocalStorage parse error:', err);
      }
    }
  }

  // 3. If still nothing → try URL parameters
  if (!course || !year || !semester) {
    const params = new URLSearchParams(window.location.search);
    course = params.get('course');
    year = params.get('year');
    semester = params.get('semester');
  }

  // 4. Apply UI if any data found
  if (course && year && semester) {
    applySelectionToUI(course, year, semester);
  }
});
