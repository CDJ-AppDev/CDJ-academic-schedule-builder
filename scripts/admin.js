document.addEventListener('DOMContentLoaded', () => {
  populateUsers();
  populateCourses();
  populateSchedules();
  populateProfessors();
});

function switchTab(tabId) {
  // Hide all contents
  document.querySelectorAll('.admin-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active from all tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected content
  document.getElementById(`${tabId}-tab`).classList.add('active');
  
  // Activate selected tab
  event.currentTarget.classList.add('active');
}

function populateUsers() {
  const users = [
    { id: 'U001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Student', status: 'Active' },
    { id: 'U002', name: 'Bob Smith', email: 'bob@example.com', role: 'Student', status: 'Inactive' },
    { id: 'U003', name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
    { id: 'U004', name: 'Diana Prince', email: 'diana@example.com', role: 'Professor', status: 'Active' },
  ];

  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.status}</td>
    </tr>
  `).join('');
}

function populateCourses() {
  const courses = [
    { code: 'CS101', title: 'Introduction to Computer Science', credits: 3, dept: 'Computer Science' },
    { code: 'MATH201', title: 'Calculus I', credits: 4, dept: 'Mathematics' },
    { code: 'ENG101', title: 'English Composition', credits: 3, dept: 'English' },
    { code: 'PHYS101', title: 'Physics for Engineers', credits: 4, dept: 'Physics' },
  ];

  const tbody = document.getElementById('courses-tbody');
  tbody.innerHTML = courses.map(course => `
    <tr>
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.credits}</td>
      <td>${course.dept}</td>
    </tr>
  `).join('');
}

function populateSchedules() {
  const schedules = [
    { id: 'S001', user: 'Alice Johnson', term: 'Fall 2026', courses: 4, date: '2026-05-10' },
    { id: 'S002', user: 'Bob Smith', term: 'Fall 2026', courses: 3, date: '2026-05-12' },
    { id: 'S003', user: 'Alice Johnson', term: 'Spring 2027', courses: 5, date: '2026-05-15' },
  ];

  const tbody = document.getElementById('schedules-tbody');
  tbody.innerHTML = schedules.map(schedule => `
    <tr>
      <td>${schedule.id}</td>
      <td>${schedule.user}</td>
      <td>${schedule.term}</td>
      <td>${schedule.courses}</td>
      <td>${schedule.date}</td>
    </tr>
  `).join('');
}

function populateProfessors() {
  const professors = [
    { id: 'P001', name: 'Dr. Alan Turing', dept: 'Computer Science', email: 'alan@university.edu' },
    { id: 'P002', name: 'Dr. Isaac Newton', dept: 'Mathematics', email: 'isaac@university.edu' },
    { id: 'P003', name: 'Dr. Marie Curie', dept: 'Physics', email: 'marie@university.edu' },
  ];

  const tbody = document.getElementById('professors-tbody');
  tbody.innerHTML = professors.map(prof => `
    <tr>
      <td>${prof.id}</td>
      <td>${prof.name}</td>
      <td>${prof.dept}</td>
      <td>${prof.email}</td>
    </tr>
  `).join('');
}
