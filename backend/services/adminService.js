const { pool } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');
const { parseTimeToMins } = require('../utils/helpers');
const { invalidateCache } = require('./programService');

async function generateTermsForProgram(client, programId, totalYears, semesterType, defaultUnits = 18) {
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

async function getPrograms() {
  const result = await pool.query('SELECT programid, programname, totalyears, semestertype, defaultunits FROM program ORDER BY programid ASC');
  return result.rows;
}

async function createProgram({ programid, programname, totalyears, semestertype, defaultunits }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO program (programid, programname, totalyears, semestertype, defaultunits) VALUES ($1, $2, $3, $4, $5)',
      [programid.toUpperCase(), programname, parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits)]
    );
    await generateTermsForProgram(client, programid.toUpperCase(), parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits));
    await client.query('COMMIT');
    invalidateCache();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateProgram(oldProgramId, { programid, programname, totalyears, semestertype, defaultunits }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT totalyears, semestertype, defaultunits FROM program WHERE programid = $1', [oldProgramId]);
    const needsRegeneration = current.rows.length > 0 && (
      current.rows[0].totalyears !== parseInt(totalyears) ||
      current.rows[0].semestertype !== parseInt(semestertype) ||
      current.rows[0].defaultunits !== parseInt(defaultunits) ||
      oldProgramId !== programid.toUpperCase()
    );

    await client.query(
      'UPDATE program SET programid = $1, programname = $2, totalyears = $3, semestertype = $4, defaultunits = $5 WHERE programid = $6',
      [programid.toUpperCase(), programname, parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits), oldProgramId]
    );

    if (needsRegeneration) {
      await generateTermsForProgram(client, programid.toUpperCase(), parseInt(totalyears), parseInt(semestertype), parseInt(defaultunits));
    }

    await client.query('COMMIT');
    invalidateCache();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteProgram(programId) {
  await pool.query('DELETE FROM program WHERE programid = $1', [programId]);
  invalidateCache();
}

async function getUsers() {
  const result = await pool.query(`
    SELECT uc.userid, uc.useremail, uc.userpassword, uc.useraccess, uc.createdat, up.username, up.termid
    FROM user_credentials uc
    LEFT JOIN user_profile up ON uc.userid = up.userid
    WHERE LOWER(uc.useremail) != 'admin@gmail.com'
    ORDER BY uc.userid ASC
  `);
  return result.rows.map(row => ({
    ...row,
    userpassword: decrypt(row.userpassword)
  }));
}

async function createUser({ email, password, username, termid, access }) {
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
    return newUserId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateUser(userId, { email, password, username, termid, access }) {
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
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function makeUserAdmin(userId) {
  await pool.query(`UPDATE user_credentials SET useraccess = 'Admin' WHERE userid = $1`, [userId]);
}

async function removeUserAdmin(userId) {
  await pool.query(`UPDATE user_credentials SET useraccess = 'Default' WHERE userid = $1`, [userId]);
}

async function deleteUser(userId) {
  await pool.query('DELETE FROM user_credentials WHERE userid = $1', [userId]);
}

async function getTerms() {
  const result = await pool.query('SELECT termid, programid, yearlevel, semester, requnits FROM term ORDER BY programid ASC, yearlevel ASC, semester ASC');
  return result.rows;
}

async function createTerm({ termid, programid, yearlevel, semester, requnits }) {
  await pool.query(`
    INSERT INTO term (termid, programid, yearlevel, semester, requnits)
    VALUES ($1, $2, $3, $4, $5)
  `, [termid, programid, yearlevel, semester, requnits]);
}

async function updateTerm(oldTermId, { termid, programid, yearlevel, semester, requnits }) {
  await pool.query(`
    UPDATE term
    SET termid = $1, programid = $2, yearlevel = $3, semester = $4, requnits = $5
    WHERE termid = $6
  `, [termid, programid, yearlevel, semester, requnits, oldTermId]);
}

async function deleteTerm(termId) {
  await pool.query('DELETE FROM term WHERE termid = $1', [termId]);
}

async function getCourses() {
  const result = await pool.query(`
    SELECT c.coursecode, array_agg(ct.termid) as termids, c.coursename, c.courseunits
    FROM course c
    LEFT JOIN course_term ct ON c.coursecode = ct.coursecode
    GROUP BY c.coursecode, c.coursename, c.courseunits
    ORDER BY c.coursecode ASC
  `);
  return result.rows;
}

async function createCourse({ coursecode, termids, coursename, courseunits }) {
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
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateCourse(oldCode, { coursecode, termids, coursename, courseunits }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newCode = coursecode;
    await client.query(`
      UPDATE course
      SET coursecode = $1, coursename = $2, courseunits = $3
      WHERE coursecode = $4
    `, [newCode, coursename, courseunits, oldCode]);

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
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteCourse(code) {
  await pool.query('DELETE FROM course WHERE coursecode = $1', [code]);
}

async function getProfessors() {
  const result = await pool.query('SELECT profid, profname, profdepartment FROM professor ORDER BY profid ASC');
  return result.rows;
}

async function createProfessor({ profname, profdepartment }) {
  const result = await pool.query(`
    INSERT INTO professor (profname, profdepartment)
    VALUES ($1, $2)
    RETURNING profid
  `, [profname, profdepartment]);
  return result.rows[0].profid;
}

async function updateProfessor(id, { profname, profdepartment }) {
  await pool.query(`
    UPDATE professor
    SET profname = $1, profdepartment = $2
    WHERE profid = $3
  `, [profname, profdepartment, id]);
}

async function deleteProfessor(id) {
  await pool.query('DELETE FROM professor WHERE profid = $1', [id]);
}

async function getCourseSlots() {
  const result = await pool.query(`
    SELECT cs.courseslotid, cs.coursecode, cs.profid, cs.starttime, cs.endtime, cs.scheduleday, cs.roomcode,
           c.coursename, p.profname
    FROM courseslot cs
    LEFT JOIN course c ON cs.coursecode = c.coursecode
    LEFT JOIN professor p ON cs.profid = p.profid
    ORDER BY cs.courseslotid ASC
  `);
  return result.rows;
}

async function createCourseSlot({ coursecode, profid, starttime, endtime, scheduleday, roomcode }) {
  const startMins = parseTimeToMins(starttime);
  const endMins = parseTimeToMins(endtime);

  if (startMins === null || endMins === null) {
    throw new Error('Start and end times are required.');
  }
  if (startMins < 7 * 60) throw new Error('Start time cannot be earlier than 7:00 AM.');
  if (endMins > 20 * 60) throw new Error('End time cannot be later than 8:00 PM.');
  if (startMins >= endMins) throw new Error('Start time must precede end time.');

  await pool.query(`
    INSERT INTO courseslot (coursecode, profid, starttime, endtime, scheduleday, roomcode)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [coursecode, profid && profid !== 'None' ? parseInt(profid) : null, starttime, endtime, scheduleday, roomcode]);
}

async function updateCourseSlot(id, { coursecode, profid, starttime, endtime, scheduleday, roomcode }) {
  const startMins = parseTimeToMins(starttime);
  const endMins = parseTimeToMins(endtime);

  if (startMins === null || endMins === null) {
    throw new Error('Start and end times are required.');
  }
  if (startMins < 7 * 60) throw new Error('Start time cannot be earlier than 7:00 AM.');
  if (endMins > 20 * 60) throw new Error('End time cannot be later than 8:00 PM.');
  if (startMins >= endMins) throw new Error('Start time must precede end time.');

  await pool.query(`
    UPDATE courseslot
    SET coursecode = $1, profid = $2, starttime = $3, endtime = $4, scheduleday = $5, roomcode = $6
    WHERE courseslotid = $7
  `, [coursecode, profid && profid !== 'None' ? parseInt(profid) : null, starttime, endtime, scheduleday, roomcode, id]);
}

async function deleteCourseSlot(id) {
  await pool.query('DELETE FROM courseslot WHERE courseslotid = $1', [id]);
}

async function getSchedules() {
  const result = await pool.query(`
    SELECT s.scheduleid, s.userid, s.schedulename, s.schedulelist, s.totalunits, s.regular, s.createdat, s.updatedat,
           uc.useremail, up.username
    FROM schedule s
    LEFT JOIN user_credentials uc ON s.userid = uc.userid
    LEFT JOIN user_profile up ON s.userid = up.userid
    ORDER BY s.scheduleid ASC
  `);
  return result.rows;
}

async function deleteSchedule(id) {
  await pool.query('DELETE FROM schedule WHERE scheduleid = $1', [id]);
}

module.exports = {
  getPrograms, createProgram, updateProgram, deleteProgram,
  getUsers, createUser, updateUser, makeUserAdmin, removeUserAdmin, deleteUser,
  getTerms, createTerm, updateTerm, deleteTerm,
  getCourses, createCourse, updateCourse, deleteCourse,
  getProfessors, createProfessor, updateProfessor, deleteProfessor,
  getCourseSlots, createCourseSlot, updateCourseSlot, deleteCourseSlot,
  getSchedules, deleteSchedule
};
