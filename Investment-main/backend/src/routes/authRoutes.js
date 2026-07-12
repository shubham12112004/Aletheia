const { Router } = require('express');
const { googleLogin } = require('../controllers/authController');

const router = Router();

router.post('/google', googleLogin);

module.exports = router;
