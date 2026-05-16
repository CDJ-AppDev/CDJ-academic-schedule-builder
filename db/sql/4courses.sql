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

('CS301', 2, '08:00', '09:30', 'Tuesday', 'R301'),
('CS301', 2, '08:00', '09:30', 'Friday', 'R301'),

('CS302', 3, '10:00', '11:30', 'Tuesday', 'R302'),
('CS302', 3, '10:00', '11:30', 'Friday', 'R302'),

('CS401', 1, '13:00', '14:30', 'Monday', 'R401'),
('CS401', 1, '13:00', '14:30', 'Wednesday', 'R401'),

('CS402', 2, '15:00', '16:30', 'Monday', 'R402'),
('CS402', 2, '15:00', '16:30', 'Wednesday', 'R402'),

('CS501', 3, '08:00', '09:30', 'Wednesday', 'R501'),
('CS501', 3, '08:00', '09:30', 'Friday', 'R501'),

('CS502', 1, '10:00', '11:30', 'Wednesday', 'R502'),
('CS502', 1, '10:00', '11:30', 'Friday', 'R502'),

('CS601', 2, '13:00', '14:30', 'Monday', 'R601'),
('CS601', 2, '13:00', '14:30', 'Thursday', 'R601'),

('CS602', 3, '15:00', '16:30', 'Monday', 'R602'),
('CS602', 3, '15:00', '16:30', 'Thursday', 'R602'),

('CS701', 1, '08:00', '09:30', 'Tuesday', 'R701'),
('CS701', 1, '08:00', '09:30', 'Thursday', 'R701'),

('CS702', 2, '10:00', '11:30', 'Tuesday', 'R702'),
('CS702', 2, '10:00', '11:30', 'Thursday', 'R702'),

('CS801', 3, '13:00', '14:30', 'Wednesday', 'R801'),
('CS801', 3, '13:00', '14:30', 'Friday', 'R801'),

('CS802', 1, '15:00', '16:30', 'Wednesday', 'R802'),
('CS802', 1, '15:00', '16:30', 'Friday', 'R802'),

('IT101', 4, '08:00', '09:30', 'Tuesday', 'Lab1'),
('IT101', 4, '08:00', '09:30', 'Friday', 'Lab1'),

('IT102', 4, '10:00', '11:30', 'Tuesday', 'Lab2'),
('IT102', 4, '10:00', '11:30', 'Friday', 'Lab2'),

('IT201', 5, '13:00', '14:30', 'Monday', 'Lab3'),
('IT201', 5, '13:00', '14:30', 'Wednesday', 'Lab3'),

('IT202', 6, '15:00', '16:30', 'Monday', 'Lab4'),
('IT202', 6, '15:00', '16:30', 'Wednesday', 'Lab4'),

('IT301', 4, '08:00', '09:30', 'Wednesday', 'Lab5'),
('IT301', 4, '08:00', '09:30', 'Friday', 'Lab5'),

('IT302', 5, '10:00', '11:30', 'Wednesday', 'Lab6'),
('IT302', 5, '10:00', '11:30', 'Friday', 'Lab6'),

('IT401', 6, '13:00', '14:30', 'Tuesday', 'Lab7'),
('IT401', 6, '13:00', '14:30', 'Thursday', 'Lab7'),

('IT402', 4, '15:00', '16:30', 'Tuesday', 'Lab8'),
('IT402', 4, '15:00', '16:30', 'Thursday', 'Lab8'),

('IT501', 5, '08:00', '09:30', 'Monday', 'Lab9'),
('IT501', 5, '08:00', '09:30', 'Thursday', 'Lab9'),

('IT502', 6, '10:00', '11:30', 'Monday', 'Lab10'),
('IT502', 6, '10:00', '11:30', 'Thursday', 'Lab10'),

('IT601', 4, '13:00', '14:30', 'Wednesday', 'Lab11'),
('IT601', 4, '13:00', '14:30', 'Friday', 'Lab11'),

('IT602', 5, '15:00', '16:30', 'Wednesday', 'Lab12'),
('IT602', 5, '15:00', '16:30', 'Friday', 'Lab12'),

('IT701', 6, '08:00', '09:30', 'Monday', 'Lab13'),
('IT701', 6, '08:00', '09:30', 'Tuesday', 'Lab13'),

('IT702', 4, '10:00', '11:30', 'Monday', 'Lab14'),
('IT702', 4, '10:00', '11:30', 'Tuesday', 'Lab14'),

('IT801', 5, '13:00', '14:30', 'Thursday', 'Lab15'),
('IT801', 5, '13:00', '14:30', 'Friday', 'Lab15'),

('IT802', 6, '15:00', '16:30', 'Thursday', 'Lab16'),
('IT802', 6, '15:00', '16:30', 'Friday', 'Lab16');
