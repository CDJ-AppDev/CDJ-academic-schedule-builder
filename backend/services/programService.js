const { pool } = require('../config/database');

let programsCache = {
  data: null,
  timestamp: 0
};
const TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getPrograms() {
  const now = Date.now();
  if (programsCache.data && (now - programsCache.timestamp < TTL_MS)) {
    return programsCache.data;
  }

  const result = await pool.query('SELECT programid, programname, totalyears, semestertype, defaultunits FROM program ORDER BY programid ASC');
  programsCache.data = result.rows;
  programsCache.timestamp = now;
  return result.rows;
}

function invalidateCache() {
  programsCache.data = null;
  programsCache.timestamp = 0;
}

module.exports = {
  getPrograms,
  invalidateCache
};
