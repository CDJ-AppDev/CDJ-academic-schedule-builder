class Professor {
  constructor(profId, name, department) {
    this.profId = profId;
    this.name = name;
    this.department = department;
  }
}

class CourseSlot {
  constructor(courseSlotId, courseCode, profId, startTime, endTime, day, room) {
    this.courseSlotId = courseSlotId;
    this.courseCode = courseCode;
    this.profId = profId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.day = day;
    this.room = room;
  }
}

class Course {
  constructor(courseCode, termId, name, units, slots = []) {
    this.courseCode = courseCode;
    this.termId = termId;
    this.name = name;
    this.units = units;
    this.slots = slots; // Array of CourseSlot objects
  }
}