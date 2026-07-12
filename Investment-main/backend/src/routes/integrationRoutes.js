const { Router } = require('express');
const {
  geminiGenerate,
  getCompanyNews,
  getCompanyProfile,
  searchCompany,
  tavilySearch,
} = require('../controllers/integrationController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.get('/companies/search', requireAuth, searchCompany);
router.get('/companies/:symbol/profile', requireAuth, getCompanyProfile);
router.get('/news', requireAuth, getCompanyNews);
router.get('/tavily/search', requireAuth, tavilySearch);
router.post('/gemini/generate', requireAuth, geminiGenerate);

module.exports = router;
