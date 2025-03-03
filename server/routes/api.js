const express = require("express");
const router = express.Router();
const ctrlGame = require("../controllers/master");
const ctrlAuth = require("../controllers/auth");

router.get("/auth/login", ctrlGame.game);
router.post('/auth/login', ctrlAuth.login);
module.exports = router;
