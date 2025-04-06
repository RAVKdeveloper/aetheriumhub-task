const express = require("express");
const {
  saveGameData,
  getGameResultById,
  getGamesResultByUserId,
} = require("../controllers/memoryController.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const router = express.Router();

// Route to save game data
router.post("/save", saveGameData);

router.get("/game/history", authMiddleware, getGamesResultByUserId);

router.get("/game/history/:id", authMiddleware, getGameResultById);

module.exports = router;
