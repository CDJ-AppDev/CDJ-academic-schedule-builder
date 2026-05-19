// Schedule Plotter Functionality
const addCourseBtn = document.getElementById('add-course-btn');
const coursesList = document.getElementById('scheduledList');
const availableCoursesList = document.getElementById('availableCourses');

const courseCodeInput = document.getElementById('course-code');
const courseNameInput = document.getElementById('course-name');
const teacherNameInput = document.getElementById('teacher-name');
const roomCodeInput = document.getElementById('room-code');
const scheduleDayInput = document.getElementById('schedule-day');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const courseUnitsInput = document.getElementById('course-units'); // Add this for irregular units

// Detect API base URL based on environment
let courses = [];
let availableCourses = [];
let currentTermId = null; // Track the current term for filtering
let userSchedules = [];
let activeScheduleId = 'new';

// Get or fetch term data (cached in localStorage)
async function getTermData(token, termId) {
  // Fetch units according to the user's termID (stored in localStorage or from user profile)
  const activeTermId = termId || localStorage.getItem('termId');

  // Use a term-specific cache key to prevent stale cache when switching programs
  const cacheKey = activeTermId ? `termData_${activeTermId}` : 'termData';
  const cachedTermData = localStorage.getItem(cacheKey);

  if (cachedTermData) {
    const termData = JSON.parse(cachedTermData);
    if (termData && termData.req_units) {
      localStorage.setItem('reqUnits', termData.req_units);
    }
    return termData;
  }

  try {
    let url = `${API_BASE}/term`;
    if (activeTermId) {
      url += `?termId=${encodeURIComponent(activeTermId)}`;
    }

    const termResponse = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const termData = await termResponse.json();
    if (termData) {
      localStorage.setItem(cacheKey, JSON.stringify(termData));
      // Store required units for display
      if (termData.req_units) {
        localStorage.setItem('reqUnits', termData.req_units);
      }
    }
    return termData;
  } catch (error) {
    console.error('Error fetching term data:', error);
    return null;
  }
}

// Clear term data cache (useful when user changes term/program)
function clearTermCache() {
  const activeTermId = localStorage.getItem('termId');
  if (activeTermId) {
    localStorage.removeItem(`termData_${activeTermId}`);
  }
  localStorage.removeItem('termData');
  localStorage.removeItem('reqUnits');
}

// Function to parse time string to minutes
function timeStringToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Function to check if two time ranges overlap
function doTimesOverlap(start1, end1, start2, end2) {
  const start1Min = timeStringToMinutes(start1);
  const end1Min = timeStringToMinutes(end1);
  const start2Min = timeStringToMinutes(start2);
  const end2Min = timeStringToMinutes(end2);

  if (!start1Min || !end1Min || !start2Min || !end2Min) return false;

  return start1Min < end2Min && start2Min < end1Min;
}

// Function to check for scheduling conflicts
function checkScheduleConflict(newDay, newStartTime, newEndTime) {
  for (let course of courses) {
    // Get the course's schedule information
    let courseDay, courseStartTime, courseEndTime;

    if (course.schedule) {
      // API course format
      courseDay = course.schedule.day;
      courseStartTime = course.schedule.startTime;
      courseEndTime = course.schedule.endTime;
    } else if (course.slots && course.slots.length > 0) {
      // Manual course format
      courseDay = course.slots[0].day;
      courseStartTime = course.slots[0].startTime;
      courseEndTime = course.slots[0].endTime;
    } else {
      continue;
    }

    // Check if days match (case-insensitive)
    if (courseDay && courseDay.toLowerCase() === newDay.toLowerCase()) {
      // Check if times overlap
      if (doTimesOverlap(courseStartTime, courseEndTime, newStartTime, newEndTime)) {
        return {
          conflict: true,
          conflictingCourse: course.code || course.courseCode,
          conflictingDay: courseDay,
          conflictingTime: `${courseStartTime} - ${courseEndTime}`
        };
      }
    }
  }

  return { conflict: false };
}

// Load available courses from API
async function loadAvailableCourses() {
  const token = localStorage.getItem('token');
  if (!token) {
    availableCoursesList.innerHTML = '<p class="text-muted-light">Please login first.</p>';
    return;
  }

  try {
    const termData = await getTermData(token);
    if (!termData) {
      availableCoursesList.innerHTML = '<p class="text-muted-light">Please select a program first.</p>';
      return;
    }

    const termId = termData.program_id + termData.year_level;
    currentTermId = termId;

    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const allCourses = await response.json();

    availableCourses = allCourses.filter(course => `${course.program_id}${course.year_level}` === termId);

    // Filter out course codes that are already added (deduplication by code)
    const addedCourseCodes = new Set();
    courses.forEach(c => {
      if (c.courseCode) addedCourseCodes.add(c.courseCode); // manual
      else if (c.code) addedCourseCodes.add(c.code); // api
    });

    availableCourses = availableCourses.filter(c => !addedCourseCodes.has(c.code));

    displayAvailableCourses();
  } catch (error) {
    console.error('Error loading courses:', error);
    availableCoursesList.innerHTML = '<p class="text-muted-light">Error loading courses.</p>';
  }
}

function displayAvailableCourses() {
  availableCoursesList.innerHTML = '';

  if (!availableCourses || availableCourses.length === 0) {
    availableCoursesList.innerHTML = '<p class="text-muted-light">No more available courses for your term.</p>';
    return;
  }

  const courseGroups = {};
  availableCourses.forEach((courseData) => {
    const key = `${courseData.code}||${courseData.name}`;
    if (!courseGroups[key]) {
      courseGroups[key] = {
        code: courseData.code,
        name: courseData.name,
        sections: []
      };
    }
    courseGroups[key].sections.push(courseData);
  });

  Object.values(courseGroups).forEach((course) => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    courseCard.style.border = 'none';
    courseCard.style.background = 'transparent';
    courseCard.style.boxShadow = 'none';
    courseCard.style.overflow = 'visible';

    const courseHeader = document.createElement('div');
    courseHeader.className = 'course-card-header';
    courseHeader.style.cursor = 'pointer';
    courseHeader.style.display = 'flex';
    courseHeader.style.justifyContent = 'space-between';
    courseHeader.style.alignItems = 'center';
    courseHeader.style.background = '#8b5cf6'; // Premium solid violet/indigo color matching the mockup!
    courseHeader.style.color = 'white';
    courseHeader.style.borderRadius = '12px'; // Beautiful rounded corners matching the mockup!
    courseHeader.style.padding = '14px 20px';
    courseHeader.style.borderBottom = 'none';
    courseHeader.style.fontWeight = 'bolder';
    courseHeader.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
    courseHeader.style.transition = 'all 0.3s ease';

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${course.code} - ${course.name}`;
    titleEl.style.margin = '0';
    titleEl.style.fontSize = '0.98rem';
    titleEl.style.fontWeight = '600';
    titleEl.style.letterSpacing = '0.01em';

    const arrowEl = document.createElement('img');
    arrowEl.className = 'arrow';
    arrowEl.src = '../assets/dropdown.png';
    arrowEl.alt = 'Toggle';
    arrowEl.style.width = '14px';
    arrowEl.style.height = '14px';
    arrowEl.style.objectFit = 'contain';
    arrowEl.style.transition = 'transform 0.3s ease';

    courseHeader.appendChild(titleEl);
    courseHeader.appendChild(arrowEl);

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.style.overflow = 'hidden';
    dropdown.style.maxHeight = '0';
    dropdown.style.transition = 'max-height 0.4s ease';

    courseHeader.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('active');
      arrowEl.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      dropdown.style.maxHeight = isOpen ? `${dropdown.scrollHeight}px` : '0';

      // Dynamic border-radius morphing to align with expanded dropdown body
      courseHeader.style.borderRadius = isOpen ? '12px 12px 0 0' : '12px';
    });

    course.sections.forEach((section, index) => {
      const sectionCard = document.createElement('div');
      sectionCard.className = 'course-card irregular-course-card';
      sectionCard.style.marginTop = index === 0 ? '8px' : '12px';
      sectionCard.innerHTML = `
        <div class="course-card-body card-body-flex">
          <div>
            <p class="card-text-main">Professor: ${section.teacher?.name ?? 'TBD'}</p>
            <p class="card-text-sub">Schedule: ${section.schedule?.day ?? 'TBD'} ${section.schedule?.startTime ? `| ${section.schedule.startTime} - ${section.schedule.endTime}` : ''} ${section.schedule?.room ? `| Room: ${section.schedule.room}` : ''}</p>
          </div>
          <button class="btn-add btn-add-inline" type="button">Add</button>
        </div>
      `;

      const addButton = sectionCard.querySelector('button');
      addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addAvailableCourse(section.courseslot_id);
      });

      dropdown.appendChild(sectionCard);
    });

    courseCard.appendChild(courseHeader);
    courseCard.appendChild(dropdown);
    availableCoursesList.appendChild(courseCard);
  });

  if (!document.getElementById('subject-schedule-inline-style')) {
    const style = document.createElement('style');
    style.id = 'subject-schedule-inline-style';
    style.textContent = `.dropdown.active{max-height:800px;} .arrow.rotate{transform:rotate(180deg);}`;
    document.head.appendChild(style);
  }
}

function addAvailableCourse(courseslotId) {
  const courseData = availableCourses.find(c => c.courseslot_id == courseslotId);
  if (!courseData) {
    console.error('Course not found:', courseslotId);
    return;
  }

  // Check for scheduling conflicts
  const conflictCheck = checkScheduleConflict(
    courseData.schedule?.day,
    courseData.schedule?.startTime,
    courseData.schedule?.endTime
  );

  if (conflictCheck.conflict) {
    alert(
      `⚠️ Scheduling Conflict Detected!\n\n` +
      `This course conflicts with:\n` +
      `Course: ${conflictCheck.conflictingCourse}\n` +
      `Day: ${conflictCheck.conflictingDay}\n` +
      `Time: ${conflictCheck.conflictingTime}\n\n` +
      `Please choose a different section or remove the conflicting course.`
    );
    return;
  }

  const formattedCourse = {
    course_id: courseData.course_id,
    courseslot_id: courseData.courseslot_id,
    code: courseData.code,
    name: courseData.name,
    units: courseData.units,
    program_id: courseData.program_id,
    teacher_name: courseData.teacher?.name,
    schedule: {
      day: courseData.schedule?.day,
      startTime: courseData.schedule?.startTime,
      endTime: courseData.schedule?.endTime,
      room: courseData.schedule?.room
    }
  };

  courses.push(formattedCourse);

  // Remove entire course (all sections) from available courses by course code
  availableCourses = availableCourses.filter(c => c.code !== courseData.code);
  displayAvailableCourses();
  displayCourses();
}

function displayCourses() {
  coursesList.innerHTML = '';

  const unitsDisplay = document.getElementById('schedule-units-display');
  const nameInput = document.getElementById('schedule-name-input');
  const statusBadge = document.getElementById('regular-status-badge');

  if (!courses || courses.length === 0) {
    coursesList.innerHTML = '<p class="text-muted-light">No courses added yet.</p>';
    if (unitsDisplay) unitsDisplay.textContent = `Units: 0 / ${localStorage.getItem('reqUnits') || 0}`;
    if (statusBadge) statusBadge.style.display = 'none';
    window.currentTotalUnits = 0;
    window.isRegular = false;
    return;
  }

  let totalUnits = 0;
  let hasIrregular = false;
  const coursesByCode = {};

  courses.forEach((course) => {
    if (!course.courseslot_id) {
      // Manual irregular course
      totalUnits += parseInt(course.units || 0, 10);
      hasIrregular = true;

      const courseCard = document.createElement('div');
      courseCard.className = 'course-card irregular-course-card';
      courseCard.style.marginBottom = '12px';

      const slot = (course.slots && course.slots[0]) || {};
      const displayCode = course.courseCode || course.code || course.course_id || 'TBA';
      const displayProf = (slot.profId?.name) || course.teacher_name || 'TBD';
      const displayDay = slot.day || (course.schedule?.day) || 'TBD';
      const displayStart = slot.startTime || (course.schedule?.startTime) || '';
      const displayEnd = slot.endTime || (course.schedule?.endTime) || '';
      const displayRoom = slot.room || (course.schedule?.room) || '';

      courseCard.innerHTML = `
         <div class="course-card-body card-body-flex">
           <div>
             <h3 class="card-title-sm">${displayCode} - ${course.name}</h3>
             <p class="card-text-main">${displayProf}</p>
             <p class="card-text-sub">${displayDay} | ${displayStart} - ${displayEnd} ${displayRoom ? `| Room: ${displayRoom}` : ''}</p>
           </div>
           <button class="btn-remove btn-remove-inline" onclick="removeManualCourse('${displayCode}')">REMOVE</button>
         </div>
       `;
      coursesList.appendChild(courseCard);
    } else {
      // API course - only one per course code (deduplication by code)
      if (!coursesByCode[course.code]) {
        coursesByCode[course.code] = course;
        totalUnits += parseInt(course.units || 0, 10);
      }
    }
  });

  // Display API courses
  Object.values(coursesByCode).forEach((course) => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card irregular-course-card';
    courseCard.style.marginBottom = '12px';

    courseCard.innerHTML = `
      <div class="course-card-body card-body-flex">
        <div>
          <h3 class="card-title-sm">${course.code || course.course_id} - ${course.name}</h3>
          <p class="card-text-main">${course.teacher_name || 'TBD'}</p>
          <p class="card-text-sub">${course.schedule?.day || course.day || 'TBD'} ${course.schedule?.startTime || course.startTime ? `| ${course.schedule?.startTime || course.startTime} - ${course.schedule?.endTime || course.endTime}` : ''} ${course.schedule?.room || course.room ? `| Room: ${course.schedule?.room || course.room}` : ''}</p>
        </div>
        <button class="btn-remove btn-remove-inline" onclick="removeCourse(${course.courseslot_id})">REMOVE</button>
      </div>
    `;
    coursesList.appendChild(courseCard);
  });

  const reqUnits = parseInt(localStorage.getItem('reqUnits')) || 0;

  if (unitsDisplay) {
    unitsDisplay.textContent = `Units: ${totalUnits} / ${reqUnits}`;
  }

  const isRegular = (totalUnits === reqUnits) && !hasIrregular;

  if (statusBadge) {
    statusBadge.style.display = 'inline-block';
    if (isRegular) {
      statusBadge.textContent = 'REGULAR';
      statusBadge.style.backgroundColor = 'rgba(0, 204, 102, 0.2)';
      statusBadge.style.color = '#00cc66';
      statusBadge.style.border = '1px solid #00cc66';
    } else {
      statusBadge.textContent = 'IRREGULAR';
      statusBadge.style.backgroundColor = 'rgba(204, 51, 51, 0.2)';
      statusBadge.style.color = '#cc3333';
      statusBadge.style.border = '1px solid #cc3333';
    }
  }

  window.currentTotalUnits = totalUnits;
  window.isRegular = isRegular;
}

window.removeManualCourse = function (courseCode) {
  courses = courses.filter(c => (c.courseCode || c.code || c.course_id) !== courseCode);
  displayCourses();
  loadAvailableCourses();
};

window.removeCourse = function (courseslotId) {
  courses = courses.filter(c => c.courseslot_id !== parseInt(courseslotId));
  displayCourses();
  loadAvailableCourses();
}

if (addCourseBtn) {
  addCourseBtn.addEventListener('click', () => {
    const code = courseCodeInput.value.trim();
    const name = courseNameInput.value.trim();
    const tName = teacherNameInput.value.trim();
    const day = scheduleDayInput.value.trim();
    const start = startTimeInput.value.trim();
    const end = endTimeInput.value.trim();
    const units = parseInt(courseUnitsInput?.value || "0", 10);
    const room = roomCodeInput.value.trim() || 'TBA';

    if (!code || !name || !tName || !day || !start || !end) {
      alert("Please fill in all irregular course details.");
      return;
    }

    // Time validation (7:00 AM - 8:00 PM limit)
    const startMins = timeStringToMinutes(start);
    const endMins = timeStringToMinutes(end);
    const limitStart = 7 * 60; // 7:00 AM
    const limitEnd = 20 * 60;  // 8:00 PM

    if (startMins === null || endMins === null) {
      alert("Please enter valid start and end times.");
      return;
    }
    if (startMins < limitStart) {
      alert("Invalid Time!\nStart time cannot be earlier than 7:00 AM.");
      return;
    }
    if (endMins > limitEnd) {
      alert("Invalid Time!\nEnd time cannot be later than 8:00 PM.");
      return;
    }
    if (startMins >= endMins) {
      alert("Invalid Time!\nStart time must precede end time.");
      return;
    }

    // Check for scheduling conflicts
    const conflictCheck = checkScheduleConflict(day, start, end);

    if (conflictCheck.conflict) {
      alert(
        `⚠️ Scheduling Conflict Detected!\n\n` +
        `This course conflicts with:\n` +
        `Course: ${conflictCheck.conflictingCourse}\n` +
        `Day: ${conflictCheck.conflictingDay}\n` +
        `Time: ${conflictCheck.conflictingTime}\n\n` +
        `Please adjust the time or day.`
      );
      return;
    }

    const newCourse = {
      courseCode: code,
      name: name,
      units: units,
      slots: [{
        profId: { name: tName, department: 'Manual' },
        day: day,
        startTime: start,
        endTime: end,
        room: room
      }]
    };

    courses.push(newCourse);

    // Clear inputs
    courseCodeInput.value = '';
    courseNameInput.value = '';
    teacherNameInput.value = '';
    roomCodeInput.value = '';
    scheduleDayInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    if (courseUnitsInput) courseUnitsInput.value = '';

    displayCourses();

    // Auto-close irregular section after adding
    const header = addCourseBtn.closest('.dropdown').previousElementSibling;
    if (header && header.classList.contains('course-card-header')) {
      header.click();
    }
  });
}

window.switchActiveSchedule = function (id) {
  activeScheduleId = id;
  const nameInput = document.getElementById('schedule-name-input');
  const deleteBtn = document.getElementById('delete-schedule-btn');

  if (id === 'new') {
    courses = [];
    window.currentScheduleId = null;
    if (nameInput) nameInput.value = 'Schedule';
    if (deleteBtn) deleteBtn.style.display = 'none';
  } else {
    const sched = userSchedules.find(s => s.schedule_id == id);
    if (sched) {
      window.currentScheduleId = sched.schedule_id;
      if (nameInput) nameInput.value = sched.schedule_name;
      courses = sched.courses || [];
      if (deleteBtn) deleteBtn.style.display = 'block';
    }
  }
  displayCourses();
  loadAvailableCourses();
};

async function loadUserSchedule() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/schedule`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userSchedules = await response.json();

    const selector = document.getElementById('schedule-selector');
    if (selector) {
      selector.innerHTML = '<option value="new">+ Create New Schedule</option>';
      userSchedules.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.schedule_id;
        opt.textContent = s.schedule_name;
        selector.appendChild(opt);
      });

      if (activeScheduleId && activeScheduleId !== 'new') {
        selector.value = activeScheduleId;
      } else if (userSchedules.length > 0 && activeScheduleId === 'new') {
        selector.value = userSchedules[0].schedule_id;
        activeScheduleId = userSchedules[0].schedule_id;
      }

      selector.onchange = (e) => switchActiveSchedule(e.target.value);
    }

    switchActiveSchedule(activeScheduleId);
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Fetch term data as soon as the page opens, even if courses are not added yet
  getTermData(token).then(termData => {
    if (termData && termData.req_units) {
      localStorage.setItem('reqUnits', termData.req_units);
      // Force rendering the UI to reflect the fetched required units immediately
      displayCourses();
    }
  }).catch(error => {
    console.error('Error fetching term data on page open:', error);
  });

  const reqUnits = localStorage.getItem('reqUnits');
  if (reqUnits) {
    const unitsDisplay = document.getElementById('schedule-units-display');
    if (unitsDisplay) unitsDisplay.textContent = `Units: 0 / ${reqUnits}`;
  }

  loadAvailableCourses();
  loadUserSchedule();

  const saveBtn = document.querySelector('.btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Cannot save schedule: you are not logged in.');
        return;
      }

      if (courses.length === 0) {
        alert('Cannot save empty schedule.');
        return;
      }

      const scheduleName = document.getElementById('schedule-name-input')?.value || 'My Schedule';

      const scheduleList = [];
      courses.forEach(c => {
        if (c.courseCode) {
          scheduleList.push(c); // Irregular manual course
        } else {
          // API Course - prevent duplicates
          const exists = scheduleList.find(item => item.courseslot_id === c.courseslot_id);
          if (!exists) {
            scheduleList.push({ courseslot_id: c.courseslot_id });
          }
        }
      });

      try {
        const response = await fetch(`${API_BASE}/schedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            schedule_id: window.currentScheduleId || null,
            schedule_name: scheduleName,
            total_units: window.currentTotalUnits || 0,
            regular: window.isRegular !== undefined ? window.isRegular : true,
            schedule_list: scheduleList
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert('Schedule saved successfully!');
          if (data.schedule_id) {
            window.currentScheduleId = data.schedule_id;
            activeScheduleId = data.schedule_id;
            loadUserSchedule(); // Reload to sync with DB and update selector
          }
        } else {
          alert('Failed to save schedule.');
        }
      } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Error saving schedule.');
      }
    });
  }

  const deleteBtn = document.getElementById('delete-schedule-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (!window.currentScheduleId) return;

      confirmPopup(
        'Are you sure you want to delete this schedule? This cannot be undone.',
        async () => {
          try {
            const response = await fetch(`${API_BASE}/schedule/${window.currentScheduleId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              alert('Schedule deleted successfully.');
              activeScheduleId = 'new';
              loadUserSchedule();
            } else {
              alert('Failed to delete schedule.');
            }
          } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Error deleting schedule.');
          }
        },
        null,
        'Delete Schedule'
      );
    });
  }
});
