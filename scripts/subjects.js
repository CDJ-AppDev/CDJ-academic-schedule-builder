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

const API_BASE = 'http://localhost:3000/api';

// Load available courses from API
async function loadAvailableCourses() {
  const token = localStorage.getItem('token');
  if (!token) {
    availableCoursesList.innerHTML = '<p style="color: #999;">Please login first.</p>';
    return;
  }

  try {
    const programResponse = await fetch(`${API_BASE}/program`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const programData = await programResponse.json();
    if (!programData) {
      availableCoursesList.innerHTML = '<p style="color: #999;">Please select a program first.</p>';
      return;
    }

    const termId = programData.program_id + programData.year_level;
    currentTermId = termId;

    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const allCourses = await response.json();

    availableCourses = allCourses.filter(course => `${course.program_id}${course.year_level}` === termId);
    displayAvailableCourses();
  } catch (error) {
    console.error('Error loading courses:', error);
    availableCoursesList.innerHTML = '<p style="color: #999;">Error loading courses.</p>';
  }
}

function displayAvailableCourses() {
  availableCoursesList.innerHTML = '';

  if (!availableCourses || availableCourses.length === 0) {
    availableCoursesList.innerHTML = '<p style="color: #999;">No available courses for your term.</p>';
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

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${course.code} - ${course.name}`;
    titleEl.style.margin = '0';
    titleEl.style.fontSize = '1rem';

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
      sectionCard.style.marginTop = index === 0 ? '0' : '12px';
      sectionCard.innerHTML = `
        <div class="course-card-body">
          <p style="margin:0 0 6px;"><strong>Teacher:</strong> ${section.teacher?.name ?? 'TBD'}</p>
          <p style="margin:0 0 6px;"><strong>Schedule:</strong> ${section.schedule?.day ?? 'TBD'} ${section.schedule?.startTime ? `| ${section.schedule.startTime} - ${section.schedule.endTime}` : ''}</p>
          <div style="display:flex; justify-content:flex-end; margin-top: 12px;">
            <button class="btn-add" type="button">Add</button>
          </div>
        </div>
      `;

      const addButton = sectionCard.querySelector('button');
      addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addAvailableCourse(section.course_id);
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
    style.textContent = `.dropdown.active{max-height:320px;} .arrow.rotate{transform:rotate(180deg);}`;
    document.head.appendChild(style);
  }
}

function addAvailableCourse(courseId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const courseData = availableCourses.find(c => c.course_id == courseId);
  if (!courseData) {
    console.error('Course not found:', courseId);
    return;
  }

  fetch(`${API_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course_id: courseData.course_id })
  }).then(() => {
    availableCourses = availableCourses.filter(c => c.course_id != courseId);
    displayAvailableCourses();
    loadUserSchedule();
  }).catch(error => console.error('Error adding course:', error));
}

    function displayCourses() {
      coursesList.innerHTML = '';
      
      if (!courses || courses.length === 0) {
        coursesList.innerHTML = '<p style="color: #999;">No courses added yet.</p>';
        return;
      }

      // courses is an array of schedule objects, each containing an array of courses
      courses.forEach((schedule) => {
        if (!schedule.courses || schedule.courses.length === 0) return;
        
        // Group courses by code within this schedule
        const coursesByCode = {};
        schedule.courses.forEach((course) => {
          if (!coursesByCode[course.course_id]) {
            coursesByCode[course.course_id] = {
              course_id: course.course_id,
              name: course.name,
              units: course.units,
              teacher_name: course.teacher_name,
              schedule_id: schedule.schedule_id
            };
          }
        });

        // Display each unique course with schedule info
        Object.values(coursesByCode).forEach((course) => {
          const courseCard = document.createElement('div');
          courseCard.className = 'course-card';
          courseCard.innerHTML = `
            <div class="course-card-header">
              <h3>${course.course_id} - ${course.name}</h3>
              <button class="btn-remove" onclick="removeCourse('${course.course_id}', ${course.schedule_id})">Remove</button>
            </div>
            <div class="course-card-body">
              <p><strong>Teacher:</strong> ${course.teacher_name || 'TBD'}</p>
              <p><strong>Units:</strong> ${course.units || 'N/A'}</p>
            </div>
          `;
          coursesList.appendChild(courseCard);
        });
      });
    }

   function removeCourse(courseId, scheduleId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`${API_BASE}/schedule`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course_id: courseId, schedule_id: scheduleId })
  }).then(() => {
    loadUserSchedule();
    loadAvailableCourses();
  }).catch(error => console.error('Error removing course:', error));
}

if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      const code = courseCodeInput.value.trim();
      const name = courseNameInput.value.trim();
      const teacherName = teacherNameInput.value.trim();
      const teacherDept = teacherDeptInput.value.trim();
      const day = scheduleDayInput.value;
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;

      if (!code || !name || !teacherName || !teacherDept || !day || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      const professor = new Professor(null, teacherName, teacherDept);
      const courseSlot = new CourseSlot(null, code, null, startTime, endTime, day, null);
      const newCourse = new Course(code, currentTermId, name, 3, [courseSlot]);

      courses.push(newCourse);

      courseCodeInput.value = '';
      courseNameInput.value = '';
      teacherNameInput.value = '';
      teacherDeptInput.value = '';
      scheduleDayInput.value = '';
      startTimeInput.value = '';
      endTimeInput.value = '';

      displayCourses();
    });
}

const toggleIrregularBtn = document.getElementById('toggle-irregular');
const irregularSection = document.getElementById('irregular-section');

if (toggleIrregularBtn && irregularSection) {
    toggleIrregularBtn.addEventListener('click', () => {
        if (irregularSection.style.display === 'none') {
            irregularSection.style.display = 'block';
        } else {
            irregularSection.style.display = 'none';
        }
    });
}

if (coursesList && availableCoursesList) {
    loadUserSchedule();
    loadAvailableCourses();
} else {
    console.warn('Plotter.js loaded on a page without required UI elements.');
}

// Load user schedule
async function loadUserSchedule() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/schedule`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    courses = await response.json();
    displayCourses();
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}