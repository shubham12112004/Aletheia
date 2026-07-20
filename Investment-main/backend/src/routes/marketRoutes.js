const { Router } = require("express");
const marketController = require("../controllers/marketController");
const { authenticate } = require("../middleware/authMiddleware");

const router = Router();

// Protect all market routes
router.use(authenticate);

router.get("/overview", marketController.getOverview);
router.get("/screener", marketController.getScreener);
router.get("/portfolio", marketController.getPortfolio);

module.exports = router;
