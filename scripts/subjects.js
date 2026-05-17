// Schedule Plotter Functionality
const addCourseBtn = document.getElementById('add-course-btn');
const coursesList = document.getElementById('scheduledList');
const availableCoursesList = document.getElementById('availableCourses');

const courseCodeInput = document.getElementById('course-code');
const courseNameInput = document.getElementById('course-name');
const teacherNameInput = document.getElementById('teacher-name');
const teacherDeptInput = document.getElementById('teacher-dept');
const scheduleDayInput = document.getElementById('schedule-day');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const courseUnitsInput = document.getElementById('course-units'); // Add this for irregular units

const API_BASE = 'http://localhost:3000/api';

let courses = [];
let availableCourses = [];
let currentTermId = null; // Track the current term for filtering
let userSchedules = [];
let activeScheduleId = 'new';

// Get or fetch term data (cached in localStorage)
async function getTermData(token) {
  const cachedTermData = localStorage.getItem('termData');
  if (cachedTermData) {
    return JSON.parse(cachedTermData);
  }

  try {
    const termResponse = await fetch(`${API_BASE}/term`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const termData = await termResponse.json();
    if (termData) {
      localStorage.setItem('termData', JSON.stringify(termData));
    }
    return termData;
  } catch (error) {
    console.error('Error fetching term data:', error);
    return null;
  }
}

// Clear term data cache (useful when user changes term/program)
function clearTermCache() {
  localStorage.removeItem('termData');
}

// Load available courses from API
async function loadAvailableCourses() {
  const token = localStorage.getItem('token');
  if (!token) {
    availableCoursesList.innerHTML = '<p style="color: #999;">Please login first.</p>';
    return;
  }

  try {
    const termData = await getTermData(token);
    if (!termData) {
      availableCoursesList.innerHTML = '<p style="color: #999;">Please select a program first.</p>';
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
    availableCoursesList.innerHTML = '<p style="color: #999;">Error loading courses.</p>';
  }
}

function displayAvailableCourses() {
  availableCoursesList.innerHTML = '';

  if (!availableCourses || availableCourses.length === 0) {
    availableCoursesList.innerHTML = '<p style="color: #999;">No more available courses for your term.</p>';
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

    const courseHeader = document.createElement('div');
    courseHeader.className = 'course-card-header';
    courseHeader.style.cursor = 'pointer';
    courseHeader.style.justifyContent = 'space-between';
    courseHeader.style.background = '#d0eaea';
    courseHeader.style.color = 'black';
    courseHeader.style.borderRadius = '20px';
    courseHeader.style.borderBottom = 'none';

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${course.code} - ${course.name}`;
    titleEl.style.margin = '0';
    titleEl.style.fontSize = '0.95rem';

    const arrowEl = document.createElement('span');
    arrowEl.className = 'arrow';
    arrowEl.textContent = '⌄';
    arrowEl.style.fontSize = '1.2rem';
    arrowEl.style.transition = 'transform 0.3s';

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
    });

    course.sections.forEach((section, index) => {
      const sectionCard = document.createElement('div');
      sectionCard.className = 'course-card';
      sectionCard.style.marginTop = index === 0 ? '8px' : '12px';
      sectionCard.style.background = '#ccc';
      sectionCard.style.color = 'black';
      sectionCard.style.borderRadius = '20px';
      sectionCard.innerHTML = `
        <div class="course-card-body" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;">
          <div>
            <p style="margin:0 0 4px; font-weight: bold;">Professor: ${section.teacher?.name ?? 'TBD'}</p>
            <p style="margin:0;">Schedule: ${section.schedule?.day ?? 'TBD'} ${section.schedule?.startTime ? `| ${section.schedule.startTime} - ${section.schedule.endTime}` : ''} ${section.schedule?.room ? `| Room: ${section.schedule.room}` : ''}</p>
          </div>
          <button class="btn-add" type="button" style="background-color: #00cc66; border-radius: 20px; padding: 6px 24px; text-transform: uppercase; font-weight: bold;">Add</button>
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
    coursesList.innerHTML = '<p style="color: #999;">No courses added yet.</p>';
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
    if (course.courseCode) {
      // Manual irregular course
      totalUnits += parseInt(course.units || 0, 10);
      hasIrregular = true;

      const courseCard = document.createElement('div');
      courseCard.className = 'course-card';
      courseCard.style.marginBottom = '12px';
      courseCard.style.background = '#ccc';
      courseCard.style.color = 'black';
      courseCard.style.borderRadius = '20px';
      const slot = course.slots[0] || {};
      courseCard.innerHTML = `
         <div class="course-card-body" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
           <div>
             <h3 style="margin: 0 0 8px 0; font-size: 0.85rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${course.courseCode} - ${course.name}</h3>
             <p style="margin: 0 0 4px 0; font-weight: bold;">${slot.profId?.name || 'TBD'}</p>
             <p style="margin: 0;">${slot.day || 'TBD'} | ${slot.startTime || ''} - ${slot.endTime || ''} ${slot.room ? `| Room: ${slot.room}` : ''}</p>
           </div>
           <button class="btn-remove" style="background-color: #cc3333; border-radius: 20px; padding: 8px 24px; text-transform: uppercase; font-weight: bold;" onclick="removeManualCourse('${course.courseCode}')">REMOVE</button>
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
    courseCard.className = 'course-card';
    courseCard.style.marginBottom = '12px';
    courseCard.style.background = '#ccc';
    courseCard.style.color = 'black';
    courseCard.style.borderRadius = '20px';

    courseCard.innerHTML = `
      <div class="course-card-body" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 0.85rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${course.code || course.course_id} - ${course.name}</h3>
          <p style="margin: 0 0 4px 0; font-weight: bold;">${course.teacher_name || 'TBD'}</p>
          <p style="margin: 0;">${course.schedule?.day || course.day || 'TBD'} ${course.schedule?.startTime || course.startTime ? `| ${course.schedule?.startTime || course.startTime} - ${course.schedule?.endTime || course.endTime}` : ''} ${course.schedule?.room || course.room ? `| Room: ${course.schedule?.room || course.room}` : ''}</p>
        </div>
        <button class="btn-remove" style="background-color: #cc3333; border-radius: 20px; padding: 8px 24px; text-transform: uppercase; font-weight: bold;" onclick="removeCourse(${course.courseslot_id})">REMOVE</button>
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
  courses = courses.filter(c => c.courseCode !== courseCode);
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

    if (!code || !name || !tName || !day || !start || !end) {
      alert("Please fill in all irregular course details.");
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
        room: 'TBA'
      }]
    };

    courses.push(newCourse);
    
    // Clear inputs
    courseCodeInput.value = '';
    courseNameInput.value = '';
    teacherNameInput.value = '';
    teacherDeptInput.value = '';
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

window.switchActiveSchedule = function(id) {
  activeScheduleId = id;
  const nameInput = document.getElementById('schedule-name-input');
  
  if (id === 'new') {
    clearTermCache(); // Clear cache when switching to new schedule
    courses = [];
    window.currentScheduleId = null;
    if (nameInput) nameInput.value = 'My New Schedule';
  } else {
    const sched = userSchedules.find(s => s.schedule_id == id);
    if (sched) {
      window.currentScheduleId = sched.schedule_id;
      if (nameInput) nameInput.value = sched.schedule_name;
      courses = sched.courses || [];
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
});
