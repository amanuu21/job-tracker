const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('hr_staff', 'admin'));

router.get('/dashboard', reportController.getDashboardStats);
router.get('/applications', reportController.getApplicationReport);
router.get('/hiring-funnel', reportController.getHiringFunnel);
router.get('/audit-logs', authorize('admin'), reportController.getAuditLogs);

module.exports = router;
