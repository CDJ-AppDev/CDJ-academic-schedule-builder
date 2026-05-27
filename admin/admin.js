// Admin portal relies on shared auth helpers from `frontend/scripts/auth.js`:
// - getToken()
// - redirectWithToken()
// - API_BASE
// Keeping these centralized avoids divergence between admin and non-admin flows.

// Route guard: check for token and sync user session on load
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (!token || token === 'null' || token === 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    redirectWithToken('../pages/login.html');
    return;
  }

  // Fetch fresh user session info in real-time
  try {
    const response = await fetch(`${API_BASE}/user-session`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const freshUser = await response.json();
      localStorage.setItem('user', JSON.stringify(freshUser));

      // Only show the navbar if NOT the super admin (admin@gmail.com)
      if (freshUser.email !== 'admin@gmail.com') {
        const navbar = document.getElementById('admin-navbar');
        if (navbar) {
          navbar.style.display = 'flex';
        }
      }
    } else {
      // ONLY redirect if the server explicitly tells us the token is invalid (401 or 403)
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        redirectWithToken('../pages/login.html');
        return;
      }
      // If it's a 404 or other server error, just fallback to localStorage/URL user!
      console.warn('user-session endpoint not found or error, falling back to local session cache.');
      fallbackNavbarToggle();
    }
  } catch (e) {
    console.error('Error verifying admin session:', e);
    fallbackNavbarToggle();
  }

  // Fetch lists required for selectors/filters globally
  await fetchGlobalCache();

  // Load the default tab
  loadTab('users');
});

// Shared utilities (loaded via `frontend/scripts/utils.js` in admin.html)
const escapeHtml = (value) => {
  if (window.APP_UTILS && typeof window.APP_UTILS.escapeHtml === 'function') {
    return window.APP_UTILS.escapeHtml(value);
  }
  // Fallback (should only happen if utils.js fails to load)
  if (!value) return '';
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const timeStringToMinutes = (timeStr) => {
  if (window.APP_UTILS && typeof window.APP_UTILS.timeStringToMinutes === 'function') {
    return window.APP_UTILS.timeStringToMinutes(timeStr);
  }
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

function fallbackNavbarToggle() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.email !== 'admin@gmail.com') {
        const navbar = document.getElementById('admin-navbar');
        if (navbar) {
          navbar.style.display = 'flex';
        }
      }
    } catch (e) { }
  }
}

// Cache for selector values to keep constraints responsive
let cachedPrograms = [];
let cachedTerms = [];
let cachedCourses = [];
let cachedProfessors = [];
let cachedCourseSlots = [];

// Global active tab state
let activeTab = 'users';

// Switch tab layout handler
function switchTab(tabId) {
  activeTab = tabId;

  // Deactivate all tabs and contents
  document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));

  // Activate selected tab and content
  // Find current tab button by text or event target
  const tabButtons = Array.from(document.querySelectorAll('.admin-tab'));
  const targetButton = tabButtons.find(btn => btn.getAttribute('onclick').includes(tabId));
  if (targetButton) targetButton.classList.add('active');

  const targetContent = document.getElementById(`${tabId}-tab`);
  if (targetContent) targetContent.classList.add('active');

  // Load fresh data
  loadTab(tabId);
}

// Load data for a specific tab from backend
async function loadTab(tabId) {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/admin/${tabId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert('Access Denied: You must be logged in as an Admin.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        redirectWithToken('../pages/login.html');
        return;
      }
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    if (tabId === 'users') {
      renderUsers(data);
    } else if (tabId === 'programs') {
      cachedPrograms = data;
      renderPrograms(data);
    } else if (tabId === 'terms') {
      cachedTerms = data; // Cache for dropdown select elements
      populateFilters('terms', data);
      applyFilters('terms');
    } else if (tabId === 'courses') {
      cachedCourses = data; // Cache for dropdown select elements
      populateFilters('courses', data);
      applyFilters('courses');
    } else if (tabId === 'professors') {
      cachedProfessors = data; // Cache for dropdown select elements
      populateFilters('professors', data);
      applyFilters('professors');
    } else if (tabId === 'courseslots') {
      cachedCourseSlots = data;
      populateFilters('courseslots', data);
      applyFilters('courseslots');
    } else if (tabId === 'schedules') {
      renderSchedules(data);
    }
  } catch (err) {
    console.error(`Error loading tab ${tabId}:`, err);
    const tbody = document.getElementById(`${tabId}-tbody`);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-error-center">Error connecting to database: ${err.message}</td></tr>`;
    }
  }
}

// Render Programs Table
function renderPrograms(programs) {
  const tbody = document.getElementById('programs-tbody');
  const semLabels = ['1 Semester', '2 Semesters', 'Summer Term (3 terms)'];
  tbody.innerHTML = programs.map(prog => `
    <tr>
      <td><strong>${escapeHtml(prog.programid)}</strong></td>
      <td><strong>${escapeHtml(prog.programname)}</strong></td>
      <td>${prog.totalyears} years</td>
      <td>${semLabels[prog.semestertype - 1] || prog.semestertype}</td>
      <td>${prog.defaultunits || 18} units</td>
      <td>
        <div class="action-buttons-flex">
          <button class="btn-action edit-btn" onclick="openEditModal('programs', ${JSON.stringify(prog).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn-action delete-btn" onclick="deleteRecord('programs', '${prog.programid}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render Users Table
function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(user => {
    const termLabel = user.termid ? `<span class="badge admin">${user.termid}</span>` : '<span class="text-muted">None</span>';
    const roleLabel = user.useraccess === 'Admin' ? `<span class="badge admin">Admin</span>` : `<span class="badge default">Default</span>`;

    return `
      <tr>
        <td>${user.userid}</td>
        <td><strong>${escapeHtml(user.username || '')}</strong></td>
        <td>${escapeHtml(user.useremail)}</td>
        <td>${roleLabel}</td>
        <td>${termLabel}</td>
        <td>
          <div class="action-buttons-flex">
            <button class="btn-action edit-btn" onclick="openEditModal('users', ${JSON.stringify(user).replace(/"/g, '&quot;')})">Edit</button>
            <button class="btn-action delete-btn" onclick="deleteRecord('users', ${user.userid})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Terms Table
function renderTerms(terms) {
  const tbody = document.getElementById('terms-tbody');
  tbody.innerHTML = terms.map(term => `
    <tr>
      <td><strong>${escapeHtml(term.termid)}</strong></td>
      <td>${escapeHtml(term.programid)}</td>
      <td>Year ${term.yearlevel}</td>
      <td>Semester ${term.semester}</td>
      <td>${term.requnits} units</td>
      <td>
        <div class="action-buttons-flex">
          <button class="btn-action edit-btn" onclick="openEditModal('terms', ${JSON.stringify(term).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn-action delete-btn" onclick="deleteRecord('terms', '${term.termid}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render Courses Table
function renderCourses(courses) {
  const tbody = document.getElementById('courses-tbody');
  tbody.innerHTML = courses.map(course => {
    const termBadges = (course.termids || []).map(tid => `<span class="badge default">${escapeHtml(tid)}</span>`).join(' ');
    return `
    <tr>
      <td><strong>${escapeHtml(course.coursecode)}</strong></td>
      <td>${escapeHtml(course.coursename)}</td>
      <td>${course.courseunits} units</td>
      <td>${termBadges}</td>
      <td>
        <div class="action-buttons-flex">
          <button class="btn-action edit-btn" onclick="openEditModal('courses', ${JSON.stringify(course).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn-action delete-btn" onclick="deleteRecord('courses', '${course.coursecode}')">Delete</button>
        </div>
      </td>
    </tr>
  `}).join('');
}

// Render Professors Table
function renderProfessors(professors) {
  const tbody = document.getElementById('professors-tbody');
  tbody.innerHTML = professors.map(prof => `
    <tr>
      <td>${prof.profid}</td>
      <td><strong>${escapeHtml(prof.profname)}</strong></td>
      <td>${escapeHtml(prof.profdepartment || 'N/A')}</td>
      <td>
        <div class="action-buttons-flex">
          <button class="btn-action edit-btn" onclick="openEditModal('professors', ${JSON.stringify(prof).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn-action delete-btn" onclick="deleteRecord('professors', ${prof.profid})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render Course Slots Table
function renderCourseSlots(slots) {
  const tbody = document.getElementById('courseslots-tbody');
  tbody.innerHTML = slots.map(slot => {
    const profName = slot.profname ? escapeHtml(slot.profname) : '<span class="text-muted-italic">Unassigned (NULL)</span>';

    // Trim times for better visibility
    const startStr = slot.starttime ? slot.starttime.substring(0, 5) : '00:00';
    const endStr = slot.endtime ? slot.endtime.substring(0, 5) : '00:00';

    return `
      <tr>
        <td>${slot.courseslotid}</td>
        <td><strong>${escapeHtml(slot.coursecode)}</strong><br><small class="text-sub">${escapeHtml(slot.coursename || '')}</small></td>
        <td>${profName}</td>
        <td>${escapeHtml(slot.scheduleday)}</td>
        <td><code>${startStr} - ${endStr}</code></td>
        <td><span class="badge default">${escapeHtml(slot.roomcode)}</span></td>
        <td>
          <div class="action-buttons-flex">
            <button class="btn-action edit-btn" onclick="openEditModal('courseslots', ${JSON.stringify(slot).replace(/"/g, '&quot;')})">Edit</button>
            <button class="btn-action delete-btn" onclick="deleteRecord('courseslots', ${slot.courseslotid})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Schedules Table
function renderSchedules(schedules) {
  const tbody = document.getElementById('schedules-tbody');
  tbody.innerHTML = schedules.map(s => {
    const statusBadge = s.regular
      ? '<span class="badge regular">Regular</span>'
      : '<span class="badge irregular">Irregular</span>';

    const formattedDate = s.createdat ? new Date(s.createdat).toLocaleString() : 'N/A';
    const userLabel = `<strong>${escapeHtml(s.username || 'User')}</strong><br><small class="text-sub">${escapeHtml(s.useremail || '')}</small>`;

    return `
      <tr>
        <td>${s.scheduleid}</td>
        <td>${userLabel}</td>
        <td><strong>${escapeHtml(s.schedulename)}</strong></td>
        <td><strong>${s.totalunits}</strong> units</td>
        <td>${statusBadge}</td>
        <td>${formattedDate}</td>
        <td>
          <button class="btn-action delete-btn" onclick="deleteRecord('schedules', ${s.scheduleid})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Fetch all connecting tables in background to make sure selectors are up-to-date
async function fetchDependencies() {
  const token = getToken();
  try {
    // 0. Fetch Programs
    const progRes = await fetch(`${API_BASE}/admin/programs`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (progRes.ok) cachedPrograms = await progRes.json();

    // 1. Fetch Terms
    const termRes = await fetch(`${API_BASE}/admin/terms`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (termRes.ok) cachedTerms = await termRes.json();

    // 2. Fetch Courses
    const courseRes = await fetch(`${API_BASE}/admin/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (courseRes.ok) cachedCourses = await courseRes.json();

    // 3. Fetch Professors
    const profRes = await fetch(`${API_BASE}/admin/professors`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (profRes.ok) cachedProfessors = await profRes.json();

  } catch (err) {
    console.error('Error fetching modal dependencies:', err);
  }
}

// Modal Form Management
function closeModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('active');
}

async function openCreateModal(targetType) {
  await fetchDependencies(); // Get latest dependencies

  document.getElementById('modal-title').textContent = `Create New ${targetType.slice(0, -1).toUpperCase()}`;
  document.getElementById('form-action').value = 'create';
  document.getElementById('form-target-type').value = targetType;
  document.getElementById('form-target-id').value = '';

  const fieldsContainer = document.getElementById('modal-fields');
  fieldsContainer.innerHTML = generateFormFields(targetType, null);

  // Initialize cascading filters in Create Modal
  if (targetType === 'users') {
    filterPopupUserTerms();
  } else if (targetType === 'courses') {
    const pageProg = document.getElementById('filter-courses-program')?.value || 'All';
    const pageTerm = document.getElementById('filter-courses-term')?.value || 'All';
    
    const popupProg = document.getElementById('popup-course-program');
    if (popupProg) {
      popupProg.value = pageProg;
    }
    filterPopupCourseTerms();

    if (pageTerm !== 'All') {
      const cb = document.querySelector(`input[name="course_term_cb"][value="${pageTerm}"]`);
      if (cb) {
        cb.checked = true;
      }
    }
  } else if (targetType === 'courseslots') {
    const pageProg = document.getElementById('filter-slots-program')?.value || 'All';
    const pageTerm = document.getElementById('filter-slots-term')?.value || 'All';
    const pageCourse = document.getElementById('filter-slots-course')?.value || 'All';
    const pageDept = document.getElementById('filter-professors-dept')?.value || 'All';

    const popupProg = document.getElementById('popup-slot-program');
    if (popupProg) {
      popupProg.value = pageProg;
    }
    filterPopupSlotTerms();

    const popupTerm = document.getElementById('popup-slot-term');
    if (popupTerm && (pageTerm === 'All' || Array.from(popupTerm.options).some(opt => opt.value === pageTerm))) {
      popupTerm.value = pageTerm;
    }
    filterPopupSlotCourses();

    const slotCourse = document.getElementById('slot-course');
    if (slotCourse && pageCourse !== 'All' && Array.from(slotCourse.options).some(opt => opt.value === pageCourse)) {
      slotCourse.value = pageCourse;
    }

    const popupDept = document.getElementById('popup-slot-prof-dept');
    if (popupDept) {
      popupDept.value = pageDept;
    }
    filterPopupSlotProfessors();
  } else if (targetType === 'terms') {
    const pageProg = document.getElementById('filter-terms-program')?.value || 'All';
    const popupProg = document.getElementById('program-id');
    if (popupProg && pageProg !== 'All') {
      popupProg.value = pageProg;
    }
    filterPopupTermSemesters();
  }

  const modal = document.getElementById('admin-modal');
  modal.classList.add('active');
}

async function openEditModal(targetType, record) {
  await fetchDependencies(); // Get latest dependencies

  const idVal = targetType === 'users' ? record.userid
    : targetType === 'programs' ? record.programid
      : targetType === 'terms' ? record.termid
        : targetType === 'courses' ? record.coursecode
          : targetType === 'professors' ? record.profid
            : targetType === 'courseslots' ? record.courseslotid
              : '';

  document.getElementById('modal-title').textContent = `Edit ${targetType.slice(0, -1).toUpperCase()}`;
  document.getElementById('form-action').value = 'update';
  document.getElementById('form-target-type').value = targetType;
  document.getElementById('form-target-id').value = idVal;

  const fieldsContainer = document.getElementById('modal-fields');
  fieldsContainer.innerHTML = generateFormFields(targetType, record);

  // Pre-fill form fields
  preFillFormFields(targetType, record);

  const modal = document.getElementById('admin-modal');
  modal.classList.add('active');
}

// Generate HTML Form Fields based on table type
function generateFormFields(targetType, record) {
  const isEdit = record !== null;

  // Generate selector options dynamically
  const programOptionsHtml = cachedPrograms.map(p => `<option value="${p.programid}">${p.programid} (${escapeHtml(p.programname)})</option>`).join('');
  const termOptionsHtml = cachedTerms.map(t => `<option value="${t.termid}">${t.termid} (${t.programid} Year ${t.yearlevel} Sem ${t.semester})</option>`).join('');
  const courseOptionsHtml = cachedCourses.map(c => `<option value="${c.coursecode}">${c.coursecode} - ${escapeHtml(c.coursename)}</option>`).join('');
  const professorOptionsHtml = cachedProfessors.map(p => `<option value="${p.profid}">${escapeHtml(p.profname)} (${escapeHtml(p.profdepartment || '')})</option>`).join('');

  switch (targetType) {
    case 'programs':
      return `
        <div class="form-group-admin">
          <label for="program-id-input">Program ID</label>
          <input type="text" id="program-id-input" required placeholder="e.g. BSME" maxlength="10" ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group-admin">
          <label for="program-name">Program Name</label>
          <input type="text" id="program-name" required placeholder="e.g. Mechanical Engineering">
        </div>
        <div class="form-group-admin">
          <label for="total-years">Total Years</label>
          <input type="number" id="total-years" required min="1" max="6" placeholder="e.g. 4">
        </div>
        <div class="form-group-admin">
          <label for="semester-type">Semester / Track Type</label>
          <select id="semester-type">
            <option value="1">1 Semester per Year</option>
            <option value="2">2 Semesters per Year</option>
            <option value="3">Summer Term (3 Terms per Year)</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label for="default-units">Standard Units per Term</label>
          <input type="number" id="default-units" required min="1" max="40" placeholder="e.g. 18" value="18">
        </div>
      `;
    case 'users':
      return `
        <div class="form-group-admin">
          <label for="user-email">Email Address</label>
          <input type="email" id="user-email" required placeholder="e.g. student@gmail.com">
        </div>
        ${isEdit ? '' : `
        <div class="form-group-admin">
          <label for="user-password">Password</label>
          <input type="password" id="user-password" required placeholder="e.g. secretpassword">
        </div>
        `}
        <div class="form-group-admin">
          <label for="user-name">Full Profile Name</label>
          <input type="text" id="user-name" required placeholder="e.g. Juan dela Cruz">
        </div>
        <div class="form-group-admin">
          <label for="user-access">Access Role</label>
          <select id="user-access">
            <option value="Default">Default (Student)</option>
            <option value="Admin">Admin (Full Access)</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label for="popup-user-program">Filter Terms by Program</label>
          <select id="popup-user-program" onchange="filterPopupUserTerms()">
            <option value="All">All Programs</option>
            ${cachedPrograms.map(p => `<option value="${p.programid}">${p.programid} - ${escapeHtml(p.programname)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="user-term">Assigned Term</label>
          <select id="user-term">
            <option value="None">None (Unassigned)</option>
            ${termOptionsHtml}
          </select>
        </div>
      `;
    case 'terms':
      return `
        <div class="form-group-admin">
          <label for="term-id">Term ID</label>
          <input type="text" id="term-id" required placeholder="e.g. CS1" maxlength="10" ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group-admin">
          <label for="program-id">Program ID</label>
          <select id="program-id" onchange="filterPopupTermSemesters()">
            ${programOptionsHtml}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="year-level">Year Level</label>
          <select id="year-level">
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label for="semester">Semester</label>
          <select id="semester">
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">Summer Term</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label for="req-units">Required Units Limit</label>
          <input type="number" id="req-units" required min="1" max="50" placeholder="e.g. 23">
        </div>
      `;
    case 'courses':
      return `
        <div class="form-group-admin">
          <label for="course-code">Course Code</label>
          <input type="text" id="course-code" required placeholder="e.g. CS1-CS101" maxlength="11" ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group-admin">
          <label for="course-name">Course Title</label>
          <input type="text" id="course-name" required placeholder="e.g. Intro to Computing">
        </div>
        <div class="form-group-admin">
          <label for="course-units">Academic Units</label>
          <input type="number" id="course-units" required min="1" max="10" placeholder="e.g. 3">
        </div>
        <div class="form-group-admin">
          <label for="popup-course-program">Filter Terms by Program</label>
          <select id="popup-course-program" onchange="filterPopupCourseTerms()">
            <option value="All">All Programs</option>
            ${cachedPrograms.map(p => `<option value="${p.programid}">${p.programid} - ${escapeHtml(p.programname)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group-admin">
          <label>Assigned Term(s)</label>
          <div id="course-terms-container" style="max-height: 140px; overflow-y: auto; border: 1px solid rgba(0,0,0,0.1); padding: 6px; border-radius: 8px; background: #fafafa;">
            ${cachedTerms.map(t => `<div style="padding: 4px 6px; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.04)'" onmouseout="this.style.background='transparent'"><label style="display:flex; align-items:center; gap: 10px; font-weight: 500; cursor: pointer; color: #333; margin: 0; text-transform: none; justify-content: flex-start;"><input type="checkbox" name="course_term_cb" value="${t.termid}" style="width: 16px !important; height: 16px !important; margin: 0 !important; flex-shrink: 0;"> <span>${t.termid} <span style="color:#888; font-size: 0.85em; font-weight: normal;">(${t.programid} Y${t.yearlevel} S${t.semester})</span></span></label></div>`).join('')}
          </div>
        </div>
      `;
    case 'professors':
      return `
        <div class="form-group-admin">
          <label for="prof-name">Professor Name</label>
          <input type="text" id="prof-name" required placeholder="e.g. Dr. Isaac Newton">
        </div>
        <div class="form-group-admin">
          <label for="prof-dept">Academic Department</label>
          <input type="text" id="prof-dept" placeholder="e.g. Mathematics">
        </div>
      `;
    case 'courseslots':
      const uniqueDepts = [...new Set(cachedProfessors.map(p => p.profdepartment || 'N/A'))].filter(d => d !== '').sort();
      const deptOptionsHtml = uniqueDepts.map(d => `<option value="${d}">${escapeHtml(d)}</option>`).join('');

      return `
        <div class="form-group-admin">
          <label for="popup-slot-program">Filter Courses by Program</label>
          <select id="popup-slot-program" onchange="filterPopupSlotTerms()">
            <option value="All">All Programs</option>
            ${cachedPrograms.map(p => `<option value="${p.programid}">${p.programid} - ${escapeHtml(p.programname)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="popup-slot-term">Filter Courses by Term</label>
          <select id="popup-slot-term" onchange="filterPopupSlotCourses()">
            <option value="All">All Terms</option>
            ${cachedTerms.map(t => `<option value="${t.termid}">${t.termid} (${t.programid} Year ${t.yearlevel} Sem ${t.semester})</option>`).join('')}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="slot-course">Select Existing Course</label>
          <select id="slot-course" required>
            ${courseOptionsHtml}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="popup-slot-prof-dept">Filter Professors by Department</label>
          <select id="popup-slot-prof-dept" onchange="filterPopupSlotProfessors()">
            <option value="All">All Departments</option>
            ${deptOptionsHtml}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="slot-prof">Select Existing Professor</label>
          <select id="slot-prof">
            <option value="None">None (Unassigned)</option>
            ${professorOptionsHtml}
          </select>
        </div>
        <div class="form-group-admin">
          <label for="slot-day">Scheduled Day</label>
          <select id="slot-day" required>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>
        <div class="form-group-admin">
          <label for="slot-start">Start Time</label>
          <input type="time" id="slot-start" required>
        </div>
        <div class="form-group-admin">
          <label for="slot-end">End Time</label>
          <input type="time" id="slot-end" required>
        </div>
        <div class="form-group-admin">
          <label for="slot-room">Room Code</label>
          <input type="text" id="slot-room" required placeholder="e.g. WH301" maxlength="20">
        </div>
      `;
  }
}

// Populate input fields in the Edit Modal
function preFillFormFields(targetType, record) {
  if (targetType === 'programs') {
    document.getElementById('program-id-input').value = record.programid || '';
    document.getElementById('program-name').value = record.programname || '';
    document.getElementById('total-years').value = record.totalyears || '';
    document.getElementById('semester-type').value = record.semestertype || '2';
    document.getElementById('default-units').value = record.defaultunits || '18';
  } else if (targetType === 'users') {
    document.getElementById('user-email').value = record.useremail || '';
    document.getElementById('user-name').value = record.username || '';
    document.getElementById('user-access').value = record.useraccess || 'Default';

    // Auto-resolve user term program
    if (record.termid && record.termid !== 'None') {
      const termObj = cachedTerms.find(t => t.termid === record.termid);
      if (termObj) {
        document.getElementById('popup-user-program').value = termObj.programid;
        filterPopupUserTerms();
      }
      document.getElementById('user-term').value = record.termid;
    } else {
      document.getElementById('popup-user-program').value = 'All';
      filterPopupUserTerms();
      document.getElementById('user-term').value = 'None';
    }
  } else if (targetType === 'terms') {
    document.getElementById('term-id').value = record.termid || '';
    document.getElementById('program-id').value = record.programid || 'CS';
    filterPopupTermSemesters();
    document.getElementById('year-level').value = record.yearlevel || '1';
    document.getElementById('semester').value = record.semester || '1';
    document.getElementById('req-units').value = record.requnits || '';
  } else if (targetType === 'courses') {
    document.getElementById('course-code').value = record.coursecode || '';
    document.getElementById('course-name').value = record.coursename || '';
    document.getElementById('course-units').value = record.academicunits || record.courseunits || '';

    // Auto-resolve course term program
    if (record.termids && record.termids.length > 0) {
      const termObj = cachedTerms.find(t => t.termid === record.termids[0]);
      if (termObj) {
        document.getElementById('popup-course-program').value = termObj.programid;
        filterPopupCourseTerms();
      }

      const checkboxes = document.querySelectorAll('input[name="course_term_cb"]');
      Array.from(checkboxes).forEach(cb => {
        if (record.termids.includes(cb.value)) {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
      });
    }
  } else if (targetType === 'professors') {
    document.getElementById('prof-name').value = record.profname || '';
    document.getElementById('prof-dept').value = record.profdepartment || '';
  } else if (targetType === 'courseslots') {
    // Auto-resolve course slots program and term
    const courseObj = cachedCourses.find(c => c.coursecode === record.coursecode);
    if (courseObj) {
      const firstTermId = courseObj.termids && courseObj.termids.length > 0 ? courseObj.termids[0] : null;
      const termObj = firstTermId ? cachedTerms.find(t => t.termid === firstTermId) : null;
      if (termObj) {
        document.getElementById('popup-slot-program').value = termObj.programid;
        filterPopupSlotTerms();
        document.getElementById('popup-slot-term').value = termObj.termid;
        filterPopupSlotCourses();
      }
    }
    document.getElementById('slot-course').value = record.coursecode || '';

    // Auto-resolve professor department filter in edit modal
    if (record.profid && record.profid !== 'None') {
      const profObj = cachedProfessors.find(p => p.profid.toString() === record.profid.toString());
      if (profObj) {
        document.getElementById('popup-slot-prof-dept').value = profObj.profdepartment || 'N/A';
      } else {
        document.getElementById('popup-slot-prof-dept').value = 'All';
      }
    } else {
      document.getElementById('popup-slot-prof-dept').value = 'All';
    }
    filterPopupSlotProfessors();
    document.getElementById('slot-prof').value = record.profid || 'None';
    document.getElementById('slot-day').value = record.scheduleday || 'Monday';

    // Handle formatting start/end times safely
    const startClean = record.starttime ? record.starttime.substring(0, 5) : '';
    const endClean = record.endtime ? record.endtime.substring(0, 5) : '';
    document.getElementById('slot-start').value = startClean;
    document.getElementById('slot-end').value = endClean;
    document.getElementById('slot-room').value = record.roomcode || '';
  }
}

// Dynamic Cascading Filters for Create/Edit Modal Popups
function filterPopupUserTerms() {
  const progSelect = document.getElementById('popup-user-program');
  const termSelect = document.getElementById('user-term');
  if (!progSelect || !termSelect) return;

  const selectedProg = progSelect.value;
  const currentTermVal = termSelect.value;

  let filteredTerms = cachedTerms;
  if (selectedProg !== 'All') {
    filteredTerms = cachedTerms.filter(t => t.programid === selectedProg);
  }

  // Re-populate termSelect
  let html = '<option value="None">None (Unassigned)</option>';
  html += filteredTerms.map(t => `<option value="${t.termid}">${t.termid} (${t.programid} Year ${t.yearlevel} Sem ${t.semester})</option>`).join('');
  termSelect.innerHTML = html;

  // Keep original value if still exists in options, else select None
  if (filteredTerms.some(t => t.termid === currentTermVal)) {
    termSelect.value = currentTermVal;
  } else {
    termSelect.value = 'None';
  }
}
window.filterPopupUserTerms = filterPopupUserTerms;

function filterPopupTermSemesters() {
  const progSelect = document.getElementById('program-id');
  const semesterSelect = document.getElementById('semester');
  if (!progSelect || !semesterSelect) return;

  const selectedProg = progSelect.value;
  const currentSemesterVal = semesterSelect.value;

  const program = cachedPrograms.find(p => p.programid === selectedProg);
  if (!program) return;

  let html = '<option value="1">1st Semester</option>';
  if (program.semestertype >= 2) {
    html += '<option value="2">2nd Semester</option>';
  }
  if (program.semestertype >= 3) {
    html += '<option value="3">Summer Term</option>';
  }

  semesterSelect.innerHTML = html;

  if (semesterSelect.querySelector(`option[value="${currentSemesterVal}"]`)) {
    semesterSelect.value = currentSemesterVal;
  } else {
    semesterSelect.value = '1';
  }
}
window.filterPopupTermSemesters = filterPopupTermSemesters;

function filterPopupCourseTerms() {
  const progSelect = document.getElementById('popup-course-program');
  const termContainer = document.getElementById('course-terms-container');
  if (!progSelect || !termContainer) return;

  const selectedProg = progSelect.value;
  const checkboxes = termContainer.querySelectorAll('input[name="course_term_cb"]');
  const currentSelectedVals = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

  let filteredTerms = cachedTerms;
  if (selectedProg !== 'All') {
    filteredTerms = cachedTerms.filter(t => t.programid === selectedProg);
  }

  // Re-populate termContainer
  let html = filteredTerms.map(t => `<div style="padding: 4px 6px; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.04)'" onmouseout="this.style.background='transparent'"><label style="display:flex; align-items:center; gap: 10px; font-weight: 500; cursor: pointer; color: #333; margin: 0; text-transform: none; justify-content: flex-start;"><input type="checkbox" name="course_term_cb" value="${t.termid}" style="width: 16px !important; height: 16px !important; margin: 0 !important; flex-shrink: 0;"> <span>${t.termid} <span style="color:#888; font-size: 0.85em; font-weight: normal;">(${t.programid} Y${t.yearlevel} S${t.semester})</span></span></label></div>`).join('');
  termContainer.innerHTML = html;

  // Restore selections
  const newCheckboxes = termContainer.querySelectorAll('input[name="course_term_cb"]');
  Array.from(newCheckboxes).forEach(cb => {
    if (currentSelectedVals.includes(cb.value)) {
      cb.checked = true;
    }
  });
}
window.filterPopupCourseTerms = filterPopupCourseTerms;

function filterPopupSlotTerms() {
  const progSelect = document.getElementById('popup-slot-program');
  const termSelect = document.getElementById('popup-slot-term');
  if (!progSelect || !termSelect) return;

  const selectedProg = progSelect.value;
  const currentTermVal = termSelect.value;

  let filteredTerms = cachedTerms;
  if (selectedProg !== 'All') {
    filteredTerms = cachedTerms.filter(t => t.programid === selectedProg);
  }

  let html = '<option value="All">All Terms</option>';
  html += filteredTerms.map(t => `<option value="${t.termid}">${t.termid} (${t.programid} Year ${t.yearlevel} Sem ${t.semester})</option>`).join('');
  termSelect.innerHTML = html;

  if (filteredTerms.some(t => t.termid === currentTermVal) || currentTermVal === 'All') {
    termSelect.value = currentTermVal;
  } else {
    termSelect.value = 'All';
  }

  // Trigger course filtering update too!
  filterPopupSlotCourses();
}
window.filterPopupSlotTerms = filterPopupSlotTerms;

function filterPopupSlotCourses() {
  const progSelect = document.getElementById('popup-slot-program');
  const termSelect = document.getElementById('popup-slot-term');
  const courseSelect = document.getElementById('slot-course');
  if (!courseSelect) return;

  const selectedProg = progSelect ? progSelect.value : 'All';
  const selectedTerm = termSelect ? termSelect.value : 'All';

  let filteredCourses = cachedCourses;

  if (selectedTerm !== 'All') {
    filteredCourses = cachedCourses.filter(c => c.termids && c.termids.includes(selectedTerm));
  } else if (selectedProg !== 'All') {
    const matchingTerms = cachedTerms.filter(t => t.programid === selectedProg).map(t => t.termid);
    filteredCourses = cachedCourses.filter(c => c.termids && c.termids.some(tid => matchingTerms.includes(tid)));
  }

  const currentCourseVal = courseSelect.value;

  let html = filteredCourses.map(c => `<option value="${c.coursecode}">${c.coursecode} - ${escapeHtml(c.coursename)}</option>`).join('');
  courseSelect.innerHTML = html;

  if (filteredCourses.some(c => c.coursecode === currentCourseVal)) {
    courseSelect.value = currentCourseVal;
  } else if (filteredCourses.length > 0) {
    courseSelect.value = filteredCourses[0].coursecode;
  }
}
window.filterPopupSlotCourses = filterPopupSlotCourses;

function filterPopupSlotProfessors() {
  const deptSelect = document.getElementById('popup-slot-prof-dept');
  const profSelect = document.getElementById('slot-prof');
  if (!profSelect) return;

  const selectedDept = deptSelect ? deptSelect.value : 'All';
  const currentProfVal = profSelect.value;

  let filteredProfs = cachedProfessors;
  if (selectedDept !== 'All') {
    filteredProfs = cachedProfessors.filter(p => (p.profdepartment || 'N/A') === selectedDept);
  }

  // Re-populate profSelect
  let html = '<option value="None">None (Unassigned)</option>';
  html += filteredProfs.map(p => `<option value="${p.profid}">${escapeHtml(p.profname)} (${escapeHtml(p.profdepartment || 'N/A')})</option>`).join('');
  profSelect.innerHTML = html;

  // Restore selection if possible, otherwise default to None
  if (currentProfVal === 'None' || (currentProfVal && filteredProfs.some(p => p.profid.toString() === currentProfVal.toString()))) {
    profSelect.value = currentProfVal;
  } else {
    profSelect.value = 'None';
  }
}
window.filterPopupSlotProfessors = filterPopupSlotProfessors;

// Handle Modal Form Submission (Create or Update)
async function handleFormSubmit(event) {
  event.preventDefault();
  const token = getToken();
  const action = document.getElementById('form-action').value;
  const targetType = document.getElementById('form-target-type').value;
  const targetId = document.getElementById('form-target-id').value;

  const payload = {};

  // Build JSON payload dynamically based on active inputs
  if (targetType === 'programs') {
    payload.programid = document.getElementById('program-id-input').value.trim();
    payload.programname = document.getElementById('program-name').value.trim();
    payload.totalyears = parseInt(document.getElementById('total-years').value);
    payload.semestertype = parseInt(document.getElementById('semester-type').value);
    payload.defaultunits = parseInt(document.getElementById('default-units').value);
  } else if (targetType === 'users') {
    payload.email = document.getElementById('user-email').value.trim();
    const pwdInput = document.getElementById('user-password');
    if (pwdInput) {
      payload.password = pwdInput.value;
    }
    payload.username = document.getElementById('user-name').value.trim();
    payload.access = document.getElementById('user-access').value;
    const termVal = document.getElementById('user-term').value;
    payload.termid = termVal === 'None' ? null : termVal;
  } else if (targetType === 'terms') {
    payload.termid = document.getElementById('term-id').value.trim();
    payload.programid = document.getElementById('program-id').value;
    payload.yearlevel = parseInt(document.getElementById('year-level').value);
    payload.semester = parseInt(document.getElementById('semester').value);
    payload.requnits = parseInt(document.getElementById('req-units').value);
  } else if (targetType === 'courses') {
    payload.coursecode = document.getElementById('course-code').value.trim();
    payload.coursename = document.getElementById('course-name').value.trim();
    payload.courseunits = parseInt(document.getElementById('course-units').value);

    const checkboxes = document.querySelectorAll('input[name="course_term_cb"]:checked');
    payload.termids = Array.from(checkboxes).map(cb => cb.value);
  } else if (targetType === 'professors') {
    payload.profname = document.getElementById('prof-name').value.trim();
    payload.profdepartment = document.getElementById('prof-dept').value.trim();
  } else if (targetType === 'courseslots') {
    payload.coursecode = document.getElementById('slot-course').value;
    const profVal = document.getElementById('slot-prof').value;
    payload.profid = profVal === 'None' ? null : profVal;
    payload.scheduleday = document.getElementById('slot-day').value;

    const startStr = document.getElementById('slot-start').value;
    const endStr = document.getElementById('slot-end').value;

    const startMins = timeStringToMinutes(startStr);
    const endMins = timeStringToMinutes(endStr);
    const limitStart = 7 * 60; // 7:00 AM
    const limitEnd = 20 * 60;  // 8:00 PM

    if (startMins === null || endMins === null) {
      alert("Please enter valid start and end times.");
      return;
    }
    if (startMins < limitStart) {
      alert("⚠️ Invalid Time!\nStart time cannot be earlier than 7:00 AM.");
      return;
    }
    if (endMins > limitEnd) {
      alert("⚠️ Invalid Time!\nEnd time cannot be later than 8:00 PM.");
      return;
    }
    if (startMins >= endMins) {
      alert("⚠️ Invalid Time!\nStart time must precede end time.");
      return;
    }

    payload.starttime = startStr;
    payload.endtime = endStr;
    payload.roomcode = document.getElementById('slot-room').value.trim();
  }

  // Define route mapping
  let url = `${API_BASE}/admin/${targetType}`;
  let method = 'POST';

  if (action === 'update') {
    method = 'PUT';
    url = `${url}/${encodeURIComponent(targetId)}`;
  }

  const executeSubmit = async () => {
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        closeModal();
        if (targetType === 'programs' || targetType === 'terms' || targetType === 'courses') {
          await fetchGlobalCache();
        }
        loadTab(activeTab); // Refresh table
      } else {
        alert(`Error: ${result.error || 'Server request failed'}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Submit failed: ${err.message}`);
    }
  };

  if (targetType === 'users' && payload.access === 'Admin') {
    confirmPopup(
      `Are you absolutely sure you want to grant Admin access to "${payload.username || payload.email}"? This user will receive full administrative controls.`,
      executeSubmit,
      null,
      'Confirm Admin Elevation'
    );
  } else {
    await executeSubmit();
  }
}

// Make user an Admin directly
async function elevateToAdmin(userId) {
  confirmPopup(
    'Are you absolutely sure you want to elevate this user to Admin access?',
    async () => {
      const token = getToken();
      try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}/make-admin`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          loadTab('users');
        } else {
          const data = await response.json();
          alert(`Elevate failed: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
        alert(`Request error: ${err.message}`);
      }
    },
    null,
    'Confirm Elevation'
  );
}

// Remove Admin privileges from a user
async function removeAdmin(userId) {
  confirmPopup(
    'Are you sure you want to remove Admin access from this user?',
    async () => {
      const token = getToken();
      try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}/remove-admin`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          loadTab('users');
        } else {
          const data = await response.json();
          alert(`Privilege removal failed: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
        alert(`Request error: ${err.message}`);
      }
    },
    null,
    'Confirm Removal'
  );
}

// Delete Record
async function deleteRecord(targetType, recordId) {
  let msg = `Are you sure you want to delete this ${targetType.slice(0, -1)}?`;
  if (targetType === 'users') {
    msg += '\n\nWARNING: Deleting a user will also delete their profile and ALL saved schedules!';
  } else if (targetType === 'courses') {
    msg += '\n\nWARNING: Deleting a course will cascade delete all scheduled course slots for it!';
  } else if (targetType === 'professors') {
    msg += '\n\nNote: Deleting a professor will unassign them from course slots, leaving slots intact.';
  }

  confirmPopup(
    msg,
    async () => {
      const token = getToken();
      try {
        const response = await fetch(`${API_BASE}/admin/${targetType}/${encodeURIComponent(recordId)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
          if (targetType === 'programs' || targetType === 'terms' || targetType === 'courses') {
            await fetchGlobalCache();
          }
          loadTab(activeTab);
        } else {
          alert(`Delete failed: ${result.error || 'Server error'}`);
        }
      } catch (err) {
        console.error(err);
        alert(`Delete failed: ${err.message}`);
      }
    },
    null,
    'Confirm Delete'
  );
}

// Fetch lists required for selectors/filters globally
async function fetchGlobalCache() {
  const token = getToken();
  try {
    const [progRes, termRes, courseRes] = await Promise.all([
      fetch(`${API_BASE}/admin/programs`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE}/admin/terms`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE}/admin/courses`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    if (progRes.ok) cachedPrograms = await progRes.json();
    if (termRes.ok) cachedTerms = await termRes.json();
    if (courseRes.ok) cachedCourses = await courseRes.json();
  } catch (err) {
    console.error('Error seeding global filter caches:', err);
  }
}
window.fetchGlobalCache = fetchGlobalCache;

// Populate filter dropdowns dynamically based on current data
function populateFilters(tabId, data) {
  if (tabId === 'terms') {
    const select = document.getElementById('filter-terms-program');
    if (select) {
      const uniquePrograms = [...new Set(data.map(item => item.programid))].sort();
      const currentValue = select.value || 'All';
      select.innerHTML = '<option value="All">Show All Programs</option>' +
        uniquePrograms.map(p => `<option value="${p}">${p}</option>`).join('');
      if (uniquePrograms.includes(currentValue) || currentValue === 'All') {
        select.value = currentValue;
      } else {
        select.value = 'All';
      }
    }
  } else if (tabId === 'courses') {
    // 1. Populate Program filter dropdown with unique programs from global cachedPrograms
    const progSelect = document.getElementById('filter-courses-program');
    if (progSelect) {
      const progIds = cachedPrograms.map(p => p.programid).sort();
      const currentProg = progSelect.value || 'All';
      progSelect.innerHTML = '<option value="All">All Programs</option>' +
        progIds.map(p => `<option value="${p}">${p}</option>`).join('');
      if (progIds.includes(currentProg) || currentProg === 'All') {
        progSelect.value = currentProg;
      } else {
        progSelect.value = 'All';
      }
    }

    // 2. Populate Term filter dropdown based on the selected program
    populateCoursesTermDropdown();
  } else if (tabId === 'professors') {
    const select = document.getElementById('filter-professors-dept');
    if (select) {
      const uniqueDepts = [...new Set(data.map(item => item.profdepartment || 'N/A'))].filter(d => d !== '').sort();
      const currentValue = select.value || 'All';
      select.innerHTML = '<option value="All">All Departments</option>' +
        uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join('');
      if (uniqueDepts.includes(currentValue) || currentValue === 'All') {
        select.value = currentValue;
      } else {
        select.value = 'All';
      }
    }
  } else if (tabId === 'courseslots') {
    // 1. Populate Program selector
    const progSelect = document.getElementById('filter-slots-program');
    if (progSelect) {
      const progIds = cachedPrograms.map(p => p.programid).sort();
      const currentProg = progSelect.value || 'All';
      progSelect.innerHTML = '<option value="All">All Programs</option>' +
        progIds.map(p => `<option value="${p}">${p}</option>`).join('');
      if (progIds.includes(currentProg) || currentProg === 'All') {
        progSelect.value = currentProg;
      } else {
        progSelect.value = 'All';
      }
    }

    // 2. Populate Term selector
    populateSlotsTermDropdown();

    // 3. Populate Course selector
    populateSlotsCourseDropdown();
  }
}

// Populate courses term selector dynamically based on selected program
function populateCoursesTermDropdown() {
  const progSelect = document.getElementById('filter-courses-program');
  const termSelect = document.getElementById('filter-courses-term');
  if (!termSelect) return;

  const selectedProg = progSelect ? progSelect.value : 'All';

  // Filter all terms from global cachedTerms (pulls from DB register, so empty terms will appear!)
  let termsList = cachedTerms;
  if (selectedProg !== 'All') {
    termsList = cachedTerms.filter(t => t.programid === selectedProg);
  }

  // Sort terms chronologically
  termsList.sort((a, b) => {
    return a.termid.localeCompare(b.termid, undefined, { numeric: true, sensitivity: 'base' });
  });

  const currentTermVal = termSelect.value || 'All';
  termSelect.innerHTML = '<option value="All">All Terms</option>' +
    termsList.map(t => `<option value="${t.termid}">${t.termid}</option>`).join('');

  if (termsList.some(t => t.termid === currentTermVal) || currentTermVal === 'All') {
    termSelect.value = currentTermVal;
  } else {
    termSelect.value = 'All';
  }
}
window.populateCoursesTermDropdown = populateCoursesTermDropdown;

// Triggered when Courses Program selector changes
function onCoursesProgramChange() {
  populateCoursesTermDropdown();
  applyFilters('courses');
}
window.onCoursesProgramChange = onCoursesProgramChange;

// Populate Course Slots term selector dynamically based on selected program
function populateSlotsTermDropdown() {
  const progSelect = document.getElementById('filter-slots-program');
  const termSelect = document.getElementById('filter-slots-term');
  if (!termSelect) return;

  const selectedProg = progSelect ? progSelect.value : 'All';

  // Filter all terms from global cachedTerms
  let termsList = cachedTerms;
  if (selectedProg !== 'All') {
    termsList = cachedTerms.filter(t => t.programid === selectedProg);
  }

  // Sort terms chronologically
  termsList.sort((a, b) => {
    return a.termid.localeCompare(b.termid, undefined, { numeric: true, sensitivity: 'base' });
  });

  const currentTermVal = termSelect.value || 'All';
  termSelect.innerHTML = '<option value="All">All Terms</option>' +
    termsList.map(t => `<option value="${t.termid}">${t.termid}</option>`).join('');

  if (termsList.some(t => t.termid === currentTermVal) || currentTermVal === 'All') {
    termSelect.value = currentTermVal;
  } else {
    termSelect.value = 'All';
  }
}
window.populateSlotsTermDropdown = populateSlotsTermDropdown;

// Populate Course Slots course selector dynamically based on selected program and selected term
function populateSlotsCourseDropdown() {
  const progSelect = document.getElementById('filter-slots-program');
  const termSelect = document.getElementById('filter-slots-term');
  const courseSelect = document.getElementById('filter-slots-course');
  if (!courseSelect) return;

  const selectedProg = progSelect ? progSelect.value : 'All';
  const selectedTerm = termSelect ? termSelect.value : 'All';

  // Filter all courses from global cachedCourses
  let coursesList = cachedCourses;

  if (selectedTerm !== 'All') {
    // If a term is selected, filter strictly by that term
    coursesList = cachedCourses.filter(c => c.termids && c.termids.includes(selectedTerm));
  } else if (selectedProg !== 'All') {
    // If only a program is selected, filter by all terms belonging to that program
    const matchingTerms = cachedTerms.filter(t => t.programid === selectedProg).map(t => t.termid);
    coursesList = cachedCourses.filter(c => c.termids && c.termids.some(tid => matchingTerms.includes(tid)));
  }

  // Sort courses alphabetically by code
  coursesList.sort((a, b) => a.coursecode.localeCompare(b.coursecode));

  const currentCourseVal = courseSelect.value || 'All';
  courseSelect.innerHTML = '<option value="All">All Courses</option>' +
    coursesList.map(c => `<option value="${c.coursecode}">${c.coursecode} - ${c.coursename}</option>`).join('');

  if (coursesList.some(c => c.coursecode === currentCourseVal) || currentCourseVal === 'All') {
    courseSelect.value = currentCourseVal;
  } else {
    courseSelect.value = 'All';
  }
}
window.populateSlotsCourseDropdown = populateSlotsCourseDropdown;

// Triggered when Slots Program selector changes
function onSlotsProgramChange() {
  populateSlotsTermDropdown();
  populateSlotsCourseDropdown();
  applyFilters('courseslots');
}
window.onSlotsProgramChange = onSlotsProgramChange;

// Triggered when Slots Term selector changes
function onSlotsTermChange() {
  populateSlotsCourseDropdown();
  applyFilters('courseslots');
}
window.onSlotsTermChange = onSlotsTermChange;

// Apply selected filter dropdown value and render sub-selection
function applyFilters(tabId) {
  if (tabId === 'terms') {
    const val = document.getElementById('filter-terms-program').value;
    const filtered = val === 'All' ? cachedTerms : cachedTerms.filter(t => t.programid === val);
    renderTerms(filtered);
  } else if (tabId === 'courses') {
    const progVal = document.getElementById('filter-courses-program').value;
    const termVal = document.getElementById('filter-courses-term').value;

    let filtered = cachedCourses;

    // Filter by Program
    if (progVal !== 'All') {
      const matchingTerms = cachedTerms.filter(t => t.programid === progVal).map(t => t.termid);
      filtered = filtered.filter(c => c.termids && c.termids.some(tid => matchingTerms.includes(tid)));
    }

    // Filter by Term
    if (termVal !== 'All') {
      filtered = filtered.filter(c => c.termids && c.termids.includes(termVal));
    }

    renderCourses(filtered);
  } else if (tabId === 'professors') {
    const val = document.getElementById('filter-professors-dept').value;
    const filtered = val === 'All' ? cachedProfessors : cachedProfessors.filter(p => (p.profdepartment || 'N/A') === val);
    renderProfessors(filtered);
  } else if (tabId === 'courseslots') {
    const progVal = document.getElementById('filter-slots-program').value;
    const termVal = document.getElementById('filter-slots-term').value;
    const courseVal = document.getElementById('filter-slots-course').value;

    let filtered = cachedCourseSlots;

    // 1. Filter by Course Code if a specific course is selected
    if (courseVal !== 'All') {
      filtered = filtered.filter(s => s.coursecode === courseVal);
    } else {
      // 2. Otherwise, if a specific term is selected, filter by all courses of that term
      if (termVal !== 'All') {
        const termCourses = cachedCourses.filter(c => c.termids && c.termids.includes(termVal)).map(c => c.coursecode);
        filtered = filtered.filter(s => termCourses.includes(s.coursecode));
      } else if (progVal !== 'All') {
        // 3. Otherwise, if a specific program is selected, filter by all courses of all terms in that program
        const progTerms = cachedTerms.filter(t => t.programid === progVal).map(t => t.termid);
        const progCourses = cachedCourses.filter(c => c.termids && c.termids.some(tid => progTerms.includes(tid))).map(c => c.coursecode);
        filtered = filtered.filter(s => progCourses.includes(s.coursecode));
      }
    }

    renderCourseSlots(filtered);
  }
}
window.applyFilters = applyFilters;
