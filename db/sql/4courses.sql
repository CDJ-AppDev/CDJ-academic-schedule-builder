-- COURSES
INSERT INTO COURSE (CourseCode, TermID, CourseName, CourseUnits) VALUES
('CS101', 'CS1', 'Course Name', 3),
('CS102', 'CS1', 'Course Name', 3),
('CS201', 'CS2', 'Course Name', 3),
('CS202', 'CS2', 'Course Name', 3),
('CS301', 'CS3', 'Course Name', 3),
('CS302', 'CS3', 'Course Name', 3),
('CS401', 'CS4', 'Course Name', 3),
('CS402', 'CS4', 'Course Name', 3),
('CS501', 'CS5', 'Course Name', 3),
('CS502', 'CS5', 'Course Name', 3),
('CS601', 'CS6', 'Course Name', 3),
('CS602', 'CS6', 'Course Name', 3),
('CS701', 'CS7', 'Course Name', 3),
('CS702', 'CS7', 'Course Name', 3),
('CS801', 'CS8', 'Course Name', 3),
('CS802', 'CS8', 'Course Name', 3),

('IT101', 'IT1', 'Course Name', 3),
('IT102', 'IT1', 'Course Name', 3),
('IT201', 'IT2', 'Course Name', 3),
('IT202', 'IT2', 'Course Name', 3),
('IT301', 'IT3', 'Course Name', 3),
('IT302', 'IT3', 'Course Name', 3),
('IT401', 'IT4', 'Course Name', 3),
('IT402', 'IT4', 'Course Name', 3),
('IT501', 'IT5', 'Course Name', 3),
('IT502', 'IT5', 'Course Name', 3),
('IT601', 'IT6', 'Course Name', 3),
('IT602', 'IT6', 'Course Name', 3),
('IT701', 'IT7', 'Course Name', 3),
('IT702', 'IT7', 'Course Name', 3),
('IT801', 'IT8', 'Course Name', 3),
('IT802', 'IT8', 'Course Name', 3);

-- TIMESLOTS
INSERT INTO COURSESLOT (
    CourseCode,
    ProfID,
    StartTime,
    EndTime,
    ScheduleDay,
    RoomCode
) VALUES
('CS101', 1, '08:00', '09:30', 'Monday', 'R101'),
('CS101', 1, '08:00', '09:30', 'Wednesday', 'R101'),

('CS102', 2, '10:00', '11:30', 'Monday', 'R102'),
('CS102', 2, '10:00', '11:30', 'Wednesday', 'R102'),

('CS201', 3, '13:00', '14:30', 'Tuesday', 'R201'),
('CS201', 3, '13:00', '14:30', 'Thursday', 'R201'),

('CS202', 1, '15:00', '16:30', 'Tuesday', 'R202'),
('CS202', 1, '15:00', '16:30', 'Thursday', 'R202'),

('IT101', 4, '08:00', '09:30', 'Tuesday', 'Lab1'),
('IT101', 4, '08:00', '09:30', 'Friday', 'Lab1'),

('IT102', 4, '10:00', '11:30', 'Tuesday', 'Lab2'),
('IT102', 4, '10:00', '11:30', 'Friday', 'Lab2'),

('IT201', 5, '13:00', '14:30', 'Monday', 'Lab3'),
('IT201', 5, '13:00', '14:30', 'Wednesday', 'Lab3'),

('IT202', 6, '15:00', '16:30', 'Monday', 'Lab4'),
('IT202', 6, '15:00', '16:30', 'Wednesday', 'Lab4');