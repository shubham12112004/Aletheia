const express = require("express");
const router = express.Router();
const { handleLandingChat } = require("../controllers/landingChatController");

// POST /api/landing-chat
router.post("/", handleLandingChat);

module.exports = router;
