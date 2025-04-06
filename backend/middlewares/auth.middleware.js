const { isValidObjectId } = require("mongoose");
const User = require("../models/user");
const {
  AUTH_COOKIE_NAME,
  USER_DATA_HEADER_NAME,
} = require("../constants/index.js");
const jwt = require("jsonwebtoken");
const assert = require("assert");

async function authMiddleware(req, res, next) {
  try {
    const authToken = req.cookies[AUTH_COOKIE_NAME];

    if (!authToken) {
      throw new Error(
        `Not found auth token from cookies(expect cookie name ${AUTH_COOKIE_NAME})`
      );
    }

    assert(process.env.JWT_SECRET, `Expect JWT_SECRET environment!`);

    const { id } = jwt.verify(authToken, process.env.JWT_SECRET);

    if (!isValidObjectId(id)) {
      throw new Error(`Invalid object id: ${id}`);
    }

    const foundedUser = await User.findById(id);

    if (!foundedUser) {
      throw new Error(`User by id "${id}" not found!`);
    }

    const { _id, username } = foundedUser;

    req[USER_DATA_HEADER_NAME] = { _id, username };

    return next();
  } catch (error) {
    console.error(`User unauthorized: ${JSON.stringify(error)}`);

    return res
      .status(401)
      .json({ message: "Unauthorized", timestamp: Date.now() });
  }
}

module.exports = { authMiddleware };
