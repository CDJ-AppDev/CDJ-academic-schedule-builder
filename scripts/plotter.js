// Schedule Plotter Functionality
const addCourseBtn = document.getElementById('add-course-btn');
const coursesList = document.getElementById('courses-list');
const availableCoursesList = document.getElementById('available-courses');

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
    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    availableCourses = await response.json();
    displayAvailableCourses();
  } catch (error) {
    console.error('Error loading courses:', error);
    availableCoursesList.innerHTML = '<p style="color: #999;">Error loading courses.</p>';
  }
}

    function displayAvailableCourses() {
      availableCoursesList.innerHTML = '';
      
      if (availableCourses.length === 0) {
        availableCoursesList.innerHTML = '<p style="color: #999;">No available courses.</p>';
        return;
      }

      availableCourses.forEach((courseData, index) => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
          <div class="course-card-header">
            <h3>${courseData.code} - ${courseData.name}</h3>
            <button class="btn-add" onclick="addAvailableCourse(${index})">Add</button>
          </div>
          <div class="course-card-body">
            <p><strong>Teacher:</strong> ${courseData.teacher.name} (${courseData.teacher.department})</p>
            <p><strong>Schedule:</strong> ${courseData.schedule.day} | ${courseData.schedule.startTime} - ${courseData.schedule.endTime}</p>
          </div>
        `;
        availableCoursesList.appendChild(courseCard);
      });
    }

   function addAvailableCourse(index) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const courseData = availableCourses[index];
  fetch(`${API_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course_id: courseData.course_id })
  }).then(() => {
    // Remove from available and refresh
    availableCourses.splice(index, 1);
    displayAvailableCourses();
    loadUserSchedule(); // Load user's schedule
  }).catch(error => console.error('Error adding course:', error));
    }

    function displayCourses() {
      coursesList.innerHTML = '';
      
      if (courses.length === 0) {
        coursesList.innerHTML = '<p style="color: #999;">No courses added yet.</p>';
        return;
      }

      courses.forEach((course, index) => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
          <div class="course-card-header">
            <h3>${course.code} - ${course.name}</h3>
            <button class="btn-remove" onclick="removeCourse(${course.course_id})">Remove</button>
          </div>
          <div class="course-card-body">
            <p><strong>Teacher:</strong> ${course.teacher_name} (${course.teacher_dept})</p>
            <p><strong>Schedule:</strong> ${course.schedule_day} | ${course.start_time} - ${course.end_time}</p>
          </div>
        `;
        coursesList.appendChild(courseCard);
      });
    }

   function removeCourse(courseId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`${API_BASE}/schedule`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course_id: courseId })
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

      const teacher = new Teacher(teacherName, teacherDept);
      const schedule = new Schedule(day, startTime, endTime);
      const newCourse = new Course(code, name, teacher, schedule);

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