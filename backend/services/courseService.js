const { pool } = require('../config/database');

async function getCourses(userId) {
  const userResult = await pool.query(
    'SELECT termid FROM user_profile WHERE userid = $1',
    [userId]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].termid) {
    return [];
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
    JOIN course_term ct ON c.coursecode = ct.coursecode
    JOIN term t ON ct.termid = t.termid
    LEFT JOIN courseslot cs ON c.coursecode = cs.coursecode
    LEFT JOIN professor p ON cs.profid = p.profid
    WHERE ct.termid = $1 AND cs.courseslotid IS NOT NULL
    ORDER BY c.coursecode
  `, [userTermId]);

  return result.rows.map(row => ({
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
}

async function getSchedule(userId) {
  const result = await pool.query(
    'SELECT scheduleid, schedulename, schedulelist, totalunits FROM schedule WHERE userid = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return [];
  }

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

  return result.rows.map((scheduleRow) => {
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
}

async function saveSchedule(userId, { schedule_id, schedule_name, total_units, regular, schedule_list }) {
  let result;
  if (schedule_id) {
    result = await pool.query(
      'UPDATE schedule SET schedulename = $1, totalunits = $2, regular = $3, schedulelist = $4, updatedat = CURRENT_TIMESTAMP WHERE scheduleid = $5 AND userid = $6 RETURNING scheduleid',
      [schedule_name || 'My Schedule', total_units || 0, regular !== undefined ? regular : true, JSON.stringify(schedule_list || []), schedule_id, userId]
    );
    if (result.rows.length === 0) {
      const err = new Error('Schedule not found');
      err.status = 404;
      throw err;
    }
  } else {
    result = await pool.query(
      'INSERT INTO schedule (userid, schedulename, totalunits, regular, schedulelist) VALUES ($1, $2, $3, $4, $5) RETURNING scheduleid',
      [userId, schedule_name || 'My Schedule', total_units || 0, regular !== undefined ? regular : true, JSON.stringify(schedule_list || [])]
    );
  }
  return { schedule_id: result.rows[0].scheduleid };
}

async function removeCourseFromSchedule(userId, courseslot_id, schedule_id) {
  const result = await pool.query(
    `UPDATE schedule 
     SET schedulelist = (
       SELECT jsonb_agg(item) 
       FROM jsonb_array_elements(schedulelist) item 
       WHERE item->>'courseslot_id' != $1
     )
     WHERE scheduleid = $2 AND userid = $3
     RETURNING scheduleid`,
    [courseslot_id.toString(), schedule_id, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Schedule not found');
    err.status = 404;
    throw err;
  }
}

async function deleteSchedule(userId, scheduleId) {
  const result = await pool.query(
    'DELETE FROM schedule WHERE scheduleid = $1 AND userid = $2 RETURNING scheduleid',
    [scheduleId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Schedule not found');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  getCourses,
  getSchedule,
  saveSchedule,
  removeCourseFromSchedule,
  deleteSchedule
};
