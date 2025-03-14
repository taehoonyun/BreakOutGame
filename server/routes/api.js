const express = require("express");
const router = express.Router();
const ctrlGame = require("../controllers/master");
const ctrlAuth = require("../controllers/auth");
const ctrlUtil = require("../controllers/util");

router.get("/auth/login", ctrlGame.game);
router.post('/auth/login', ctrlAuth.login);
router.post('/util/deepseek', ctrlUtil.openAI);


module.exports = router;
