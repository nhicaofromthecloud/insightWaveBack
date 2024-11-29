const express = require("express");
const reviewController = require("../controllers/reviewController");
const Router = express.Router();

// POST route to add a review without authentication
Router.post("/:email", reviewController.addReviewToCustomer);

module.exports = Router;