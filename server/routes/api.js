const express = require("express");
const router = express.Router();
const brickGame = require("../controllers/master");

router.get("/play", brickGame.game);
