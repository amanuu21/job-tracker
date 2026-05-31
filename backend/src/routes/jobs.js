const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const jobValidation = [
  body('title').trim().isLength({ min: 3, max: 255 }),
  body('department').trim().notEmpty(),
  body('description').trim().isLength({ min: 20 }),
  body('requirements').trim().isLength({ min: 10 }),
  body('deadline').isISO8601().toDate(),
  body('job_type').optional().isIn(['full_time', 'part_time', 'contract', 'internship', 'remote']),
];

// Public - get open jobs (auth optional)
router.get('/', (req, res, next) => {
  // Attach user if token present but don't require it
  const jwt = require('jsonwebtoken');
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
    } catch {}
  }
  next();
}, jobController.getJobs);

router.get('/departments', jobController.getDepartments);
router.get('/:id', jobController.getJobById);

// Protected routes
router.use(authenticate);
router.post('/', authorize('hr_staff', 'admin'), jobValidation, validate, jobController.createJob);
router.put('/:id', authorize('hr_staff', 'admin'), jobValidation, validate, jobController.updateJob);
router.delete('/:id', authorize('admin'), jobController.deleteJob);

module.exports = router;
