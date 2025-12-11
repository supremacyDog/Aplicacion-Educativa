const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const { isProfessor } = require("../middleware/auth");

router.get("/:id", topicController.getTopicById);

router.put("/:id/edit", isProfessor, topicController.updateTopic);

module.exports = router;