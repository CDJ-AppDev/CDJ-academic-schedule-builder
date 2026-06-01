const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, adminOnly } = require('../middleware/auth');

router.use(authenticateToken, adminOnly);

// Programs
router.get('/programs', asyncHandler(async (req, res) => {
  const data = await adminService.getPrograms();
  res.json(data);
}));
router.post('/programs', asyncHandler(async (req, res) => {
  const { programid, programname, totalyears, semestertype, defaultunits } = req.body;
  if (!programid || !programname || !totalyears || !semestertype || !defaultunits) {
    return res.status(400).json({ error: 'All program fields are required' });
  }
  await adminService.createProgram(req.body);
  res.status(201).json({ message: 'Program created and terms generated successfully' });
}));
router.put('/programs/:id', asyncHandler(async (req, res) => {
  const { programid, programname, totalyears, semestertype, defaultunits } = req.body;
  if (!programid || !programname || !totalyears || !semestertype || !defaultunits) {
    return res.status(400).json({ error: 'All program fields are required' });
  }
  await adminService.updateProgram(req.params.id, req.body);
  res.json({ message: 'Program updated successfully' });
}));
router.delete('/programs/:id', asyncHandler(async (req, res) => {
  await adminService.deleteProgram(req.params.id);
  res.json({ message: 'Program and all connected terms/courses deleted successfully' });
}));

// Users
router.get('/users', asyncHandler(async (req, res) => {
  const data = await adminService.getUsers();
  res.json(data);
}));
router.post('/users', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const userid = await adminService.createUser(req.body);
  res.status(201).json({ message: 'User created successfully', userid });
}));
router.put('/users/:id', asyncHandler(async (req, res) => {
  await adminService.updateUser(req.params.id, req.body);
  res.json({ message: 'User updated successfully' });
}));
router.put('/users/:id/make-admin', asyncHandler(async (req, res) => {
  await adminService.makeUserAdmin(req.params.id);
  res.json({ message: 'User updated to Admin access successfully' });
}));
router.put('/users/:id/remove-admin', asyncHandler(async (req, res) => {
  await adminService.removeUserAdmin(req.params.id);
  res.json({ message: 'User updated to Default access successfully' });
}));
router.delete('/users/:id', asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.json({ message: 'User deleted successfully' });
}));

// Terms
router.get('/terms', asyncHandler(async (req, res) => {
  const data = await adminService.getTerms();
  res.json(data);
}));
router.post('/terms', asyncHandler(async (req, res) => {
  await adminService.createTerm(req.body);
  res.status(201).json({ message: 'Term created successfully' });
}));
router.put('/terms/:id', asyncHandler(async (req, res) => {
  await adminService.updateTerm(req.params.id, req.body);
  res.json({ message: 'Term updated successfully' });
}));
router.delete('/terms/:id', asyncHandler(async (req, res) => {
  await adminService.deleteTerm(req.params.id);
  res.json({ message: 'Term deleted successfully' });
}));

// Courses
router.get('/courses', asyncHandler(async (req, res) => {
  const data = await adminService.getCourses();
  res.json(data);
}));
router.post('/courses', asyncHandler(async (req, res) => {
  await adminService.createCourse(req.body);
  res.status(201).json({ message: 'Course created successfully' });
}));
router.put('/courses/:code', asyncHandler(async (req, res) => {
  await adminService.updateCourse(req.params.code, req.body);
  res.json({ message: 'Course updated successfully' });
}));
router.delete('/courses/:code', asyncHandler(async (req, res) => {
  await adminService.deleteCourse(req.params.code);
  res.json({ message: 'Course and connected course slots deleted successfully' });
}));

// Professors
router.get('/professors', asyncHandler(async (req, res) => {
  const data = await adminService.getProfessors();
  res.json(data);
}));
router.post('/professors', asyncHandler(async (req, res) => {
  const profid = await adminService.createProfessor(req.body);
  res.status(201).json({ message: 'Professor created successfully', profid });
}));
router.put('/professors/:id', asyncHandler(async (req, res) => {
  await adminService.updateProfessor(req.params.id, req.body);
  res.json({ message: 'Professor updated successfully' });
}));
router.delete('/professors/:id', asyncHandler(async (req, res) => {
  await adminService.deleteProfessor(req.params.id);
  res.json({ message: 'Professor deleted successfully, connected course slots updated to NULL' });
}));

// Course Slots
router.get('/courseslots', asyncHandler(async (req, res) => {
  const data = await adminService.getCourseSlots();
  res.json(data);
}));
router.post('/courseslots', asyncHandler(async (req, res) => {
  await adminService.createCourseSlot(req.body);
  res.status(201).json({ message: 'Course slot created successfully' });
}));
router.put('/courseslots/:id', asyncHandler(async (req, res) => {
  await adminService.updateCourseSlot(req.params.id, req.body);
  res.json({ message: 'Course slot updated successfully' });
}));
router.delete('/courseslots/:id', asyncHandler(async (req, res) => {
  await adminService.deleteCourseSlot(req.params.id);
  res.json({ message: 'Course slot deleted successfully' });
}));

// Schedules
router.get('/schedules', asyncHandler(async (req, res) => {
  const data = await adminService.getSchedules();
  res.json(data);
}));
router.delete('/schedules/:id', asyncHandler(async (req, res) => {
  await adminService.deleteSchedule(req.params.id);
  res.json({ message: 'Schedule deleted successfully' });
}));

module.exports = router;
