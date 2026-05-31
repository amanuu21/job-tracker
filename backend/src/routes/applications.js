const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../utils/cloudinary');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.use(authenticate);

// Applicant routes
router.post('/', authorize('applicant'), uploadDocument.single('cv'), [
  body('job_id').isUUID(),
], validate, applicationController.submitApplication);

router.get('/my', authorize('applicant'), applicationController.getMyApplications);
router.patch('/:id/withdraw', authorize('applicant'), applicationController.withdrawApplication);

// HR / Admin / Committee routes
router.get('/', authorize('hr_staff', 'admin', 'committee_member'), applicationController.getAllApplications);
router.get('/job/:job_id', authorize('hr_staff', 'admin', 'committee_member'), applicationController.getApplicationsByJob);
router.patch('/:id/status', authorize('hr_staff', 'admin'), [
  body('status').isIn(['under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected']),
], validate, applicationController.updateApplicationStatus);

module.exports = router;
