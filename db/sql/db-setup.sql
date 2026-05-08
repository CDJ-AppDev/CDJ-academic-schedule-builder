-- Create user_login table
CREATE TABLE user_login (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create user_program table
CREATE TABLE user_program (
    user_id INT REFERENCES user_login(user_id),
    program_id VARCHAR(50),
    year_level INT,
    semester VARCHAR(50),
    PRIMARY KEY (user_id, program_id)
);

-- Create course_list table
CREATE TABLE course_list (
    course_id SERIAL PRIMARY KEY,
    program_id VARCHAR(50),
    year_level INT,
    semester VARCHAR(50),
    code VARCHAR(50),
    name VARCHAR(255),
    teacher_name VARCHAR(255),
    teacher_dept VARCHAR(255),
    schedule_day VARCHAR(50),
    start_time TIME,
    end_time TIME
);

-- Create user_schedule table
CREATE TABLE user_schedule (
    user_id INT REFERENCES user_login(user_id),
    course_id INT REFERENCES course_list(course_id),
    PRIMARY KEY (user_id, course_id)
);