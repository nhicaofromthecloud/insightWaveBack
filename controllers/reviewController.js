const CustomerModel = require("../models/customer.model");
const ReviewModel = require("../models/review.model");
const fs = require("fs");
const { analyzeReview } = require("../ai/ai.js");
const sentimentPrompt = fs.readFileSync(
  "./controllers/review.prompt.txt",
  "utf8",
);

// Controller to add a review for a customer, creating the customer if they don't exist
exports.addReviewToCustomer = async (req, res) => {
  const { email } = req.params; // Get the customer's email from the URL parameters
  const { responses: customerResponses } = req.body; // Extract review data from the request body

  try {
    const { score, mood } = await analyzeReview(
      sentimentPrompt,
      JSON.stringify(customerResponses),
    );

    // Check if all required fields are present
    if (!email || !customerResponses || !score || !mood) {
      return res
        .status(400)
        .json({ message: "Email, query, and review response are required." });
    }
    // Find the customer by email
    let customer = await CustomerModel.get(email);

    // If the customer doesn't exist, create a new customer
    if (!customer) {
      customer = await CustomerModel.createCustomer(email);
    }

    // Create the new review object
    const newReview = {
      responses: customerResponses,
      //createdAt: getRandomDateWithinLastYear(),
      score: score,
      sentiment: mood,
    };

    // Add the review to the customer
    const updatedCustomer = await CustomerModel.addReview(email, newReview);

    // Return the updated customer with the review added
    return res.status(200).json({
      message: "Review added successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    // Handle any potential errors
    return res.status(500).json({
      message: error.message || "An error occurred while adding the review.",
    });
  }
};

function getRandomDateWithinLastYear() {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Generate a random timestamp between one year ago and now
  const randomTimestamp =
    oneYearAgo.getTime() +
    Math.random() * (now.getTime() - oneYearAgo.getTime());

  return new Date(randomTimestamp).toISOString();
}

// Controller to get reviews of a customer by email
exports.getCustomerReviews = async (req, res) => {
  const { email } = req.params; // Assuming email is passed as a route parameter

  try {
    // Fetch customer with reviews
    const customer = await CustomerModel.get(email);

    // If customer not found
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Return customer reviews
    return res.status(200).json({ reviews: customer.reviews });
  } catch (error) {
    // Handle errors
    return res.status(500).json({ message: error.message });
  }
};

// Controller to get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews from the reviews collection
    const reviews = await ReviewModel.getAll();

    // Return all reviews
    return res.status(200).json({ reviews });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      message: error.message || "An error occurred while fetching all reviews.",
    });
  }
};

// Controller to delete a single review by ID
exports.deleteReview = async (req, res) => {
  const { id } = req.params; // Assuming the review ID is passed as a route parameter

  try {
    // Attempt to delete the review by ID
    const deletedReview = await ReviewModel.delete(id);

    // If no review was found, return a 404 error
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Return success message
    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      message: error.message || "An error occurred while deleting the review.",
    });
  }
};

// Controller to delete all reviews
exports.deleteAllReviews = async (req, res) => {
  try {
    // Attempt to delete all reviews
    const deletedCount = await ReviewModel.deleteAll();

    // Return success message with the count of deleted reviews
    return res.status(200).json({
      message: `${deletedCount} reviews deleted successfully.`,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      message: error.message || "An error occurred while deleting all reviews.",
    });
  }
};
