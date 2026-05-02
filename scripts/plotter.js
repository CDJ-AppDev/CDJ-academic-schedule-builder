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

    let availableCourses = [];

    // Load available courses from JSON
    async function loadAvailableCourses() {
      try {
        // const response = await fetch('../db/courses.json');
        // availableCourses = await response.json();
        availableCourses = [
              {
                "code": "CS101",
                "name": "Intro to Programming",
                "teacher": {
                  "name": "Prof. Garcia",
                  "department": "Computer Science"
                },
                "schedule": {
                  "day": "Monday",
                  "startTime": "09:00",
                  "endTime": "11:00"
                }
              },
              {
                "code": "CS102",
                "name": "Data Structures",
                "teacher": {
                  "name": "Prof. Smith",
                  "department": "Computer Science"
                },
                "schedule": {
                  "day": "Wednesday",
                  "startTime": "10:00",
                  "endTime": "12:00"
                }
              },
              {
                "code": "IT201",
                "name": "Network Fundamentals",
                "teacher": {
                  "name": "Prof. Johnson",
                  "department": "Information Technology"
                },
                "schedule": {
                  "day": "Tuesday",
                  "startTime": "14:00",
                  "endTime": "16:00"
                }
              },
              {
                "code": "IT202",
                "name": "System Administration",
                "teacher": {
                  "name": "Prof. Williams",
                  "department": "Information Technology"
                },
                "schedule": {
                  "day": "Thursday",
                  "startTime": "09:00",
                  "endTime": "11:00"
                }
              }
            ]
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
  // 1. Remove from availableCourses array and get the object
  const [courseData] = availableCourses.splice(index, 1);
  
  // 2. Create the class instances
  const teacher = new Teacher(courseData.teacher.name, courseData.teacher.department);
  const schedule = new Schedule(courseData.schedule.day, courseData.schedule.startTime, courseData.schedule.endTime);
  const newCourse = new Course(courseData.code, courseData.name, teacher, schedule);

  // 3. Add to the active courses array
  courses.push(newCourse);
  
  // 4. Refresh both lists
  displayCourses();
  displayAvailableCourses();
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
            <button class="btn-remove" onclick="removeCourse(${index})">Remove</button>
          </div>
          <div class="course-card-body">
            <p><strong>Teacher:</strong> ${course.teacher.name} (${course.teacher.department})</p>
            <p><strong>Schedule:</strong> ${course.schedule.day} | ${course.schedule.startTime} - ${course.schedule.endTime}</p>
          </div>
        `;
        coursesList.appendChild(courseCard);
      });
    }

   function removeCourse(index) {
  // 1. Remove from courses array and get the object
  const [removedCourse] = courses.splice(index, 1);
  
  // 2. Format it back to match your availableCourses structure
  const formattedCourse = {
    code: removedCourse.code,
    name: removedCourse.name,
    teacher: {
      name: removedCourse.teacher.name,
      department: removedCourse.teacher.department
    },
    schedule: {
      day: removedCourse.schedule.day,
      startTime: removedCourse.schedule.startTime,
      endTime: removedCourse.schedule.endTime
    }
  };

  // 3. Add back to availableCourses
  availableCourses.push(formattedCourse);
  
  // 4. Refresh both lists
  displayCourses();
  displayAvailableCourses();
}

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

    displayCourses();
    loadAvailableCourses();