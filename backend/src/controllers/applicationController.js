const { query } = require('../database/db');
const { notifyApplicationStatusChange } = require('../utils/notifications');
const { sendEmail, emailTemplates } = require('../utils/email');

exports.submitApplication = async (req, res, next) => {
  try {
    const { job_id, cover_letter } = req.body;
    const applicant_id = req.user.id;

    // Check job exists and is open
    const jobResult = await query('SELECT id, title, status, deadline FROM job_vacancies WHERE id = $1', [job_id]);
    if (!jobResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = jobResult.rows[0];
    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }
    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check duplicate
    const existing = await query('SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2', [job_id, applicant_id]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job' });
    }

    const cv_url = req.file?.path || null;
    const cv_public_id = req.file?.filename || null;

    const result = await query(
      `INSERT INTO applications (job_id, applicant_id, cover_letter, cv_url, cv_public_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [job_id, applicant_id, cover_letter || null, cv_url, cv_public_id]
    );

    await notifyApplicationStatusChange(result.rows[0], job.title, applicant_id);

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.user.id];
    let where = 'WHERE a.applicant_id = $1';

    if (status) { where += ` AND a.status = $2`; params.push(status); }

    const countResult = await query(`SELECT COUNT(*) FROM applications a ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT a.*, jv.title AS job_title, jv.department, jv.location, jv.job_type
       FROM applications a
       JOIN job_vacancies jv ON a.job_id = jv.id
       ${where} ORDER BY a.submitted_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
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

exports.getApplicationsByJob = async (req, res, next) => {
  try {
    const { job_id } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [job_id];
    let paramCount = 2;
    const conditions = ['a.job_id = $1'];

    if (status) { conditions.push(`a.status = $${paramCount++}`); params.push(status); }
    if (search) {
      conditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countResult = await query(`SELECT COUNT(*) FROM applications a JOIN users u ON a.applicant_id = u.id ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              (SELECT AVG(overall_score) FROM evaluations WHERE application_id = a.id) AS avg_score
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       ${where} ORDER BY a.submitted_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appResult = await query(
      `SELECT a.*, jv.title AS job_title, u.email AS applicant_email, u.first_name, u.last_name
       FROM applications a
       JOIN job_vacancies jv ON a.job_id = jv.id
       JOIN users u ON a.applicant_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (!appResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const app = appResult.rows[0];
    const result = await query(
      'UPDATE applications SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, notes || app.notes, id]
    );

    // Notify applicant
    await notifyApplicationStatusChange(result.rows[0], app.job_title, app.applicant_id);

    // Send email notification
    const template = emailTemplates.applicationStatus(`${app.first_name} ${app.last_name}`, app.job_title, status);
    sendEmail({ to: app.applicant_email, ...template }).catch(console.error);

    res.json({ success: true, message: 'Application status updated', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE applications SET status = 'withdrawn', updated_at = NOW()
       WHERE id = $1 AND applicant_id = $2 AND status NOT IN ('hired','rejected') RETURNING *`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Application not found or cannot be withdrawn' });
    }

    res.json({ success: true, message: 'Application withdrawn', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getAllApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, job_id } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) { conditions.push(`a.status = $${paramCount++}`); params.push(status); }
    if (job_id) { conditions.push(`a.job_id = $${paramCount++}`); params.push(job_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) FROM applications a ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT a.*, jv.title AS job_title, jv.department,
              u.first_name, u.last_name, u.email, u.avatar_url
       FROM applications a
       JOIN job_vacancies jv ON a.job_id = jv.id
       JOIN users u ON a.applicant_id = u.id
       ${where} ORDER BY a.submitted_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
