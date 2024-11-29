const express = require("express");
const userController = require("../controllers/userControllers");

const Router = express.Router();

// Public authentication routes
Router.post("/signup", userController.validateSignup, userController.signUp);
Router.post("/login", userController.validateSignin, userController.logIn);

module.exports = Router; 