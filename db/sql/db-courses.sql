-- Insert sample courses into course_list
INSERT INTO course_list (program_id, year_level, semester, code, name, teacher_name, teacher_dept, schedule_day, start_time, end_time) VALUES
('CS', 1, 'First', 'CS101', 'Intro to Programming', 'Prof. Garcia', 'Computer Science', 'Monday', '09:00', '11:00'),
('CS', 2, 'Second', 'CS102', 'Data Structures', 'Prof. Smith', 'Computer Science', 'Wednesday', '10:00', '12:00'),
('IT', 1, 'First', 'IT201', 'Network Fundamentals', 'Prof. Johnson', 'Information Technology', 'Tuesday', '14:00', '16:00'),
('IT', 2, 'Second', 'IT202', 'System Administration', 'Prof. Williams', 'Information Technology', 'Thursday', '09:00', '11:00');