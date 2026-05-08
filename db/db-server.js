require('dotenv').config();
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
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO user_login (name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [name, email, hashedPassword]
    );
    res.status(201).json({ user_id: result.rows[0].user_id });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM user_login WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get courses
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM course_list');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add course to user schedule
app.post('/api/schedule', authenticateToken, async (req, res) => {
  const { course_id } = req.body;
  try {
    await pool.query('INSERT INTO user_schedule (user_id, course_id) VALUES ($1, $2)', [req.user.user_id, course_id]);
    res.status(201).json({ message: 'Course added to schedule' });
  } catch (error) {
    res.status(400).json({ error: 'Course already in schedule or invalid' });
  }
});

// Get user schedule
app.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.* FROM course_list c
      JOIN user_schedule us ON c.course_id = us.course_id
      WHERE us.user_id = $1
    `, [req.user.user_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove course from user schedule
app.delete('/api/schedule', authenticateToken, async (req, res) => {
  const { course_id } = req.body;
  try {
    await pool.query('DELETE FROM user_schedule WHERE user_id = $1 AND course_id = $2', [req.user.user_id, course_id]);
    res.json({ message: 'Course removed from schedule' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));