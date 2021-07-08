const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game");

router.get("/results", gameController.getResults);
router.get("/deals/:id", gameController.getDeals);

module.exports = router;
