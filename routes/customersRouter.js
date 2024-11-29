const express = require("express");
const customerController = require("../controllers/customerControllers");
const Router = express.Router();

Router.post("/", customerController.createCustomer);
Router.get("/", customerController.getAllCustomers);
Router.get("/:email", customerController.getCustomer);
Router.put("/:email", customerController.updateCustomer);
Router.post("/:email/review", customerController.addReview);
Router.delete("/:email", customerController.deleteCustomer);

module.exports = Router;
