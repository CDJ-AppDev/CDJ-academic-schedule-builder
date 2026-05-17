document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const API_BASE = 'http://localhost:3000/api';
    const scheduleListContainer = document.getElementById('plotter-schedule-list');
    const btnGenerate = document.getElementById('btn-generate');
    const btnSavePng = document.getElementById('btn-save-png');
    const blocksContainer = document.getElementById('blocks-container');

    // Checkboxes
    const hideProf = document.getElementById('hide-prof');
    const hideCode = document.getElementById('hide-code');
    const hideName = document.getElementById('hide-name');
    const hideTime = document.getElementById('hide-time');
    const hideDay = document.getElementById('hide-day');
    const hideRoom = document.getElementById('hide-room');
    const customColor = document.getElementById('custom-color');
    const customFontColor = document.getElementById('custom-font-color');

    let schedules = [];
    let selectedSchedule = null;

    // Fetch schedules from database
    try {
        const response = await fetch(`${API_BASE}/schedule`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            schedules = await response.json();
            renderScheduleList();
        } else {
            scheduleListContainer.innerHTML = '<div class="plotter-schedule-item"><span>Failed to load schedules.</span></div>';
        }
    } catch (error) {
        console.error('Error fetching schedules:', error);
        scheduleListContainer.innerHTML = '<div class="plotter-schedule-item"><span>Error connecting to server.</span></div>';
    }

    function renderScheduleList() {
        scheduleListContainer.innerHTML = '';
        if (schedules.length === 0) {
            scheduleListContainer.innerHTML = '<div class="plotter-schedule-item"><span>No schedules found. Create one in the Schedule Picker!</span></div>';
            return;
        }

        schedules.forEach((schedule, index) => {
            const item = document.createElement('div');
            item.className = 'plotter-schedule-item';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `Schedule ${index + 1} - ${schedule.schedule_name || 'My Schedule'}`;

            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-green';
            btnAdd.textContent = 'ADD';

            btnAdd.addEventListener('click', () => {
                // Deselect all others
                document.querySelectorAll('.plotter-schedule-item .btn-green').forEach(btn => {
                    btn.classList.remove('selected');
                    btn.textContent = 'ADD';
                });

                selectedSchedule = schedule;
                btnAdd.classList.add('selected');
                btnAdd.textContent = 'SELECTED';
            });

            item.appendChild(nameSpan);
            item.appendChild(btnAdd);
            scheduleListContainer.appendChild(item);
        });
    }

    btnGenerate.addEventListener('click', () => {
        if (!selectedSchedule) {
            alert('Please select a schedule first.');
            return;
        }

        // Show the timetable canvas and save button
        const captureArea = document.getElementById('capture-area');
        captureArea.classList.add('visible');
        btnSavePng.classList.add('visible');

        blocksContainer.innerHTML = ''; // Clear previous

        // Get custom colors, with defaults
        const bgColor = customColor.value || '#000000';
        const fontColor = customFontColor.value || '#FFFFFF';

        // Plot all courses in the selected schedule
        if (selectedSchedule.courses && selectedSchedule.courses.length > 0) {
            selectedSchedule.courses.forEach(course => {
                // Extract course data with proper field mapping
                // Handle both API courses and manual courses
                let startTime, endTime, day, room, courseCode, courseName, profName;

                if (course.schedule) {
                    // API courses have schedule object
                    startTime = course.schedule.startTime || '09:00:00';
                    endTime = course.schedule.endTime || '11:00:00';
                    day = course.schedule.day || 'Monday';
                    room = course.schedule.room || 'TBA';
                    courseCode = course.code || course.course_id || 'TBA';
                    courseName = course.name || 'TBA';
                    profName = course.teacher_name || 'Prof. TBA';
                } else if (course.slots && course.slots.length > 0) {
                    // Manual courses have slots array
                    const slot = course.slots[0];
                    startTime = slot.startTime || '09:00:00';
                    endTime = slot.endTime || '11:00:00';
                    day = slot.day || 'Monday';
                    room = slot.room || 'TBA';
                    courseCode = course.courseCode || 'TBA';
                    courseName = course.name || 'TBA';
                    profName = (slot.profId?.name) || 'Prof. TBA';
                } else {
                    // Fallback if structure is unclear
                    startTime = course.startTime || course.start_time || '09:00:00';
                    endTime = course.endTime || course.end_time || '11:00:00';
                    day = course.day || course.schedule_day || 'Monday';
                    room = course.room || course.room_code || 'TBA';
                    courseCode = course.code || course.courseCode || course.course_id || 'TBA';
                    courseName = course.name || 'TBA';
                    profName = course.teacher_name || course.profName || 'Prof. TBA';
                }

                plotBlock({
                    code: courseCode,
                    name: courseName,
                    teacher_name: profName
                }, day, startTime, endTime, room, bgColor, fontColor);
            });
        } else {
            alert('This schedule has no courses.');
        }
    });

    function parseTime(timeString) {
        // timeString format "HH:MM:SS" or "HH:MM"
        const parts = timeString.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    function getDayIndex(dayStr) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const index = days.findIndex(d => d.toLowerCase() === dayStr.toLowerCase());
        return index >= 0 ? index : 0;
    }

    function plotBlock(course, day, startTime, endTime, room, bgColor, fontColor) {
        const startMins = parseTime(startTime);
        const endMins = parseTime(endTime);

        // Grid starts at 7:00 AM (7 * 60 = 420 mins)
        const dayStartMins = 7 * 60;

        // Ensure within bounds
        if (startMins < dayStartMins) return;

        // Each hour = 60px, so minutes and pixels are 1:1
        const topPx = startMins - dayStartMins;
        const heightPx = endMins - startMins;

        const dayIndex = getDayIndex(day);
        const leftPercent = dayIndex * (100 / 6);
        const widthPercent = 100 / 6;

        const block = document.createElement('div');
        block.className = 'course-block';
        block.style.top = `${topPx}px`;
        block.style.height = `${heightPx}px`;
        block.style.left = `${leftPercent}%`;
        block.style.width = `${widthPercent}%`;
        block.style.backgroundColor = bgColor;
        block.style.color = fontColor;

        // Add course info to block based on checkbox states
        // Course Code
        if (!hideCode.checked) {
            const codeEl = document.createElement('div');
            codeEl.className = 'subject-code';
            codeEl.textContent = course.code || course.course_id || 'TBA';
            block.appendChild(codeEl);
        }

        // Course Name
        if (!hideName.checked) {
            const nameEl = document.createElement('div');
            nameEl.className = 'subject-name';
            nameEl.textContent = course.name || 'TBA';
            block.appendChild(nameEl);
        }

        // Professor Name
        if (!hideProf.checked) {
            const profEl = document.createElement('div');
            profEl.className = 'prof-name';
            const profName = course.teacher?.name || course.teacher_name || 'Prof. TBA';
            profEl.textContent = profName;
            block.appendChild(profEl);
        }

        // Schedule Day and Room (combined format)
        if (!hideDay.checked || !hideRoom.checked) {
            const dayRoomEl = document.createElement('div');
            dayRoomEl.className = 'day-room-text';
            let dayRoomText = '';
            
            if (!hideDay.checked) {
                dayRoomText += day;
            }
            
            if (!hideRoom.checked) {
                dayRoomText += dayRoomText ? ` (${room})` : `(${room})`;
            }
            
            dayRoomEl.textContent = dayRoomText;
            block.appendChild(dayRoomEl);
        }

        // Time
        if (!hideTime.checked) {
            const timeEl = document.createElement('div');
            timeEl.className = 'time-text';
            timeEl.textContent = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
            block.appendChild(timeEl);
        }

        blocksContainer.appendChild(block);
    }

    // Save as PNG logic
    btnSavePng.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') {
            alert('html2canvas library is not loaded.');
            return;
        }
        const captureArea = document.getElementById('capture-area');

        try {
            const canvas = await html2canvas(captureArea, {
                backgroundColor: null,
                scale: 2 // better quality
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = 'My_Schedule.png';
            link.click();
        } catch (err) {
            console.error('Failed to capture PNG:', err);
            alert('Failed to save as PNG. Please try again.');
        }
    });
});
