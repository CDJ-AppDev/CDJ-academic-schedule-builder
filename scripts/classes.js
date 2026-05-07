class Teacher {
  constructor(name, department) {
    this.name = name;
    this.department = department;
  }
}

class Schedule {
  constructor(day, startTime, endTime) {
    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

class Course {
  constructor(code, name, teacher, schedule) {
    this.code = code;
    this.name = name;
    this.teacher = teacher;
    this.schedule = schedule;
  }
}
let courses = [];
let availableCourses = [];
