const { query } = require('../database/db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [jobs, applications, users, recentApps] = await Promise.all([
      query(`SELECT status, COUNT(*) as count FROM job_vacancies GROUP BY status`),
      query(`SELECT status, COUNT(*) as count FROM applications GROUP BY status`),
      query(`SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role`),
      query(`
        SELECT a.id, a.status, a.submitted_at, jv.title AS job_title,
               u.first_name || ' ' || u.last_name AS applicant_name
        FROM applications a
        JOIN job_vacancies jv ON a.job_id = jv.id
        JOIN users u ON a.applicant_id = u.id
        ORDER BY a.submitted_at DESC LIMIT 5
      `)
    ]);

    const jobStats = jobs.rows.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.count) }), {});
    const appStats = applications.rows.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.count) }), {});
    const userStats = users.rows.reduce((acc, r) => ({ ...acc, [r.role]: parseInt(r.count) }), {});

    res.json({
      success: true,
      data: {
        jobs: { ...jobStats, total: Object.values(jobStats).reduce((a, b) => a + b, 0) },
        applications: { ...appStats, total: Object.values(appStats).reduce((a, b) => a + b, 0) },
        users: { ...userStats, total: Object.values(userStats).reduce((a, b) => a + b, 0) },
        recent_applications: recentApps.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationReport = async (req, res, next) => {
  try {
    const { start_date, end_date, job_id, format } = req.query;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (start_date) { conditions.push(`a.submitted_at >= $${paramCount++}`); params.push(start_date); }
    if (end_date) { conditions.push(`a.submitted_at <= $${paramCount++}`); params.push(end_date); }
    if (job_id) { conditions.push(`a.job_id = $${paramCount++}`); params.push(job_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT a.id, a.status, a.submitted_at, a.updated_at,
              jv.title AS job_title, jv.department,
              u.first_name || ' ' || u.last_name AS applicant_name,
              u.email AS applicant_email,
              (SELECT AVG(overall_score) FROM evaluations WHERE application_id = a.id) AS avg_evaluation_score
       FROM applications a
       JOIN job_vacancies jv ON a.job_id = jv.id
       JOIN users u ON a.applicant_id = u.id
       ${where} ORDER BY a.submitted_at DESC`,
      params
    );

    if (format === 'csv') {
      const csv = [
        'ID,Status,Job Title,Department,Applicant Name,Email,Submitted At,Avg Score',
        ...result.rows.map(r =>
          `${r.id},${r.status},"${r.job_title}","${r.department}","${r.applicant_name}",${r.applicant_email},${r.submitted_at},${r.avg_evaluation_score || 'N/A'}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=applications-report.csv');
      return res.send(csv);
    }

    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    next(error);
  }
};

exports.getHiringFunnel = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status != 'withdrawn') AS total,
        COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
        COUNT(*) FILTER (WHERE status = 'shortlisted') AS shortlisted,
        COUNT(*) FILTER (WHERE status IN ('interview_scheduled','interviewed')) AS interviewed,
        COUNT(*) FILTER (WHERE status = 'offered') AS offered,
        COUNT(*) FILTER (WHERE status = 'hired') AS hired,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM applications
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, user_id, action } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (user_id) { conditions.push(`al.user_id = $${paramCount++}`); params.push(user_id); }
    if (action) { conditions.push(`al.action ILIKE $${paramCount++}`); params.push(`%${action}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT al.*, u.first_name || ' ' || u.last_name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${where} ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
