const { Router } = require("express");

const authRoutes = require("./authRoutes");
const healthRoutes = require("./healthRoutes");
const integrationRoutes = require("./integrationRoutes");
const researchRoutes = require("./researchRoutes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/integrations", integrationRoutes);
router.use("/research", researchRoutes);

module.exports = router;