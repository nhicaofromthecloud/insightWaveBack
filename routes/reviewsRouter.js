const express = require("express");
const reviewController = require("../controllers/reviewController");
const Router = express.Router();

// POST route to add a review for a customer by email
Router.post("/:email", reviewController.addReviewToCustomer);
Router.get("/:email", reviewController.getCustomerReviews);
Router.get("/", reviewController.getAllReviews);
Router.delete("/:id", reviewController.deleteReview);
Router.delete("/", reviewController.deleteAllReviews);

module.exports = Router;
