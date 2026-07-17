const { Router } = require('express');
const { googleLogin, verifyTurnstile } = require('../controllers/authController');

const router = Router();

router.post('/verify-turnstile', verifyTurnstile);
router.post('/google', googleLogin);

module.exports = router;
