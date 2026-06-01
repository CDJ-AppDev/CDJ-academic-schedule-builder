const { pool } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');
const { sendResetPinEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env');

async function signup(email, password) {
  const encryptedPassword = encrypt(password);
  try {
    const result = await pool.query(
      'INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES (LOWER($1), $2, $3) RETURNING userid',
      [email, encryptedPassword, 'Default']
    );
    await pool.query(
      'INSERT INTO user_profile (userid, username) VALUES ($1, $2)',
      [result.rows[0].userid, email]
    );
    return { user_id: result.rows[0].userid };
  } catch (error) {
    if (error.code === '23505') {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function login(email, password) {
  if (!JWT_SECRET) {
    const err = new Error('Server misconfiguration');
    err.status = 500;
    throw err;
  }

  const result = await pool.query(
    'SELECT uc.userid, uc.userpassword, uc.useraccess, up.username FROM user_credentials uc LEFT JOIN user_profile up ON uc.userid = up.userid WHERE LOWER(uc.useremail) = LOWER($1)',
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.status = 400;
    throw err;
  }

  const user = result.rows[0];
  if (!user.userpassword) {
    const err = new Error('User password not found');
    err.status = 400;
    throw err;
  }
  const validPassword = (decrypt(user.userpassword) === password);
  if (!validPassword) {
    const err = new Error('Invalid password');
    err.status = 400;
    throw err;
  }

  const token = jwt.sign({ user_id: user.userid }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ user_id: user.userid }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query('DELETE FROM REFRESH_TOKENS WHERE UserID = $1 AND ExpiresAt < CURRENT_TIMESTAMP', [user.userid]);
  await pool.query(
    'INSERT INTO REFRESH_TOKENS (UserID, Token, ExpiresAt) VALUES ($1, $2, $3)',
    [user.userid, refreshToken, expiresAt]
  );

  return { 
    token, 
    refreshToken,
    user: { user_id: user.userid, name: user.username, email, access: user.useraccess } 
  };
}

async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }

  const dbResult = await pool.query(
    'SELECT UserID, ExpiresAt FROM REFRESH_TOKENS WHERE Token = $1',
    [refreshToken]
  );

  if (dbResult.rows.length === 0) {
    const err = new Error('Refresh token not recognized or already rotated');
    err.status = 401;
    throw err;
  }

  const { userid, expiresat } = dbResult.rows[0];

  if (new Date() > new Date(expiresat)) {
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    const err = new Error('Refresh token expired');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ user_id: userid }, JWT_SECRET, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ user_id: userid }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
    await client.query(
      'INSERT INTO REFRESH_TOKENS (UserID, Token, ExpiresAt) VALUES ($1, $2, $3)',
      [userid, newRefreshToken, newExpiresAt]
    );
    await client.query('COMMIT');
    return { token, refreshToken: newRefreshToken };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during token rotation:', err);
    const error = new Error('Server error rotating tokens');
    error.status = 500;
    throw error;
  } finally {
    client.release();
  }
}

async function logout(refreshToken) {
  if (refreshToken) {
    await pool.query('DELETE FROM REFRESH_TOKENS WHERE Token = $1', [refreshToken]);
  }
}

async function forgotPassword(email) {
  const userResult = await pool.query(
    'SELECT useremail FROM user_credentials WHERE LOWER(useremail) = LOWER($1)',
    [email]
  );

  if (userResult.rows.length === 0) {
    const err = new Error('This email address is not registered in our database.');
    err.status = 404;
    err.exists = false;
    throw err;
  }

  const userEmail = userResult.rows[0].useremail;
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 3600000);

  await pool.query(
    'INSERT INTO PASSWORD_RESET_TOKEN (UserEmail, Token, ExpiresAt) VALUES ($1, $2, $3)',
    [userEmail, pin, expiresAt]
  );

  await sendResetPinEmail(userEmail, pin);
}

async function resetPassword(resetPin, email, password) {
  const tokenResult = await pool.query(
    'SELECT UserEmail, ExpiresAt FROM PASSWORD_RESET_TOKEN WHERE Token = $1 AND LOWER(UserEmail) = LOWER($2)',
    [resetPin, email]
  );

  if (tokenResult.rows.length === 0) {
    const err = new Error('Invalid reset PIN or email');
    err.status = 400;
    throw err;
  }

  const { useremail, expiresat } = tokenResult.rows[0];

  if (new Date() > new Date(expiresat)) {
    await pool.query('DELETE FROM PASSWORD_RESET_TOKEN WHERE Token = $1', [resetPin]);
    const err = new Error('Reset PIN has expired');
    err.status = 400;
    throw err;
  }

  const encryptedPassword = encrypt(password);
  await pool.query(
    'UPDATE user_credentials SET userpassword = $1 WHERE LOWER(useremail) = LOWER($2)',
    [encryptedPassword, useremail]
  );
  await pool.query('DELETE FROM PASSWORD_RESET_TOKEN WHERE Token = $1', [resetPin]);
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};
