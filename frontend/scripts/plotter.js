/**
 * @file plotter.js
 * @description Controls the Timetable Visualizer workspace. Fetches saved schedules, generates absolute-positioned timeline grid overlays, supports custom background/font themes, and exports timetables as PNG images using html2canvas.
 */

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

    // UI Option Toggle Nodes
    const hideProf = document.getElementById('hide-prof');
    const hideCode = document.getElementById('hide-code');
    const hideName = document.getElementById('hide-name');
    const hideTime = document.getElementById('hide-time');
    const hideDay = document.getElementById('hide-day');
    const hideRoom = document.getElementById('hide-room');
    const customColor = document.getElementById('custom-color');
    const customFontColor = document.getElementById('custom-font-color');

    /** @type {Array<Object>} */
    let schedules = [];
    /** @type {Object|null} */
    let selectedSchedule = null;

    // Fetch active schedule lists on page initialization
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

    /**
     * Renders user schedules inside the selection side-bar panel.
     */
    function renderScheduleList() {
        scheduleListContainer.innerHTML = '';
        if (schedules.length === 0) {
            scheduleListContainer.innerHTML = '<div class="plotter-schedule-item"><span>No schedules found.</span></div>';
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
                // Clear selection on other listings
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

    // Timetable Plot Trigger
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            if (!selectedSchedule) {
                alert('Please select a schedule first.');
                return;
            }

            const captureArea = document.getElementById('capture-area');
            if (captureArea) captureArea.classList.add('visible');
            if (btnSavePng) btnSavePng.classList.add('visible');

            blocksContainer.innerHTML = ''; // Clear previous grids

            // Resolve color selection presets
            const bgColor = customColor.value || '#FFFFFF';
            const fontColor = customFontColor.value || '#000000';

            // Loop through all courses inside the active schedule
            if (selectedSchedule.courses && selectedSchedule.courses.length > 0) {
                selectedSchedule.courses.forEach(course => {
                    let startTime, endTime, day, room, courseCode, courseName, profName;
                    const isIrregular = !course.courseslot_id;

                    if (course.schedule) {
                        // Standard API curriculum path
                        startTime = course.schedule.startTime || '09:00:00';
                        endTime = course.schedule.endTime || '11:00:00';
                        day = course.schedule.day || 'Monday';
                        room = course.schedule.room || 'TBA';
                        courseCode = course.code || course.course_id || 'TBA';
                        courseName = course.name || 'TBA';
                        profName = course.teacher_name || 'Prof. TBA';
                    } else if (course.slots && course.slots.length > 0) {
                        // Manual irregular schedule path
                        const slot = course.slots[0];
                        startTime = slot.startTime || '09:00:00';
                        endTime = slot.endTime || '11:00:00';
                        day = slot.day || 'Monday';
                        room = slot.room || 'TBA';
                        courseCode = course.courseCode || 'TBA';
                        courseName = course.name || 'TBA';
                        profName = (slot.profId?.name) || 'Prof. TBA';
                    } else {
                        // Unified offline properties path
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
                    }, day, startTime, endTime, room, bgColor, fontColor, isIrregular);
                });
            } else {
                alert('This schedule has no courses.');
            }
        });
    }

    /**
     * Resolves a time string into minutes.
     * @param {string} timeString - Format "HH:MM:SS" or "HH:MM"
     * @returns {number|null} Decoded minutes count
     */
    function parseTime(timeString) {
        return window.APP_UTILS ? window.APP_UTILS.timeStringToMinutes(timeString) : null;
    }

    /**
     * Resolves a weekday string to its index in the schedule grid.
     * @param {string} dayStr - Day string (e.g. 'Monday')
     * @returns {number} 0-indexed column offset
     */
    function getDayIndex(dayStr) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const index = days.findIndex(d => d.toLowerCase() === dayStr.toLowerCase());
        return index >= 0 ? index : 0;
    }

    /**
     * Draws an absolute positioned course block on the timetable grid canvas.
     * Renders parameters through .textContent properties natively protecting against XSS scripts.
     * @param {Object} course - Decoded course info
     * @param {string} day - Day label
     * @param {string} startTime - Slot start time
     * @param {string} endTime - Slot end time
     * @param {string} room - Room label
     * @param {string} bgColor - Hex/HSL color
     * @param {string} fontColor - Hex/HSL color
     * @param {boolean} [isIrregular] - Irregular schedule flag
     */
    function plotBlock(course, day, startTime, endTime, room, bgColor, fontColor, isIrregular = false) {
        const startMins = parseTime(startTime);
        const endMins = parseTime(endTime);
        const dayStartMins = 7 * 60; // Grid origin starts at 7:00 AM

        if (startMins < dayStartMins) return;

        // Mathematical conversion: 1 minute = 1 pixel vertical height
        const topPx = startMins - dayStartMins;
        const heightPx = endMins - startMins;

        const dayIndex = getDayIndex(day);
        const leftPercent = dayIndex * (100 / 6);
        const widthPercent = 100 / 6;

        const block = document.createElement('div');
        block.className = 'course-block';
        if (isIrregular) {
            block.className += ' irregular-block';
        }
        block.style.top = `${topPx}px`;
        block.style.height = `${heightPx}px`;
        block.style.left = `${leftPercent}%`;
        block.style.width = `${widthPercent}%`;
        block.style.backgroundColor = bgColor;
        block.style.color = fontColor;
        block.style.border = `2px solid ${fontColor}`;

        if (isIrregular) {
            block.style.border = `2px dashed ${fontColor || 'rgba(255,255,255,0.85)'}`;
        }

        // 1. Course Code
        if (!hideCode.checked) {
            const codeEl = document.createElement('div');
            codeEl.className = 'subject-code';
            codeEl.textContent = (course.code || course.course_id || 'TBA') + (isIrregular ? ' (IRR)' : '');
            block.appendChild(codeEl);
        }

        // 2. Course Name
        if (!hideName.checked) {
            const nameEl = document.createElement('div');
            nameEl.className = 'subject-name';
            nameEl.textContent = course.name || 'TBA';
            block.appendChild(nameEl);
        }

        // 3. Professor Name
        if (!hideProf.checked) {
            const profEl = document.createElement('div');
            profEl.className = 'prof-name';
            const profName = course.teacher?.name || course.teacher_name || 'Prof. TBA';
            profEl.textContent = profName;
            block.appendChild(profEl);
        }

        // 4. Schedule Day and Room
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

        // 5. Time
        if (!hideTime.checked) {
            const timeEl = document.createElement('div');
            timeEl.className = 'time-text';
            timeEl.textContent = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
            block.appendChild(timeEl);
        }

        blocksContainer.appendChild(block);
    }

    // Save PNG exporter click event listener
    if (btnSavePng) {
        btnSavePng.addEventListener('click', async () => {
            if (typeof html2canvas === 'undefined') {
                alert('html2canvas library is not loaded.');
                return;
            }
            const captureArea = document.getElementById('capture-area');

            try {
                const canvas = await html2canvas(captureArea, {
                    backgroundColor: null,
                    scale: 2 // High Resolution scaling
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
    }
});
