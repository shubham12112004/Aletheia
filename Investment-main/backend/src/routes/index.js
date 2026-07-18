const { Router } = require("express");

const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");
const healthRoutes = require("./healthRoutes");
const integrationRoutes = require("./integrationRoutes");
const researchRoutes = require("./researchRoutes");
const watchlistRoutes = require("./watchlistRoutes");
const settingsRoutes = require("./settingsRoutes");
const landingChatRoutes = require("./landingChatRoutes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/integrations", integrationRoutes);
router.use("/research", researchRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/settings", settingsRoutes);
router.use("/landing-chat", landingChatRoutes);

module.exports = router;