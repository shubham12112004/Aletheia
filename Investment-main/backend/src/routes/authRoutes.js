const { Router } = require('express');
const {
  googleLogin,
  emailSignup,
  emailLogin,
  forgotPassword,
  updateProfile,
  updatePassword,
  deleteAccount,
  verifyTurnstile
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('/verify-turnstile', verifyTurnstile);
router.post('/google', googleLogin);
router.post('/signup', emailSignup);
router.post('/login', emailLogin);
router.post('/forgot-password', forgotPassword);

// Protected profile/auth operations
router.post('/update-profile', requireAuth, updateProfile);
router.post('/update-password', requireAuth, updatePassword);
router.delete('/delete-account', requireAuth, deleteAccount);

module.exports = router;
