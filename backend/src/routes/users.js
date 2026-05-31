const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../utils/cloudinary');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('first_name').trim().isLength({ min: 2, max: 50 }),
  body('last_name').trim().isLength({ min: 2, max: 50 }),
], validate, userController.updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), userController.uploadAvatar);
router.put('/change-password', [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], validate, userController.changePassword);

// Admin routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.put('/:id/role', authorize('admin'), [
  body('role').isIn(['applicant', 'hr_staff', 'committee_member', 'admin']),
], validate, userController.updateUserRole);
router.patch('/:id/toggle-status', authorize('admin'), userController.toggleUserStatus);

module.exports = router;
