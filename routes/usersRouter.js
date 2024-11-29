const express = require("express");
const userController = require("../controllers/userControllers");

const Router = express.Router();

// Protected user routes
Router.get("/get", userController.getUser);
Router.delete("/delete", userController.deleteUser);

module.exports = Router;
