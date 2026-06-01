const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('WARNING: nodemailer is not installed locally. SMTP features will fallback to console logging.');
}

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  process.env.JWT_SECRET;
const IV_LENGTH = 16;

const isProd = process.env.NODE_ENV === 'production';
const logDebug = (...args) => {
  if (!isProd) console.log(...args);
};

if (isProd && !process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Authenticated routes will fail in production.');
}
if (isProd && !process.env.ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY is not set. Password encryption uses JWT_SECRET fallback.');
}

// Nodemailer SMTP Transporter setup (Kubernetes-ready, dynamic env validation)
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
let transporter;

if (smtpConfigured && nodemailer) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' // avoid strict cert errors in local dev
      }
    });
    logDebug('Nodemailer SMTP Transporter initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Nodemailer SMTP Transporter:', err);
  }
} else {
  logDebug('Nodemailer not configured: password reset emails will be logged locally.');
}

/**
 * Sends a password reset email using the configured SMTP transporter.
 * If SMTP parameters are missing, falls back to logging the reset link and writing a local preview file.
 * @param {string} to - Destination email address
 * @param {string} resetLink - Complete URL to reset the password
 */
async function sendResetPinEmail(to, pin) {
  const fromEmail = process.env.FROM_EMAIL;
  
  const textContent = `You requested a password reset. Please use the following 6-digit PIN to reset your password:\n\n${pin}\n\nThis PIN will expire in 1 hour. If you did not request this, please ignore this email.`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center;">Academic Schedule Builder</h2>
      <hr style="border: none; border-top: 1px solid #eeeeee;" />
      <p style="color: #666666; font-size: 16px;">Hello,</p>
      <p style="color: #666666; font-size: 16px;">We received a request to reset your password. Please use the secure 6-digit verification PIN below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f4f4f4; color: #333333; letter-spacing: 8px; font-family: monospace; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 6px; display: inline-block; border: 1px dashed #cccccc;">
          ${pin}
        </div>
      </div>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 30px;" />
      <p style="color: #999999; font-size: 12px; text-align: center;">This PIN will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
    </div>
  `;

  if (smtpConfigured && transporter) {
    await transporter.sendMail({
      from: `"Academic Schedule Builder" <${fromEmail}>`,
      to,
      subject: 'Reset your password - Verification PIN',
      text: textContent,
      html: htmlContent
    });
  } else {
    // Development fallback: Log email details and save to mock file
    logDebug('\n==================================================');
    logDebug('[DEV MOCK EMAIL DISPATCH]');
    logDebug(`FROM: ${fromEmail}`);
    logDebug(`TO: ${to}`);
    logDebug('SUBJECT: Reset your password - Verification PIN');
    logDebug(`PIN: ${pin}`);
    logDebug('==================================================\n');

    const logDir = path.join(__dirname, 'logs', 'password-resets');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const sanitizedTo = to.replace(/[^a-zA-Z0-9]/g, '_');
    const logFile = path.join(logDir, `${Date.now()}-${sanitizedTo}.html`);
    fs.writeFileSync(logFile, `
      <p><strong>To:</strong> ${to}</p>
      <p><strong>Subject:</strong> Reset your password - Verification PIN</p>
      <p><strong>PIN:</strong> ${pin}</p>
      <hr/>
      ${htmlContent}
    `);
    logDebug(`Mock email preview written to: ${logFile}`);
  }
}

/**
 * Encrypts cleartext using AES-256-CBC.
 * Useful for securing credentials inside the database.
 * @param {string} text - Cleartext to encrypt
 * @returns {string} Encrypted string in format "hexIv:hexEncryptedText"
 */
function encrypt(text) {
  try {
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
}

/**
 * Decrypts AES-256-CBC encrypted strings.
 * Supports legacy fallback mappings for standard mock passwords.
 * @param {string} text - Encrypted text to decrypt
 * @returns {string} Decrypted cleartext password
 */
function decrypt(text) {
  try {
    if (!text) return '';

    if (!text.includes(':')) {
      return text;
    }
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Decryption error:', e);
    return text;
  }
}

/**
 * Converts a 24-hour time string ("HH:MM" or "HH:MM:SS") into integer minutes since midnight.
 * Declared centrally to prevent code duplication in course slot parsing.
 * @param {string} str - Time string to parse
 * @returns {number|null} Number of minutes, or null if invalid format
 */
const parseTimeToMins = (str) => {
  if (!str) return null;
  const parts = str.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Auto-initialize refresh tokens table for zero-config deployments
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS REFRESH_TOKENS (
        ID SERIAL PRIMARY KEY,
        UserID INT NOT NULL REFERENCES USER_CREDENTIALS(UserID) ON DELETE CASCADE,
        Token VARCHAR(500) NOT NULL UNIQUE,
        ExpiresAt TIMESTAMP NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON REFRESH_TOKENS(Token);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_userid ON REFRESH_TOKENS(UserID);`);
    logDebug('Database refresh token table auto-initialized successfully.');
  } catch (err) {
    console.error('Error auto-initializing database refresh token table:', err);
  }
})();

/**
 * Express Middleware to verify JWT authentication token from request headers.
 * Populates req.user with decoded token data (e.g. user_id) on success.
 * @param {express.Request} req - Express request
 * @param {express.Response} res - Express response
 * @param {express.NextFunction} next - Express next router function
 */
const authenticateToken = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    // Critical configuration: without a secret we cannot verify JWTs.
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isPlausibleEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Signup endpoint
app.post('/api/signup', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!isPlausibleEmail(normalizedEmail) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const encryptedPassword = encrypt(password);
  try {
    const result = await pool.query(
      'INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES (LOWER($1), $2, $3) RETURNING userid',
      [normalizedEmail, encryptedPassword, 'Default']
    );

    // Create user profile with email as temporary username (updated during setup)
    await pool.query(
      'INSERT INTO user_profile (userid, username) VALUES ($1, $2)',
      [result.rows[0].userid, normalizedEmail]
    );

    res.status(201).json({ user_id: result.rows[0].userid });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw error;
  }
}));

// Login endpoint
app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!isPlausibleEmail(normalizedEmail) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const result = await pool.query(
    'SELECT uc.userid, uc.userpassword, uc.useraccess, up.username FROM user_credentials uc LEFT JOIN user_profile up ON uc.userid = up.userid WHERE LOWER(uc.useremail) = LOWER($1)',
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'User not found' });
  }

  const user = result.rows[0];
  if (!user.userpassword) {
    return res.status(400).json({ error: 'User password not found' });
  }
  const validPassword = (decrypt(user.userpassword) === password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

  // Generate short-lived Access Token (15 minutes)
  const token = jwt.sign({ user_id: user.userid }, process.env.JWT_SECRET, { expiresIn: '15m' });
  
  // Generate long-lived Refresh Token (7 days)
  const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
  const refreshToken = jwt.sign({ user_id: user.userid }, refreshSecret, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Clean up any previously expired refresh tokens for this user to prevent db bloat
  await pool.query('DELETE FROM REFRESH_TOKENS WHERE UserID = $1 AND ExpiresAt < CURRENT_TIMESTAMP', [user.userid]);

  // Insert the fresh refresh token into the database
  await pool.query(
    'INSERT INTO REFRESH_TOKENS (UserID, Token, ExpiresAt) VALUES ($1, $2, $3)',
    [user.userid, refreshToken, expiresAt]
  );

  res.json({ 
    token, 
    refreshToken,
    user: { user_id: user.userid, name: user.username, email: normalizedEmail, access: user.useraccess } 
  });
}));

// Refresh Token Endpoint with RTR (Refresh Token Rotation)
app.post('/api/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');

  // Verify the refresh token structure & signature
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshSecret);
  } catch (err) {
    // If the token is structure-wise expired/invalid, purge it from our DB
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  // Verify the token exists in the database
  const dbResult = await pool.query(
    'SELECT UserID, ExpiresAt FROM REFRESH_TOKENS WHERE Token = $1',
    [refreshToken]
  );

  if (dbResult.rows.length === 0) {
    return res.status(401).json({ error: 'Refresh token not recognized or already rotated' });
  }

  const { userid, expiresat } = dbResult.rows[0];

  // Double check expiration dates
  if (new Date() > new Date(expiresat)) {
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  // Implement RTR (Refresh Token Rotation): Generate a new pair
  const token = jwt.sign({ user_id: userid }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ user_id: userid }, refreshSecret, { expiresIn: '7d' });
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Invalidate the old refresh token
    await client.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    
    // Insert the new one
    await client.query(
      'INSERT INTO REFRESH_TOKENS (UserID, Token, ExpiresAt) VALUES ($1, $2, $3)',
      [userid, newRefreshToken, newExpiresAt]
    );

    await client.query('COMMIT');
    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during token rotation:', err);
    res.status(500).json({ error: 'Server error rotating tokens' });
  } finally {
    client.release();
  }
}));

// Revoke Refresh Token (Logout)
app.post('/api/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
  }
  res.json({ message: 'Successfully logged out' });
}));

// Forgot Password Endpoint
app.post('/api/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!isPlausibleEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user exists
  const userResult = await pool.query(
    'SELECT useremail FROM user_credentials WHERE LOWER(useremail) = LOWER($1)',
    [normalizedEmail]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'This email address is not registered in our database.', exists: false });
  }

  const userEmail = userResult.rows[0].useremail;

  // Generate a 6-digit numeric PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

  // Save token/pin to database
  await pool.query(
    'INSERT INTO PASSWORD_RESET_TOKEN (UserEmail, Token, ExpiresAt) VALUES ($1, $2, $3)',
    [userEmail, pin, expiresAt]
  );

  await sendResetPinEmail(userEmail, pin);

  res.json({ message: 'If that email address exists in our database, we will send a password reset PIN.' });
}));

// Reset Password Endpoint
app.post('/api/reset-password', asyncHandler(async (req, res) => {
  const { token, pin, email, password } = req.body;
  
  // Accept 'pin' or 'token' (for maximum compatibility with frontend)
  const resetPin = pin || token;
  
  const normalizedEmail = normalizeEmail(email);
  if (!resetPin || !isNonEmptyString(password) || !isPlausibleEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Email, PIN, and new password are required' });
  }

  // Look up the token/pin in database under matching useremail
  const tokenResult = await pool.query(
    'SELECT UserEmail, ExpiresAt FROM PASSWORD_RESET_TOKEN WHERE Token = $1 AND LOWER(UserEmail) = LOWER($2)',
    [resetPin, normalizedEmail]
  );

  if (tokenResult.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid reset PIN or email' });
  }

  const { useremail, expiresat } = tokenResult.rows[0];

  // Check expiration
  if (new Date() > new Date(expiresat)) {
    // Remove expired token
    await pool.query('DELETE FROM PASSWORD_RESET_TOKEN WHERE Token = $1', [resetPin]);
    return res.status(400).json({ error: 'Reset PIN has expired' });
  }

  // Encrypt the new password
  const encryptedPassword = encrypt(password);

  // Update password inside database
  await pool.query(
    'UPDATE user_credentials SET userpassword = $1 WHERE LOWER(useremail) = LOWER($2)',
    [encryptedPassword, useremail]
  );

  // Delete token from database to prevent double usage
  await pool.query('DELETE FROM PASSWORD_RESET_TOKEN WHERE Token = $1', [resetPin]);

  res.json({ message: 'Password has been reset successfully.' });
}));

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

    // Multi-join query: resolves courses + their term mapping + optional timeslot/professor.
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
      JOIN course_term ct ON c.coursecode = ct.coursecode
      JOIN term t ON ct.termid = t.termid
      LEFT JOIN courseslot cs ON c.coursecode = cs.coursecode
      LEFT JOIN professor p ON cs.profid = p.profid
      WHERE ct.termid = $1 AND cs.courseslotid IS NOT NULL
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

    // Avoid N+1 queries by fetching all referenced courseslots in one round-trip.
    const scheduleLists = result.rows.map(r => r.schedulelist || []);
    const allCourseSlotIds = scheduleLists
      .flatMap(list => list.filter(item => item?.courseslot_id).map(item => item.courseslot_id))
      .filter(Boolean);

    const coursesBySlotId = new Map();
    if (allCourseSlotIds.length > 0) {
      const courseResult = await pool.query(`
        SELECT 
          c.coursecode as course_id,
          cs.courseslotid as courseslot_id,
          c.coursecode as code,
          c.coursename as name,
          c.courseunits as units,
          -- program_id is derived via an arbitrary term mapping (LIMIT 1) because a course may be attached to multiple terms.
          (SELECT t2.programid FROM course_term ct2 JOIN term t2 ON ct2.termid = t2.termid WHERE ct2.coursecode = c.coursecode LIMIT 1) as program_id,
          p.profname as teacher_name,
          cs.scheduleday as schedule_day,
          cs.starttime as start_time,
          cs.endtime as end_time,
          cs.roomcode as room
        FROM courseslot cs
        JOIN course c ON cs.coursecode = c.coursecode
        LEFT JOIN professor p ON cs.profid = p.profid
        WHERE cs.courseslotid = ANY($1::integer[])
      `, [allCourseSlotIds]);

      for (const row of courseResult.rows) {
        coursesBySlotId.set(row.courseslot_id, {
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
        });
      }
    }

    const schedules = result.rows.map((scheduleRow) => {
      const list = scheduleRow.schedulelist || [];
      const formattedCourses = list
        .filter(item => item?.courseslot_id)
        .map(item => coursesBySlotId.get(item.courseslot_id))
        .filter(Boolean);

      const manualCourses = list.filter(item => item && !item.courseslot_id);
      return {
        schedule_id: scheduleRow.scheduleid,
        schedule_name: scheduleRow.schedulename,
        courses: [...formattedCourses, ...manualCourses],
        total_units: scheduleRow.totalunits
      };
    });

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

  logDebug('Received program save request:', { user_id: req.user.user_id, name, program_id, year_level, semester });

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
    logDebug('Found termID:', termID);

    // Update user profile with selected term, and name if provided
    let updateResult;
    if (name) {
      logDebug('Updating with name:', name);
      updateResult = await client.query(
        'UPDATE user_profile SET username = $1, termid = $2 WHERE userid = $3 RETURNING userid',
        [name, termID, req.user.user_id]
      );
    } else {
      logDebug('Updating termid only');
      updateResult = await client.query(
        'UPDATE user_profile SET termid = $1 WHERE userid = $2 RETURNING userid',
        [termID, req.user.user_id]
      );
    }

    logDebug('Update result rows:', updateResult.rows.length);

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error('No rows updated for userid:', req.user.user_id);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    await client.query('COMMIT');
    logDebug('TermID selection saved successfully for user:', req.user.user_id);
    res.status(201).json({ message: 'Program selection saved', user_id: req.user.user_id, term_id: termID });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving TermID selection:', error);
    res.status(500).json({ error: 'Failed to save TermID selection', details: error.message });
  } finally {
    client.release();
  }
});

// Get user term selection or a specific term by termId
app.get('/api/term', authenticateToken, async (req, res) => {
  const { termId } = req.query;
  try {
    if (termId) {
      const result = await pool.query(
        `SELECT termid as term_id, programid as program_id, yearlevel as year_level, semester as semester, requnits as req_units
         FROM term
         WHERE termid = $1`,
        [termId]
      );
      if (result.rows.length > 0) {
        logDebug('Term found by termId:', termId, result.rows[0]);
        return res.json(result.rows[0]);
      } else {
        logDebug('Term not found by termId:', termId);
        return res.status(404).json({ error: 'Term not found' });
      }
    }

    const result = await pool.query(
      `SELECT t.termid as term_id, t.programid as program_id, t.yearlevel as year_level, t.semester as semester, t.requnits as req_units
       FROM user_profile up
       JOIN term t ON up.termid = t.termid
       WHERE up.userid = $1`,
      [req.user.user_id]
    );

    if (result.rows.length > 0) {
      logDebug('Term found for user:', req.user.user_id, result.rows[0]);
      res.json(result.rows[0]);
    } else {
      logDebug('No term found for user:', req.user.user_id);
      res.json(null);
    }
  } catch (error) {
    console.error('Error retrieving term selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get real-time user session status (for role syncing)
app.get('/api/user-session', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT uc.userid, uc.useremail, uc.userpassword, uc.useraccess, up.username 
       FROM user_credentials uc 
       LEFT JOIN user_profile up ON uc.userid = up.userid 
       WHERE uc.userid = $1`,
      [req.user.user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];

    // Decrypt AES-encrypted password if available
    let decryptedPassword = '';
    if (user.userpassword) {
      decryptedPassword = decrypt(user.userpassword);
    }

    res.json({
      user_id: user.userid,
      name: user.username,
      email: user.useremail,
      password: decryptedPassword,
      access: user.useraccess
    });
  } catch (error) {
    console.error('Error fetching user session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update personal user profile details (username, email, password)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  const { username, email, password } = req.body;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Update email if provided
    if (email) {
      const checkEmail = await client.query(
        'SELECT userid FROM user_credentials WHERE useremail = LOWER($1) AND userid <> $2',
        [email, userId]
      );
      if (checkEmail.rows.length > 0) {
        throw new Error('Email is already taken by another user');
      }

      await client.query(
        'UPDATE user_credentials SET useremail = LOWER($1) WHERE userid = $2',
        [email, userId]
      );
    }

    // Update password if provided
    if (password && password.trim() !== '') {
      const encryptedPassword = encrypt(password);
      await client.query(
        'UPDATE user_credentials SET userpassword = $1 WHERE userid = $2',
        [encryptedPassword, userId]
      );
    }

    // Update username if provided
    if (username) {
      await client.query(
        'UPDATE user_profile SET username = $1 WHERE userid = $2',
        [username, userId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
    }
    console.error('Error updating personal profile:', err);
    res.status(400).json({ error: err.message || 'Error updating profile' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Self-delete user account
app.delete('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      'DELETE FROM user_credentials WHERE userid = $1 RETURNING userid',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error self-deleting user account:', error);
    res.status(500).json({ error: 'Server error: failed to delete account' });
  }
});

// Helper to dynamically generate/regenerate terms for a program
async function generateTermsForProgram(client, programId, totalYears, semesterType, defaultUnits = 18) {
  // Clear any existing terms (cascades to delete old user profile / course references if structure is modified)
  await client.query('DELETE FROM term WHERE programid = $1', [programId]);

  for (let y = 1; y <= totalYears; y++) {
    for (let s = 1; s <= semesterType; s++) {
      let termId = '';
      if (semesterType === 1) {
        termId = `${programId}${y}`;
      } else {
        termId = `${programId}${(y - 1) * semesterType + s}`;
      }
      await client.query(
        'INSERT INTO term (termid, programid, yearlevel, semester, requnits) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [termId, programId, y, s, defaultUnits]
      );
    }
  }
}

// Public endpoint to retrieve all available programs
app.get('/api/programs', async (req, res) => {
  try {
    const result = await pool.query('SELECT programid, programname, totalyears, semestertype, defaultunits FROM program ORDER BY programid ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// ADMIN DASHBOARD CRUD ENDPOINTS
// -------------------------------------------------------------

/**
 * Express Middleware to restrict access to Super Admins.
 * Queries the database to verify the user's role status is 'Admin'.
 * @param {express.Request} req - Express request (requires authenticated req.user)
 * @param {express.Response} res - Express response
 * @param {express.NextFunction} next - Express next router function
 */
const adminOnly = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT useraccess FROM user_credentials WHERE userid = $1',
      [req.user.user_id]
    );
    if (result.rows.length === 0 || result.rows[0].useraccess !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Admin role required' });
    }
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 0. Programs endpoints (Admin only)
app.get('/api/admin/programs', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT programid, programname, totalyears, semestertype, defaultunits FROM program ORDER BY programid ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin programs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/programs', authenticateToken, adminOnly, async (req, res) => {
  const { programid, programname, totalyears, semestertype, defaultunits } = req.body;
  if (!programid || !programname || !totalyears || !semestertype || !defaultunits) {
    return res.status(400).json({ error: 'All program fields are required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO program (programid, programname, totalyears, semestertype, defaultunits) VALUES ($1, $2, $3, $4, $5)',
      [programid.toUpperCase(), programname, parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits)]
    );
    // Automate term generation
    await generateTermsForProgram(client, programid.toUpperCase(), parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits));
    await client.query('COMMIT');
    res.status(201).json({ message: 'Program created and terms generated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating program:', err);
    res.status(400).json({ error: err.message || 'Error creating program' });
  } finally {
    client.release();
  }
});

app.put('/api/admin/programs/:id', authenticateToken, adminOnly, async (req, res) => {
  const oldProgramId = req.params.id;
  const { programid, programname, totalyears, semestertype, defaultunits } = req.body;
  if (!programid || !programname || !totalyears || !semestertype || !defaultunits) {
    return res.status(400).json({ error: 'All program fields are required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get existing program values to check if duration, track type, or default units changed
    const current = await client.query('SELECT totalyears, semestertype, defaultunits FROM program WHERE programid = $1', [oldProgramId]);
    const needsRegeneration = current.rows.length > 0 && (
      current.rows[0].totalyears !== parseInt(totalyears) ||
      current.rows[0].semestertype !== parseInt(semestertype) ||
      current.rows[0].defaultunits !== parseInt(defaultunits) ||
      oldProgramId !== programid.toUpperCase()
    );

    // Update program
    await client.query(
      'UPDATE program SET programid = $1, programname = $2, totalyears = $3, semestertype = $4, defaultunits = $5 WHERE programid = $6',
      [programid.toUpperCase(), programname, parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits), oldProgramId]
    );

    // Regenerate terms if program structure changed
    if (needsRegeneration) {
      await generateTermsForProgram(client, programid.toUpperCase(), parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits));
    }

    await client.query('COMMIT');
    res.json({ message: 'Program updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating program:', err);
    res.status(400).json({ error: err.message || 'Error updating program' });
  } finally {
    client.release();
  }
});

app.delete('/api/admin/programs/:id', authenticateToken, adminOnly, async (req, res) => {
  const programId = req.params.id;
  try {
    // Cascades on delete automatically purge terms, courses, slots, and profiles
    await pool.query('DELETE FROM program WHERE programid = $1', [programId]);
    res.json({ message: 'Program and all connected terms/courses deleted successfully' });
  } catch (err) {
    console.error('Error deleting program:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 1. Users endpoints
app.get('/api/admin/users', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT uc.userid, uc.useremail, uc.userpassword, uc.useraccess, uc.createdat, up.username, up.termid
      FROM user_credentials uc
      LEFT JOIN user_profile up ON uc.userid = up.userid
      WHERE LOWER(uc.useremail) != 'admin@gmail.com'
      ORDER BY uc.userid ASC
    `);

    // Return the passwords in their decrypted state
    const users = result.rows.map(row => ({
      ...row,
      userpassword: decrypt(row.userpassword)
    }));

    res.json(users);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/users', authenticateToken, adminOnly, async (req, res) => {
  const { email, password, username, termid, access } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const encryptedPassword = encrypt(password);
    const credsResult = await client.query(`
      INSERT INTO user_credentials (useremail, userpassword, useraccess)
      VALUES (LOWER($1), $2, $3)
      RETURNING userid
    `, [email, encryptedPassword, access || 'Default']);

    const newUserId = credsResult.rows[0].userid;

    await client.query(`
      INSERT INTO user_profile (userid, username, termid)
      VALUES ($1, $2, $3)
    `, [newUserId, username || email, termid || null]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'User created successfully', userid: newUserId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating admin user:', err);
    res.status(400).json({ error: err.message || 'Error creating user' });
  } finally {
    client.release();
  }
});

app.put('/api/admin/users/:id', authenticateToken, adminOnly, async (req, res) => {
  const userId = req.params.id;
  const { email, password, username, termid, access } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (password && password.trim() !== '') {
      const encryptedPassword = encrypt(password);
      await client.query(`
        UPDATE user_credentials
        SET useremail = LOWER($1), userpassword = $2, useraccess = $3
        WHERE userid = $4
      `, [email, encryptedPassword, access, userId]);
    } else {
      await client.query(`
        UPDATE user_credentials
        SET useremail = LOWER($1), useraccess = $2
        WHERE userid = $3
      `, [email, access, userId]);
    }

    await client.query(`
      UPDATE user_profile
      SET username = $1, termid = $2
      WHERE userid = $3
    `, [username, termid || null, userId]);

    await client.query('COMMIT');
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating admin user:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/admin/users/:id/make-admin', authenticateToken, adminOnly, async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query(`
      UPDATE user_credentials
      SET useraccess = 'Admin'
      WHERE userid = $1
    `, [userId]);
    res.json({ message: 'User updated to Admin access successfully' });
  } catch (err) {
    console.error('Error elevating user to admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:id/remove-admin', authenticateToken, adminOnly, async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query(`
      UPDATE user_credentials
      SET useraccess = 'Default'
      WHERE userid = $1
    `, [userId]);
    res.json({ message: 'User updated to Default access successfully' });
  } catch (err) {
    console.error('Error removing admin access:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, adminOnly, async (req, res) => {
  const userId = req.params.id;
  try {
    // Cascadings handled at schema level
    await pool.query('DELETE FROM user_credentials WHERE userid = $1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Terms endpoints
app.get('/api/admin/terms', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT termid, programid, yearlevel, semester, requnits FROM term ORDER BY programid ASC, yearlevel ASC, semester ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin terms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/terms', authenticateToken, adminOnly, async (req, res) => {
  const { termid, programid, yearlevel, semester, requnits } = req.body;
  try {
    await pool.query(`
      INSERT INTO term (termid, programid, yearlevel, semester, requnits)
      VALUES ($1, $2, $3, $4, $5)
    `, [termid, programid, yearlevel, semester, requnits]);
    res.status(201).json({ message: 'Term created successfully' });
  } catch (err) {
    console.error('Error creating admin term:', err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/terms/:id', authenticateToken, adminOnly, async (req, res) => {
  const oldTermId = req.params.id;
  const { termid, programid, yearlevel, semester, requnits } = req.body;
  try {
    await pool.query(`
      UPDATE term
      SET termid = $1, programid = $2, yearlevel = $3, semester = $4, requnits = $5
      WHERE termid = $6
    `, [termid, programid, yearlevel, semester, requnits, oldTermId]);
    res.json({ message: 'Term updated successfully' });
  } catch (err) {
    console.error('Error updating admin term:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/terms/:id', authenticateToken, adminOnly, async (req, res) => {
  const termId = req.params.id;
  try {
    await pool.query('DELETE FROM term WHERE termid = $1', [termId]);
    res.json({ message: 'Term deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin term:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Courses endpoints
app.get('/api/admin/courses', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.coursecode, array_agg(ct.termid) as termids, c.coursename, c.courseunits
      FROM course c
      LEFT JOIN course_term ct ON c.coursecode = ct.coursecode
      GROUP BY c.coursecode, c.coursename, c.courseunits
      ORDER BY c.coursecode ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin courses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/courses', authenticateToken, adminOnly, async (req, res) => {
  const { coursecode, termids, coursename, courseunits } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO course (coursecode, coursename, courseunits)
      VALUES ($1, $2, $3)
    `, [coursecode, coursename, courseunits]);

    if (termids && termids.length > 0) {
      for (const termid of termids) {
        await client.query(`
          INSERT INTO course_term (coursecode, termid)
          VALUES ($1, $2)
        `, [coursecode, termid]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Course created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating admin course:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/admin/courses/:code', authenticateToken, adminOnly, async (req, res) => {
  const oldCode = req.params.code;
  const { coursecode, termids, coursename, courseunits } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newCode = coursecode;
    await client.query(`
      UPDATE course
      SET coursecode = $1, coursename = $2, courseunits = $3
      WHERE coursecode = $4
    `, [newCode, coursename, courseunits, oldCode]);

    // Critical: remove mappings for the *old* course code to avoid orphaned/duplicate course_term rows.
    await client.query('DELETE FROM course_term WHERE coursecode = $1', [oldCode]);
    if (termids && termids.length > 0) {
      for (const termid of termids) {
        await client.query(`
          INSERT INTO course_term (coursecode, termid)
          VALUES ($1, $2)
        `, [newCode, termid]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating admin course:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/admin/courses/:code', authenticateToken, adminOnly, async (req, res) => {
  const code = req.params.code;
  try {
    // Cascade delete of course slots is handled by DB constraints
    await pool.query('DELETE FROM course WHERE coursecode = $1', [code]);
    res.json({ message: 'Course and connected course slots deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Professors endpoints
app.get('/api/admin/professors', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT profid, profname, profdepartment FROM professor ORDER BY profid ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin professors:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/professors', authenticateToken, adminOnly, async (req, res) => {
  const { profname, profdepartment } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO professor (profname, profdepartment)
      VALUES ($1, $2)
      RETURNING profid
    `, [profname, profdepartment]);
    res.status(201).json({ message: 'Professor created successfully', profid: result.rows[0].profid });
  } catch (err) {
    console.error('Error creating admin professor:', err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/professors/:id', authenticateToken, adminOnly, async (req, res) => {
  const id = req.params.id;
  const { profname, profdepartment } = req.body;
  try {
    await pool.query(`
      UPDATE professor
      SET profname = $1, profdepartment = $2
      WHERE profid = $3
    `, [profname, profdepartment, id]);
    res.json({ message: 'Professor updated successfully' });
  } catch (err) {
    console.error('Error updating admin professor:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/professors/:id', authenticateToken, adminOnly, async (req, res) => {
  const id = req.params.id;
  try {
    // ON DELETE SET NULL constraint will automatically set profid = NULL in courseslot table
    await pool.query('DELETE FROM professor WHERE profid = $1', [id]);
    res.json({ message: 'Professor deleted successfully, connected course slots updated to NULL' });
  } catch (err) {
    console.error('Error deleting admin professor:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Course Slots endpoints
app.get('/api/admin/courseslots', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cs.courseslotid, cs.coursecode, cs.profid, cs.starttime, cs.endtime, cs.scheduleday, cs.roomcode,
             c.coursename, p.profname
      FROM courseslot cs
      LEFT JOIN course c ON cs.coursecode = c.coursecode
      LEFT JOIN professor p ON cs.profid = p.profid
      ORDER BY cs.courseslotid ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin course slots:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/courseslots', authenticateToken, adminOnly, async (req, res) => {
  const { coursecode, profid, starttime, endtime, scheduleday, roomcode } = req.body;

  const startMins = parseTimeToMins(starttime);
  const endMins = parseTimeToMins(endtime);

  if (startMins === null || endMins === null) {
    return res.status(400).json({ error: 'Start and end times are required.' });
  }
  if (startMins < 7 * 60) {
    return res.status(400).json({ error: 'Start time cannot be earlier than 7:00 AM.' });
  }
  if (endMins > 20 * 60) {
    return res.status(400).json({ error: 'End time cannot be later than 8:00 PM.' });
  }
  if (startMins >= endMins) {
    return res.status(400).json({ error: 'Start time must precede end time.' });
  }

  try {
    await pool.query(`
      INSERT INTO courseslot (coursecode, profid, starttime, endtime, scheduleday, roomcode)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [coursecode, profid && profid !== 'None' ? parseInt(profid) : null, starttime, endtime, scheduleday, roomcode]);
    res.status(201).json({ message: 'Course slot created successfully' });
  } catch (err) {
    console.error('Error creating admin course slot:', err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/courseslots/:id', authenticateToken, adminOnly, async (req, res) => {
  const id = req.params.id;
  const { coursecode, profid, starttime, endtime, scheduleday, roomcode } = req.body;

  const startMins = parseTimeToMins(starttime);
  const endMins = parseTimeToMins(endtime);

  if (startMins === null || endMins === null) {
    return res.status(400).json({ error: 'Start and end times are required.' });
  }
  if (startMins < 7 * 60) {
    return res.status(400).json({ error: 'Start time cannot be earlier than 7:00 AM.' });
  }
  if (endMins > 20 * 60) {
    return res.status(400).json({ error: 'End time cannot be later than 8:00 PM.' });
  }
  if (startMins >= endMins) {
    return res.status(400).json({ error: 'Start time must precede end time.' });
  }

  try {
    await pool.query(`
      UPDATE courseslot
      SET coursecode = $1, profid = $2, starttime = $3, endtime = $4, scheduleday = $5, roomcode = $6
      WHERE courseslotid = $7
    `, [coursecode, profid && profid !== 'None' ? parseInt(profid) : null, starttime, endtime, scheduleday, roomcode, id]);
    res.json({ message: 'Course slot updated successfully' });
  } catch (err) {
    console.error('Error updating admin course slot:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/courseslots/:id', authenticateToken, adminOnly, async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM courseslot WHERE courseslotid = $1', [id]);
    res.json({ message: 'Course slot deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin course slot:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Schedules endpoints
app.get('/api/admin/schedules', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.scheduleid, s.userid, s.schedulename, s.schedulelist, s.totalunits, s.regular, s.createdat, s.updatedat,
             uc.useremail, up.username
      FROM schedule s
      LEFT JOIN user_credentials uc ON s.userid = uc.userid
      LEFT JOIN user_profile up ON s.userid = up.userid
      ORDER BY s.scheduleid ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin schedules:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/schedules/:id', authenticateToken, adminOnly, async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM schedule WHERE scheduleid = $1', [id]);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin schedule:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// -------------------------------------------------------------
// MONOLITHIC STATIC ASSETS ROUTING (Opt-in)
// -------------------------------------------------------------
if (process.env.SERVE_STATIC === 'true') {
  app.use(express.static(path.join(__dirname, '../')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

// Centralized error handler (kept at bottom to catch asyncHandler + throw paths)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Server error' });
});

// Start the Express web server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));