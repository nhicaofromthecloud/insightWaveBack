const mongoose = require("mongoose");

// Helper function to generate a random date within the current year using Date.now()
function getRandomDateThisYear() {
  const now = Date.now();
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime(); // January 1st of the current year
  const endOfYear = new Date(
    new Date().getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999,
  ).getTime(); // December 31st of the current year

  // Generate a random offset within the range from start of the year to end of the year
  const randomOffset = Math.random() * (endOfYear - startOfYear);

  // Randomly add or subtract the offset from the current date
  const randomTimestamp = startOfYear + randomOffset;
  return new Date(randomTimestamp);
}

// Define the Response schema
const responseSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  res: {
    type: String,
    required: true,
  },
});

// Define the Review schema
const reviewSchema = new mongoose.Schema({
  responses: {
    type: [responseSchema],
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Customer model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(), 
  },
  score: {
    type: Number,
    required: true,
  },
  sentiment: {
    type: String,
    required: true,
  },
});

// Add a static method to get all reviews from the collection
reviewSchema.statics.getAll = async function () {
  try {
    return await this.find(); // Retrieve all reviews
  } catch (error) {
    throw new Error("Error retrieving reviews: " + error.message);
  }
};

// Add a static method to delete a single review by ID
reviewSchema.statics.delete = async function (id) {
  try {
    const review = await this.findByIdAndDelete(id); // Find review by ID and delete it
    if (!review) {
      throw new Error("Review not found.");
    }
    return review; // Return the deleted review
  } catch (error) {
    throw new Error("Error deleting review: " + error.message);
  }
};

// Add a static method to delete all reviews
reviewSchema.statics.deleteAll = async function () {
  try {
    const result = await this.deleteMany({}); // Delete all reviews
    return result.deletedCount; // Return the number of deleted documents
  } catch (error) {
    throw new Error("Error deleting all reviews: " + error.message);
  }
};

// Create the Review model
const ReviewModel = mongoose.model("Review", reviewSchema);

module.exports = ReviewModel;
