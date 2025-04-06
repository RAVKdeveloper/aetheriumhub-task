const { isValidObjectId } = require("mongoose");
const Save = require("../models/save");
const { USER_DATA_HEADER_NAME } = require("../constants/index.js");

exports.saveGameData = async (req, res) => {
  const { userID, gameDate, failed, difficulty, completed, timeTaken } =
    req.body;

  console.log("Received data to save:", req.body);

  try {
    if (
      !userID ||
      !gameDate ||
      difficulty === undefined ||
      completed === undefined ||
      timeTaken === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newSave = new Save({
      userID,
      gameDate,
      failed,
      difficulty,
      completed,
      timeTaken,
    });

    await newSave.save();
    res.status(201).json({ message: "Game data saved successfully" });
  } catch (error) {
    console.error("Error saving game data:", error);
    res.status(500).json({ message: "Error saving game data", error });
  }
};

exports.getGameResultById = async (req, res) => {
  const { _id: userID } = req[USER_DATA_HEADER_NAME];
  const gameId = req.params.id;

  if (!gameId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!isValidObjectId(gameId)) {
    return res.status(400).json({ message: "Game id is not valid!" });
  }

  try {
    const result = await Save.findOne({ _id: gameId, userID });

    if (!result) {
      return res
        .status(404)
        .json({ message: `Game history by id ${gameId} not found!` });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error get game result by id:", error);
    return res
      .status(500)
      .json({ message: "Error get game result by id", error });
  }
};

exports.getGamesResultByUserId = async (req, res) => {
  try {
    const { _id: userID } = req[USER_DATA_HEADER_NAME];
    let { page, limit } = req.query;

    page = Number.isFinite(page) ? Number(page) : 1;
    limit = Number.isFinite(limit) ? Number(limit) : 10;

    const gameResults = await Save.find({ userID })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Save.countDocuments({ userID });

    return {
      totalCount,
      data: gameResults,
    };
  } catch (error) {
    console.error("Error get games result by user id:", error);
    return res.status(500).json({ message: "Error saving game data", error });
  }
};
