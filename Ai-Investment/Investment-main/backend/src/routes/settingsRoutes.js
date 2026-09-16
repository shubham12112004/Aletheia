const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
  updateWorkspace,
  updateNotifications,
  updateTheme,
  updateSecurity,
  updateApiKeys,
  updateRuntime,
  updateAnalysis,
  deleteAccount
} = require('../controllers/settingsController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getSettings);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/preferences', updatePreferences);
router.put('/workspace', updateWorkspace);
router.put('/notifications', updateNotifications);
router.put('/theme', updateTheme);
router.put('/security', updateSecurity);
router.put('/apis', updateApiKeys);
router.put('/runtime', updateRuntime);
router.put('/analysis', updateAnalysis);
router.delete('/account', deleteAccount);

module.exports = router;
