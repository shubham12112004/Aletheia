const { Router } = require("express");
const { runResearch } = require("../controllers/researchController");

const router = Router();

router.post("/", runResearch);

module.exports = router;