const express = require('express');
const router = express.Router();
const courseService = require('../services/courseService');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

router.get('/courses', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const courses = await courseService.getCourses(req.user.user_id);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}));

router.get('/schedule', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const schedules = await courseService.getSchedule(req.user.user_id);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}));

router.put('/schedule', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const result = await courseService.saveSchedule(req.user.user_id, req.body);
    res.json({ message: 'Schedule saved successfully', schedule_id: result.schedule_id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}));

router.delete('/schedule', authenticateToken, asyncHandler(async (req, res) => {
  const { courseslot_id, schedule_id } = req.body;
  try {
    await courseService.removeCourseFromSchedule(req.user.user_id, courseslot_id, schedule_id);
    res.json({ message: 'Course removed from schedule' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}));

router.delete('/schedule/:id', authenticateToken, asyncHandler(async (req, res) => {
  const scheduleId = req.params.id;
  try {
    await courseService.deleteSchedule(req.user.user_id, scheduleId);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}));

module.exports = router;
