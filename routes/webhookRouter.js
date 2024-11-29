const express = require("express");
const webhookController = require("../controllers/webhookControllers");

const Router = express.Router();

Router.get("/", webhookController.getWebhook);
Router.post("/", webhookController.receiveUpdate);

module.exports = Router;
