const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES (LOWER($1), $2, $3) RETURNING userid',
      [email, hashedPassword, 'Default']
    );

    // Create user profile with email as temporary username (will be updated during setup)
    await pool.query(
      'INSERT INTO user_profile (userid, username) VALUES ($1, $2)',
      [result.rows[0].userid, email]
    );

    res.status(201).json({ user_id: result.rows[0].userid });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for email:', email);

    const result = await pool.query(
      'SELECT uc.userid, uc.userpassword, up.username FROM user_credentials uc LEFT JOIN user_profile up ON uc.userid = up.userid WHERE LOWER(uc.useremail) = LOWER($1)',
      [email]
    );

    console.log('Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    console.log('User found, checking password');

    if (!user.userpassword) {
      return res.status(400).json({ error: 'User password not found' });
    }

    const validPassword = await bcrypt.compare(password, user.userpassword);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const token = jwt.sign({ user_id: user.userid }, process.env.JWT_SECRET);
    res.json({ token, user: { user_id: user.userid, name: user.username, email: email } });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get courses
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT termid FROM user_profile WHERE userid = $1',
      [req.user.user_id]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].termid) {
      return res.json([]);
    }

    const userTermId = userResult.rows[0].termid;

    const result = await pool.query(`
      SELECT
        c.coursecode as course_id,
        c.coursecode as code,
        c.coursename as name,
        c.courseunits as units,
        cs.courseslotid as courseslot_id,
        t.programid as program_id,
        t.yearlevel as year_level,
        t.semester as semester,
        p.profname as teacher_name,
        p.profdepartment as teacher_dept,
        cs.scheduleday as schedule_day,
        cs.starttime as start_time,
        cs.endtime as end_time,
        cs.roomcode as room
      FROM course c
      JOIN term t ON c.termid = t.termid
      LEFT JOIN courseslot cs ON c.coursecode = cs.coursecode
      LEFT JOIN professor p ON cs.profid = p.profid
      WHERE c.termid = $1 AND cs.courseslotid IS NOT NULL
      ORDER BY c.coursecode
    `, [userTermId]);
    const courses = result.rows.map(row => ({
      course_id: row.course_id,
      courseslot_id: row.courseslot_id,
      code: row.code,
      name: row.name,
      units: row.units,
      program_id: row.program_id,
      year_level: row.year_level,
      semester: row.semester,
      teacher: {
        name: row.teacher_name,
        department: row.teacher_dept
      },
      schedule: {
        day: row.schedule_day,
        startTime: row.start_time,
        endTime: row.end_time,
        room: row.room
      }
    }));
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/schedule was removed as saving is now handled via PUT

// Get user schedule
app.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT scheduleid, schedulename, schedulelist, totalunits FROM schedule WHERE userid = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.json([]);
    }

    // For each schedule, get the course details
    const schedules = [];
    for (const schedule of result.rows) {
      const list = schedule.schedulelist || [];
      const courseslotIds = list.filter(item => item.courseslot_id).map(item => item.courseslot_id);

      let formattedCourses = [];
      if (courseslotIds.length > 0) {
        const courseResult = await pool.query(`
          SELECT 
            c.coursecode as course_id,
            cs.courseslotid as courseslot_id,
            c.coursecode as code,
            c.coursename as name,
            c.courseunits as units,
            t.programid as program_id,
            p.profname as teacher_name,
            cs.scheduleday as schedule_day,
            cs.starttime as start_time,
            cs.endtime as end_time,
            cs.roomcode as room
          FROM courseslot cs
          JOIN course c ON cs.coursecode = c.coursecode
          JOIN term t ON c.termid = t.termid
          LEFT JOIN professor p ON cs.profid = p.profid
          WHERE cs.courseslotid = ANY($1::integer[])
        `, [courseslotIds]);

        formattedCourses = courseResult.rows.map(row => ({
          course_id: row.course_id,
          courseslot_id: row.courseslot_id,
          code: row.code,
          name: row.name,
          units: row.units,
          program_id: row.program_id,
          teacher_name: row.teacher_name,
          schedule: {
            day: row.schedule_day,
            startTime: row.start_time,
            endTime: row.end_time,
            room: row.room
          }
        }));
      }

      const manualCourses = list.filter(item => item.courseCode);
      const allCourses = [...formattedCourses, ...manualCourses];

      schedules.push({
        schedule_id: schedule.scheduleid,
        schedule_name: schedule.schedulename,
        courses: allCourses,
        total_units: schedule.totalunits
      });
    }

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Finalize and save schedule name and total units
app.put('/api/schedule', authenticateToken, async (req, res) => {
  const { schedule_id, schedule_name, total_units, regular, schedule_list } = req.body;

  try {
    let result;
    if (schedule_id) {
      result = await pool.query(
        'UPDATE schedule SET schedulename = $1, totalunits = $2, regular = $3, schedulelist = $4, updatedat = CURRENT_TIMESTAMP WHERE scheduleid = $5 AND userid = $6 RETURNING scheduleid',
        [schedule_name || 'My Schedule', total_units || 0, regular !== undefined ? regular : true, JSON.stringify(schedule_list || []), schedule_id, req.user.user_id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
    } else {
      result = await pool.query(
        'INSERT INTO schedule (userid, schedulename, totalunits, regular, schedulelist) VALUES ($1, $2, $3, $4, $5) RETURNING scheduleid',
        [req.user.user_id, schedule_name || 'My Schedule', total_units || 0, regular !== undefined ? regular : true, JSON.stringify(schedule_list || [])]
      );
    }

    res.json({ message: 'Schedule saved successfully', schedule_id: result.rows[0].scheduleid });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove course from user schedule
app.delete('/api/schedule', authenticateToken, async (req, res) => {
  const { courseslot_id, schedule_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE schedule 
       SET schedulelist = (
         SELECT jsonb_agg(item) 
         FROM jsonb_array_elements(schedulelist) item 
         WHERE item->>'courseslot_id' != $1
       )
       WHERE scheduleid = $2 AND userid = $3
       RETURNING scheduleid`,
      [courseslot_id.toString(), schedule_id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Course removed from schedule' });
  } catch (error) {
    console.error('Error removing course from schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete full user schedule
app.delete('/api/schedule/:id', authenticateToken, async (req, res) => {
  const scheduleId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM schedule WHERE scheduleid = $1 AND userid = $2 RETURNING scheduleid',
      [scheduleId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save user program selection and full name (name is optional)
app.post('/api/term', authenticateToken, async (req, res) => {
  const { name, program_id, year_level, semester } = req.body;

  // Validate required fields
  if (!program_id || year_level === undefined || !semester) {
    return res.status(400).json({ error: 'Missing required fields: program_id, year_level, semester' });
  }

  console.log('Received program save request:', { user_id: req.user.user_id, name, program_id, year_level, semester });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the TermID based on program_id, year_level, and semester
    const termResult = await client.query(
      'SELECT termid FROM term WHERE programid = $1 AND yearlevel = $2 AND semester = $3',
      [program_id, year_level, semester]
    );

    if (termResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid program, year level, or semester combination' });
    }

    const termID = termResult.rows[0].termid;
    console.log('Found termID:', termID);

    // Update user profile with selected term, and name if provided
    let updateResult;
    if (name) {
      console.log('Updating with name:', name);
      updateResult = await client.query(
        'UPDATE user_profile SET username = $1, termid = $2 WHERE userid = $3 RETURNING userid',
        [name, termID, req.user.user_id]
      );
    } else {
      console.log('Updating termid only');
      updateResult = await client.query(
        'UPDATE user_profile SET termid = $1 WHERE userid = $2 RETURNING userid',
        [termID, req.user.user_id]
      );
    }

    console.log('Update result rows:', updateResult.rows.length);

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error('No rows updated for userid:', req.user.user_id);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    await client.query('COMMIT');
    console.log('TermID selection saved successfully for user:', req.user.user_id);
    res.status(201).json({ message: 'Program selection saved', user_id: req.user.user_id, term_id: termID });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving TermID selection:', error);
    res.status(500).json({ error: 'Failed to save TermID selection', details: error.message });
  } finally {
    client.release();
  }
});

// Get user term selection
app.get('/api/term', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.programid as program_id, t.yearlevel as year_level, t.semester as semester, t.requnits as req_units
       FROM user_profile up
       JOIN term t ON up.termid = t.termid
       WHERE up.userid = $1`,
      [req.user.user_id]
    );

    if (result.rows.length > 0) {
      console.log('Term found for user:', req.user.user_id, result.rows[0]);
      res.json(result.rows[0]);
    } else {
      console.log('No term found for user:', req.user.user_id);
      res.json(null);
    }
  } catch (error) {
    console.error('Error retrieving term selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));