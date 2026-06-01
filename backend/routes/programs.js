const express = require('express');
const router = express.Router();
const programService = require('../services/programService');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  try {
    const programs = await programService.getPrograms();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}));

module.exports = router;
