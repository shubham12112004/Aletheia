const { Router } = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

// Protect all watchlist routes
router.use(requireAuth);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:ticker', removeFromWatchlist);

module.exports = router;
