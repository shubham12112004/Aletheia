const { Router } = require("express");
const { runResearch } = require("../controllers/researchController");
const { optionalAuth } = require("../middleware/authMiddleware");

const router = Router();

router.post("/", optionalAuth, runResearch);

module.exports = router;