const { Router } = require("express");
const marketController = require("../controllers/marketController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = Router();

// Protect all market routes
router.use(requireAuth);

router.get("/overview", marketController.getOverview);
router.get("/screener", marketController.getScreener);
router.get("/portfolio", marketController.getPortfolio);

module.exports = router;
