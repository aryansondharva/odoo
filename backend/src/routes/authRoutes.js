const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);

module.exports = router;
