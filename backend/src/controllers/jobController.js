const { query } = require('../database/db');
const { createNotification } = require('../utils/notifications');

exports.createJob = async (req, res, next) => {
  try {
    const { title, department, description, requirements, responsibilities, location, job_type, salary_min, salary_max, deadline, positions_available } = req.body;

    const result = await query(
      `INSERT INTO job_vacancies (title, department, description, requirements, responsibilities, location, job_type, salary_min, salary_max, deadline, positions_available, created_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'open') RETURNING *`,
      [title, department, description, requirements, responsibilities || null, location || null, job_type || 'full_time', salary_min || null, salary_max || null, deadline, positions_available || 1, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Job vacancy created', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status, department, job_type, search, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    // Non-admin/hr users only see open jobs
    if (!['admin', 'hr_staff'].includes(req.user?.role)) {
      conditions.push(`status = 'open'`);
    } else if (status) {
      conditions.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (department) { conditions.push(`department ILIKE $${paramCount++}`); params.push(`%${department}%`); }
    if (job_type) { conditions.push(`job_type = $${paramCount++}`); params.push(job_type); }
    if (search) {
      conditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR department ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = sort === 'deadline' ? 'deadline ASC' : sort === 'oldest' ? 'created_at ASC' : 'created_at DESC';

    const countResult = await query(`SELECT COUNT(*) FROM job_vacancies ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT jv.*, u.first_name || ' ' || u.last_name AS created_by_name,
              (SELECT COUNT(*) FROM applications WHERE job_id = jv.id) AS application_count
       FROM job_vacancies jv
       LEFT JOIN users u ON jv.created_by = u.id
       ${where} ORDER BY ${orderBy} LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT jv.*, u.first_name || ' ' || u.last_name AS created_by_name,
              (SELECT COUNT(*) FROM applications WHERE job_id = jv.id) AS application_count
       FROM job_vacancies jv
       LEFT JOIN users u ON jv.created_by = u.id
       WHERE jv.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, department, description, requirements, responsibilities, location, job_type, salary_min, salary_max, deadline, status, positions_available } = req.body;

    const result = await query(
      `UPDATE job_vacancies SET title=$1, department=$2, description=$3, requirements=$4, responsibilities=$5,
       location=$6, job_type=$7, salary_min=$8, salary_max=$9, deadline=$10, status=$11, positions_available=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [title, department, description, requirements, responsibilities, location, job_type, salary_min, salary_max, deadline, status, positions_available, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job updated', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM job_vacancies WHERE id = $1 RETURNING id', [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT department FROM job_vacancies ORDER BY department');
    res.json({ success: true, data: result.rows.map(r => r.department) });
  } catch (error) {
    next(error);
  }
};
