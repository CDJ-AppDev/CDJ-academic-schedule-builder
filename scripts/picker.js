
    // Course, Year, and Semester Picker Functionality - Single Selection Only
    const courseRadios = document.getElementsByName('course-picker');
    const yearRadios = document.getElementsByName('year-picker');
    const semesterRadios = document.getElementsByName('semester-picker');
    const applyBtn = document.getElementById('apply-courses-btn');
    const selectedCoursesDisplay = document.getElementById('selected-courses');
    const schedulePickerBtn = document.getElementById('schedule-picker-btn');

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
      } else {
        window.history.replaceState({}, document.title, 'coursepicker.html');
        selectedCoursesDisplay.textContent = '';
        schedulePickerBtn.setAttribute('hidden', '');
      }
    }

    applyBtn.addEventListener('click', updateURL);

    // Load saved course, year, and semester from URL on page load
    window.addEventListener('load', () => {
      const params = new URLSearchParams(window.location.search);
      const course = params.get('course');
      const year = params.get('year');
      const semester = params.get('semester');
      
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
          
          selectedCoursesDisplay.textContent = `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;
          schedulePickerBtn.removeAttribute('hidden');
        }
      }
    });