const mongoose = require("mongoose");

// Import the customer schema if needed (assuming it's in the same directory)
// const Customer = require("./customer.model");

const analysisSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // Reference to the Customer model
    required: true,
  },
  dateRange: {
    start: {
      type: Date, // Start date of the analysis (optional)
    },
    end: {
      type: Date, // End date of the analysis (optional)
    },
  },
  analysisType: {
    type: String,
    enum: ["sentiment", "keyword", "summary"], // Example analysis types
    required: true,
  },
  results: {
    type: Map, // Flexible structure to store various analysis results
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation time
  },
});

// Static method to filter by date range
analysisSchema.statics.findByDateRange = async function (
  customerId,
  startDate,
  endDate,
) {
  const query = { customer: customerId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  return await this.find(query);
};

// Create and export the model
const AnalysisModel = mongoose.model("Analysis", analysisSchema);

module.exports = AnalysisModel;
