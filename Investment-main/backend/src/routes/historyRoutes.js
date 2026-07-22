const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getHistory, getResearchById, deleteResearch, saveHistory } = require('../controllers/historyController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getHistory);
router.post('/', saveHistory);
router.get('/:id', getResearchById);
router.delete('/:id', deleteResearch);

module.exports = router;
