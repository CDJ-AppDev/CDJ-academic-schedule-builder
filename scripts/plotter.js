document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

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

    let schedules = [];
    let selectedSchedule = null;

    // Fetch schedules
    try {
        const response = await fetch('/api/schedule', {
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

        blocksContainer.innerHTML = ''; // Clear previous

        const bgColor = customColor.value || '#10b981';

        selectedSchedule.courses.forEach(course => {
            // Wait, what if the backend doesn't have start_time yet?
            // Let's add mock fallback if undefined for presentation purposes since teammates are working on it.
            const startTime = course.start_time || '09:00:00';
            const endTime = course.end_time || '11:00:00';
            const day = course.schedule_day || 'Monday';
            const room = course.room_code || 'TBA';

            plotBlock(course, day, startTime, endTime, room, bgColor);
        });
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

    function plotBlock(course, day, startTime, endTime, room, bgColor) {
        const startMins = parseTime(startTime);
        const endMins = parseTime(endTime);

        // Grid starts at 7:00 AM (7 * 60 = 420 mins)
        const dayStartMins = 7 * 60;

        // Ensure within bounds
        if (startMins < dayStartMins) return;

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

        // Content
        if (!hideCode.checked) {
            const codeEl = document.createElement('div');
            codeEl.className = 'subject-code';
            codeEl.textContent = course.course_id || course.code;
            block.appendChild(codeEl);
        }

        if (!hideName.checked) {
            const nameEl = document.createElement('div');
            nameEl.className = 'subject-name';
            nameEl.textContent = course.name;
            block.appendChild(nameEl);
        }

        if (!hideProf.checked) {
            const profEl = document.createElement('div');
            profEl.className = 'prof-name';
            profEl.textContent = course.teacher_name || 'Prof. TBA';
            block.appendChild(profEl);
        }

        if (!hideDay.checked) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-text';
            dayEl.textContent = day;
            block.appendChild(dayEl);
        }

        if (!hideTime.checked) {
            const timeEl = document.createElement('div');
            timeEl.className = 'time-text';
            timeEl.textContent = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
            block.appendChild(timeEl);
        }

        if (!hideRoom.checked) {
            const roomEl = document.createElement('div');
            roomEl.className = 'room-text';
            roomEl.textContent = room;
            block.appendChild(roomEl);
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
