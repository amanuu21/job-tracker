const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const evaluationController = require('../controllers/evaluationController');
const { authenticate, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.use(authenticate);
router.use(authorize('committee_member', 'hr_staff', 'admin'));

router.post('/', [
  body('application_id').isUUID(),
  body('technical_score').isInt({ min: 1, max: 10 }),
  body('communication_score').isInt({ min: 1, max: 10 }),
  body('experience_score').isInt({ min: 1, max: 10 }),
  body('recommendation').isIn(['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend']),
], validate, evaluationController.submitEvaluation);

router.get('/my', evaluationController.getMyEvaluations);
router.get('/application/:application_id', evaluationController.getEvaluationsByApplication);

module.exports = router;
