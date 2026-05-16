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
    // First, fetch the user's current program/term
    const programResponse = await fetch(`${API_BASE}/program`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const programData = await programResponse.json();
    if (!programData) {
      availableCoursesList.innerHTML = '<p style="color: #999;">Please select a program first.</p>';
      return;
    }

    // Extract program_id and construct termId (e.g., "CS4", "IT1")
    const termId = programData.program_id + programData.year_level;
    currentTermId = termId;

    // Fetch all available courses
    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const allCourses = await response.json();
    
    // Filter courses to only show those matching the current term
    availableCourses = allCourses.filter(course => 
      `${course.program_id}${course.year_level}` === termId
    );
    
    displayAvailableCourses();
  } catch (error) {
    console.error('Error loading courses:', error);
    availableCoursesList.innerHTML = '<p style="color: #999;">Error loading courses.</p>';
  }
}

    function displayAvailableCourses() {
      availableCoursesList.innerHTML = '';
      
      if (availableCourses.length === 0) {
        availableCoursesList.innerHTML = '<p style="color: #999;">No available courses for your term.</p>';
        return;
      }

      // Group courses by course code to aggregate their slots
      const courseMap = {};
      availableCourses.forEach((courseData) => {
        if (!courseMap[courseData.code]) {
          courseMap[courseData.code] = {
            code: courseData.code,
            name: courseData.name,
            course_id: courseData.course_id,
            program_id: courseData.program_id,
            year_level: courseData.year_level,
            semester: courseData.semester,
            slots: []
          };
        }
        
        // Add slot if it has schedule information
        if (courseData.schedule && courseData.schedule.day) {
          courseMap[courseData.code].slots.push({
            day: courseData.schedule.day,
            startTime: courseData.schedule.startTime,
            endTime: courseData.schedule.endTime,
            teacher: courseData.teacher
          });
        }
      });

      // Display each unique course with all its slots
      Object.values(courseMap).forEach((course, index) => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        // Build slots HTML
        const slotsHTML = course.slots.length > 0
          ? course.slots.map(slot => `
              <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>${slot.day}</strong> | ${slot.startTime} - ${slot.endTime}</p>
                ${slot.teacher && slot.teacher.name ? `<p style="margin: 4px 0; font-size: 0.9em;">Prof. ${slot.teacher.name}</p>` : ''}
              </div>
            `).join('')
          : '<p style="color: #999; font-size: 0.9em;">Schedule TBD</p>';
        
        courseCard.innerHTML = `
          <div class="course-card-header">
            <h3>${course.code} - ${course.name}</h3>
            <button class="btn-add" onclick="addAvailableCourse('${course.code}')">Add</button>
          </div>
          <div class="course-card-body">
            <div style="margin-top: 8px;">
              ${slotsHTML}
            </div>
          </div>
        `;
        availableCoursesList.appendChild(courseCard);
      });
    }

   function addAvailableCourse(courseCode) {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Find the course_id from availableCourses that matches this code
  const courseData = availableCourses.find(c => c.code === courseCode);
  if (!courseData) {
    console.error('Course not found:', courseCode);
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
    // Remove all slots of this course from available and refresh
    availableCourses = availableCourses.filter(c => c.code !== courseCode);
    displayAvailableCourses();
    loadUserSchedule(); // Load user's schedule
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