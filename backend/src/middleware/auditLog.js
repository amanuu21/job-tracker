const { query } = require('../database/db');

const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              req.user.id,
              action,
              entityType,
              data?.data?.id || req.params.id || null,
              JSON.stringify(data?.data || {}),
              req.ip,
              req.headers['user-agent']
            ]
          );
        } catch (err) {
          console.error('Audit log error:', err);
        }
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = { auditLog };
