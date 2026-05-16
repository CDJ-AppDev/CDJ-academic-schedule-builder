
// Subject schedule picker + course track/year/semester picker
// This file previously only handled course/year/semester selection (coursepicker.html).
// It now also exposes an initializer for subjectschedule.html.

// Course, Year, and Semester Picker Functionality - Single Selection Only
const courseRadios = document.getElementsByName('course-picker');
const yearRadios = document.getElementsByName('year-picker');
const semesterRadios = document.getElementsByName('semester-picker');
const applyBtn = document.getElementById('apply-courses-btn');
const selectedCoursesDisplay = document.getElementById('selected-courses');
const schedulePickerBtn = document.getElementById('schedule-picker-btn');


function saveToLocalStorage() {
  const selectedCourse = Array.from(courseRadios).find(radio => radio.checked);
  const selectedYear = Array.from(yearRadios).find(radio => radio.checked);
  const selectedSemester = Array.from(semesterRadios).find(radio => radio.checked);

  if (selectedCourse && selectedYear && selectedSemester) {
    const data = {
      course: selectedCourse.value,
      year: selectedYear.value,
      semester: selectedSemester.value
    };
    localStorage.setItem('courseSelection', JSON.stringify(data));
  }
}

function updateURL() {
  const selectedCourse = Array.from(courseRadios).find(radio => radio.checked);
  const selectedYear = Array.from(yearRadios).find(radio => radio.checked);
  const selectedSemester = Array.from(semesterRadios).find(radio => radio.checked);

  if (selectedCourse && selectedYear && selectedSemester) {
    const url = `coursepicker.html?course=${selectedCourse.value}&year=${selectedYear.value}&semester=${selectedSemester.value}`;
    window.history.replaceState({}, document.title, url);

    const courseLabel = selectedCourse.value === 'computer-science' ? 'Computer Science' : 'IT';
    const yearLabel = `${selectedYear.value}${['st', 'nd', 'rd', 'th'][parseInt(selectedYear.value) - 1]} Year`;
    const semesterLabel = `${selectedSemester.value}${['st', 'nd'][parseInt(selectedSemester.value) - 1]} Semester`;

    selectedCoursesDisplay.textContent = `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;
    schedulePickerBtn.removeAttribute('hidden');

    saveToLocalStorage();
  } else {
    window.history.replaceState({}, document.title, 'coursepicker.html');
    selectedCoursesDisplay.textContent = '';
    schedulePickerBtn.setAttribute('hidden', '');
  }
}

if (applyBtn) applyBtn.addEventListener('click', updateURL);

// Load saved course, year, and semester from localStorage or URL on page load
window.addEventListener('load', () => {
  let course, year, semester;

  // First, try to load from localStorage
  const savedData = localStorage.getItem('courseSelection');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      course = data.course;
      year = data.year;
      semester = data.semester;
    } catch (e) {
      console.error('Error parsing saved course selection:', e);
    }
  }

  // If no localStorage data, try URL parameters
  if (!course && !year && !semester) {
    const params = new URLSearchParams(window.location.search);
    course = params.get('course');
    year = params.get('year');
    semester = params.get('semester');
  }

  if (course && year && semester) {
    const courseRadio = Array.from(courseRadios).find(r => r.value === course);
    const yearRadio = Array.from(yearRadios).find(r => r.value === year);
    const semesterRadio = Array.from(semesterRadios).find(r => r.value === semester);

    if (courseRadio && yearRadio && semesterRadio) {
      courseRadio.checked = true;
      yearRadio.checked = true;
      semesterRadio.checked = true;

      const courseLabel = course === 'computer-science' ? 'Computer Science' : 'IT';
      const yearLabel = `${year}${['st', 'nd', 'rd', 'th'][parseInt(year) - 1]} Year`;
      const semesterLabel = `${semester}${['st', 'nd'][parseInt(semester) - 1]} Semester`;

      if (selectedCoursesDisplay) selectedCoursesDisplay.textContent = `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;
      if (schedulePickerBtn) schedulePickerBtn.removeAttribute('hidden');
    }
  }
});

// ------------------------------
// Subject schedule UI support
// ------------------------------

function initSubjectSchedulePicker({
  apiBase = 'http://localhost:3000/api',
  availableCoursesContainerId = 'availableCourses',
  scheduledListContainerId = 'scheduledList'
} = {}) {
  const availableCoursesEl = document.getElementById(availableCoursesContainerId);
  const scheduledListEl = document.getElementById(scheduledListContainerId);
  if (!availableCoursesEl || !scheduledListEl) return;

  const token = localStorage.getItem('token');
  availableCoursesEl.innerHTML = '';

  if (!token) {
    availableCoursesEl.innerHTML = '<p style="color:#999;">Please login first.</p>';
    return;
  }

  const selected = (() => {
    const saved = localStorage.getItem('courseSelection');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  })();

  // Fetch all courses; backend may already filter. If not, we apply client-side best-effort.
  fetch(`${apiBase}/courses`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API error ${res.status}: ${text}`);
      }
      return res.json();
    })
    .then((courses) => {
      if (!Array.isArray(courses) || courses.length === 0) {
        availableCoursesEl.innerHTML = '<p style="color:#999;">No courses found.</p>';
        return;
      }

      let filtered = courses;
      if (selected) {
        // Best-effort filtering based on common field names.
        const track = selected.course;
        const year = String(selected.year);
        const semester = String(selected.semester);

        filtered = courses.filter((c) => {
          const y = c.year ?? c.academic_year ?? c.course_year;
          const s = c.semester ?? c.academic_semester;
          const t = c.track ?? c.program ?? c.course_track ?? c.course;

          const yearOk = y == null ? true : String(y) === year;
          const semOk = s == null ? true : String(s) === semester;
          const trackOk = t == null ? true : String(t) === track;
          return yearOk && semOk && trackOk;
        });
      }

      renderAvailableCourses(filtered, availableCoursesEl);

      // init scheduled list from session/local? keep empty for now
      scheduledListEl.innerHTML = '';
    })
    .catch((err) => {
      console.error(err);
      availableCoursesEl.innerHTML = '<p style="color:#999;">Error loading courses.</p>';
    });
}

function renderAvailableCourses(courses, availableCoursesEl) {
  availableCoursesEl.innerHTML = '';

  // Group by course code+name so multiple sections can be expanded (simple grouping).
  const grouped = new Map();
  for (const c of courses) {
    const key = `${c.code} - ${c.name}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(c);
  }

  for (const [key, items] of grouped.entries()) {
    // keep only one expanded at a time
    const existingDropdowns = availableCoursesEl.querySelectorAll('.dropdown');
    const existingArrows = availableCoursesEl.querySelectorAll('.arrow');
    existingDropdowns.forEach((d) => d.classList.remove('active'));
    existingArrows.forEach((a) => a.classList.remove('rotate'));

    const arrowId = `arrow-${Math.random().toString(16).slice(2)}`;
    const dropdownId = `dropdown-${Math.random().toString(16).slice(2)}`;

    const header = document.createElement('div');
    header.className = 'course-card-header';
    header.style.borderRadius = '12px';
    header.style.cursor = 'pointer';

    header.innerHTML = `
      <h3 style="margin:0; font-size: 1rem;">${key}</h3>
      <span class="arrow" id="${arrowId}" style="font-size: 1.2rem; transition: transform 0.3s;">⌄</span>
    `;

    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.margin = '0';

    header.onclick = () => {
      const dropdown = card.querySelector(`#${dropdownId}`);
      const arrow = card.querySelector(`#${arrowId}`);
      dropdown.classList.toggle('active');
      arrow.classList.toggle('rotate');
    };

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.id = dropdownId;
    dropdown.style.overflow = 'hidden';
    dropdown.style.maxHeight = '0';
    dropdown.style.transition = 'max-height 0.4s ease';

    const body = document.createElement('div');
    body.className = 'course-card-body';
    body.style.padding = '14px 16px 16px';

    dropdown.innerHTML = '';

    for (const courseData of items) {
      const option = document.createElement('div');
      option.className = 'course-card';
      option.style.background = 'rgba(255,255,255,0.05)';
      option.style.borderRadius = '12px';
      option.style.borderColor = 'rgba(0,0,0,0.08)';
      option.style.marginTop = '0';

      const teacherName = courseData.teacher?.name ?? 'N/A';
      const scheduleStr = `${courseData.schedule?.day ?? ''} | ${courseData.schedule?.startTime ?? ''} - ${courseData.schedule?.endTime ?? ''}`.trim();

      option.innerHTML = `
        <div class="course-card-body">
          <p style="margin:0 0 10px; font-weight: 700;">TEACHER: ${teacherName}</p>
          <p style="margin:0; color: rgba(0,0,0,0.7);">Schedule: ${scheduleStr}</p>
          <div style="display:flex; justify-content:flex-end; margin-top: 12px;">
            <button class="btn-add" type="button">ADD</button>
          </div>
        </div>
      `;

      option.querySelector('.btn-add').onclick = () => {
        const scheduleObj = courseData.schedule
          ? new Schedule(courseData.schedule.day, courseData.schedule.startTime, courseData.schedule.endTime)
          : null;

        const teacherObj = courseData.teacher
          ? new Teacher(courseData.teacher.name, courseData.teacher.department)
          : null;

        const courseObj = new Course(courseData.code, courseData.name, teacherObj, scheduleObj);

        addCourseToScheduledList({
          courseObj,
          displayCourse: `${courseData.code} - ${courseData.name}`,
          displayTeacher: teacherName,
          displaySchedule: scheduleStr,
          courseId: courseData.course_id
        });
      };

      dropdown.appendChild(option);
      if (dropdown.children.length > 1) option.style.marginTop = '12px';
    }

    body.style.padding = '0';
    body.appendChild(dropdown);

    card.appendChild(header);
    card.appendChild(body);

    // Ensure only one dropdown height rule is controlled via CSS classes.
    availableCoursesEl.appendChild(card);
  }

  // Inject minimal CSS for active dropdown behavior if not already present.
  if (!document.getElementById('subject-schedule-inline-style')) {
    const style = document.createElement('style');
    style.id = 'subject-schedule-inline-style';
    style.textContent = `.dropdown.active{max-height:320px;} .arrow.rotate{transform:rotate(180deg);}`;
    document.head.appendChild(style);
  }
}

function addCourseToScheduledList({
  courseObj,
  displayCourse,
  displayTeacher,
  displaySchedule,
  courseId
}) {
  const scheduledListEl = document.getElementById('scheduledList');
  if (!scheduledListEl) return;

  const card = document.createElement('div');
  card.className = 'course-card';

  card.innerHTML = `
    <div class="course-card-header">
      <h3 style="margin:0; font-size: 1rem;">${displayCourse}</h3>
      <span style="opacity:0.7; font-weight:700;">▸</span>
    </div>
    <div class="course-card-body">
      <p style="margin: 0 0 8px; font-weight: 700;">${displayTeacher}</p>
      <p style="margin: 0; color: rgba(0,0,0,0.7);">${displaySchedule}</p>
      <div style="display:flex; justify-content:flex-end; margin-top: 12px;">
        <button class="btn-remove" type="button">REMOVE</button>
      </div>
    </div>
  `;

  card.querySelector('.btn-remove').addEventListener('click', () => card.remove());
  scheduledListEl.appendChild(card);
}
