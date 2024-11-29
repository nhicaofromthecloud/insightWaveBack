const mongoose = require("mongoose");
const ReviewModel = require("./review.model");

const customerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    reviews: {
      type: [ReviewModel.schema], // Use the imported review schema
      default: [],
    },
  },
  { timestamps: true },
);

// Static methods for the schema

// Get customer by email (Read)
customerSchema.statics.get = async function (email) {
  return await this.findOne({ email });
};

customerSchema.statics.getAll = async function () {
  return await this.find({});
};

// Create a new customer
customerSchema.statics.createCustomer = async function (email) {
  const existingCustomer = await this.findOne({ email });
  if (existingCustomer) {
    throw new Error("Customer with this email already exists.");
  }

  const customer = new this({ email });
  await customer.save();
  return customer;
};

// Update customer email or add reviews (Update)
customerSchema.statics.updateCustomer = async function (email, updates) {
  const customer = await this.findOneAndUpdate(
    { email },
    { $set: updates },
    { new: true },
  ); // return the updated document
  if (!customer) {
    throw new Error("Customer not found.");
  }
  return customer;
};

// Add a review to customer
customerSchema.statics.addReview = async function (email, reviewData) {
  const customer = await this.findOne({ email });
  if (!customer) {
    throw new Error("Customer not found.");
  }

  // Create a new review instance with customerId included
  const review = new ReviewModel({
    responses: reviewData.responses,
    customerId: customer._id, // Add the customerId to the review
    score: reviewData.score,
    sentiment: reviewData.sentiment,
  });

  // Save the review to the reviews collection
  await review.save();

  // Add the review data (as plain object) to the customer's embedded reviews array
  customer.reviews.push({
    responses: review.responses,
    customerId: review.customerId, // Add customerId to embedded review in customer
    createdAt: review.createdAt,
    score: review.score,
    sentiment: review.sentiment,
  });

  // Save the updated customer with the new review
  await customer.save();

  return customer;
};
// Delete customer by email (Delete)
customerSchema.statics.deleteCustomer = async function (email) {
  const customer = await this.findOneAndDelete({ email });
  if (!customer) {
    throw new Error("Customer not found.");
  }
  return customer;
};

// Create and export the model
const CustomerModel = mongoose.model("Customer", customerSchema);

module.exports = CustomerModel;
