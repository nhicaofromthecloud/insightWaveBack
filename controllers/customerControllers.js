const CustomerModel = require("../models/customer.model");

// Controller to handle customer creation
exports.createCustomer = async (req, res) => {
  const { email } = req.body;

  try {
    const customer = await CustomerModel.createCustomer(email);
    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Error occurred while creating customer",
    });
  }
};

// Controller to get a customer by email
exports.getCustomer = async (req, res) => {
  const { email } = req.params;

  try {
    const customer = await CustomerModel.get(email);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error occurred while retrieving customer",
    });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customer = await CustomerModel.getAll();
    if (!customer) {
      return res.status(404).json({
        message: "Some error happned, cannot get all customers",
      });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error occurred while retrieving all customer",
    });
  }
};

// Controller to update a customer's information (email or other fields)
exports.updateCustomer = async (req, res) => {
  const { email } = req.params;
  const updates = req.body;

  try {
    const customer = await CustomerModel.updateCustomer(email, updates);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }
    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error occurred while updating customer",
    });
  }
};

// Controller to add a review to a customer
exports.addReview = async (req, res) => {
  const { email } = req.params;
  const review = req.body;

  try {
    const customer = await CustomerModel.addReview(email, review);
    res.status(200).json({
      message: "Review added successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error occurred while adding review",
    });
  }
};

// Controller to delete a customer by email
exports.deleteCustomer = async (req, res) => {
  const { email } = req.params;

  try {
    const customer = await CustomerModel.deleteCustomer(email);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }
    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error occurred while deleting customer",
    });
  }
};
