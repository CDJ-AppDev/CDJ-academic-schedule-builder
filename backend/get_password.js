/**
 * @file get_password.js
 * @description Retrieves and decrypts user passwords directly from the database given an email address.
 * Usage: node get_password.js <email>
 */

const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ENCRYPTION_KEY = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || '0e07ed8b80c116bd42c32cd7b48f742f22ee184dd4df2e5b65bfecc322abb0a6';
const IV_LENGTH = 16; // 16 bytes for AES-256-CBC

/**
 * Decrypts AES-256-CBC encrypted strings.
 * Supports legacy fallback mappings for standard cleartext passwords.
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
    console.error('Decryption error:', e.message);
    return text;
  }
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('\n❌ Error: Please provide an email address.');
    console.error('Usage: node get_password.js <email>\n');
    process.exit(1);
  }

  // Set up standard PG pool using the backend environment variables
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    const result = await pool.query(
      'SELECT UserID, UserEmail, UserPassword, UserAccess FROM USER_CREDENTIALS WHERE LOWER(UserEmail) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      console.log(`\n❌ No user found matching email: "${email}"\n`);
      await pool.end();
      process.exit(0);
    }

    const row = result.rows[0];
    const decryptedPassword = decrypt(row.userpassword);

    console.log('\n==================================================');
    console.log('🔑 USER CREDENTIALS RETRIEVED');
    console.log('==================================================');
    console.log(`User ID:   ${row.userid}`);
    console.log(`Email:     ${row.useremail}`);
    console.log(`Access:    ${row.useraccess}`);
    console.log(`Password:  ${decryptedPassword}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n❌ Database execution error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
