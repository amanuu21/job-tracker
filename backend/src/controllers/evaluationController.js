const { query } = require('../database/db');

exports.submitEvaluation = async (req, res, next) => {
  try {
    const { application_id, technical_score, communication_score, experience_score, recommendation, comments } = req.body;
    const evaluator_id = req.user.id;

    const overall_score = ((technical_score + communication_score + experience_score) / 3).toFixed(2);

    const result = await query(
      `INSERT INTO evaluations (application_id, evaluator_id, technical_score, communication_score, experience_score, overall_score, recommendation, comments)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (application_id, evaluator_id) DO UPDATE SET
         technical_score=$3, communication_score=$4, experience_score=$5,
         overall_score=$6, recommendation=$7, comments=$8, updated_at=NOW()
       RETURNING *`,
      [application_id, evaluator_id, technical_score, communication_score, experience_score, overall_score, recommendation, comments || null]
    );

    res.status(201).json({ success: true, message: 'Evaluation submitted', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getEvaluationsByApplication = async (req, res, next) => {
  try {
    const { application_id } = req.params;
    const result = await query(
      `SELECT e.*, u.first_name || ' ' || u.last_name AS evaluator_name, u.avatar_url AS evaluator_avatar
       FROM evaluations e
       JOIN users u ON e.evaluator_id = u.id
       WHERE e.application_id = $1 ORDER BY e.created_at DESC`,
      [application_id]
    );

    const avgResult = await query(
      'SELECT AVG(overall_score) AS avg_score, COUNT(*) AS count FROM evaluations WHERE application_id = $1',
      [application_id]
    );

    res.json({
      success: true,
      data: result.rows,
      summary: {
        avg_score: parseFloat(avgResult.rows[0].avg_score || 0).toFixed(2),
        count: parseInt(avgResult.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyEvaluations = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, jv.title AS job_title, u.first_name || ' ' || u.last_name AS applicant_name
       FROM evaluations e
       JOIN applications a ON e.application_id = a.id
       JOIN job_vacancies jv ON a.job_id = jv.id
       JOIN users u ON a.applicant_id = u.id
       WHERE e.evaluator_id = $1 ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
