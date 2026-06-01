const { Pool } = require('pg');
require('./env');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function initDB() {
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('Database refresh token table auto-initialized successfully.');
    }
  } catch (err) {
    console.error('Error auto-initializing database refresh token table:', err);
  }
}

// Graceful shutdown
const shutdown = () => {
  console.log('Closing database pool...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { pool, initDB };
