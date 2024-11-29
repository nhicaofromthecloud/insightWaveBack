const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const CustomerModel = require('../models/customer.model');
const dotenv = require("dotenv");
const path = require('path');

// Update dotenv config to use absolute path
dotenv.config({ path: path.resolve(__dirname, '../config.env') });

// Read the sentiment prompt
const sentimentPrompt = fs.readFileSync("./controllers/review.prompt.txt", "utf8");

// TEMPORARY HARD-CODED CONFIG - FOR TESTING ONLY
// TODO: REMOVE BEFORE COMMITTING OR DEPLOYING


// Function to interact with OpenAI's Chat API
async function completePrompt(prompt) {
  return await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.OPEN_AI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that analyzes customer reviews and provides a summary in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 256,
      temperature: 0.2,
      stream: false,
    }),
  }).then((res) => res.json());
}

// Function to analyze review
async function analyzeReview(promptTemplate, review) {
  const promptWithReview = promptTemplate.replace("${review}", review);
  const result = await completePrompt(promptWithReview);
  
  const finalAnswerMatch = result.choices[0].message.content.match(/Final Answer:\s*\{(.+?)\}/);
  
  if (finalAnswerMatch) {
    const finalAnswerString = `{${finalAnswerMatch[1].trim()}}`;
    return JSON.parse(finalAnswerString);
  } else {
    console.log("Final Answer not found in the text.");
    return null;
  }
}

// Function to process a single review
async function processReview(reviewData) {
  try {
    // Validate input data
    if (!reviewData.email || !reviewData.review || !reviewData.date) {
      throw new Error('Missing required fields: email, review, or date');
    }

    const { email, review, date } = reviewData;
    
    // Validate date format
    if (isNaN(new Date(date).getTime())) {
      throw new Error('Invalid date format');
    }

    // Format the review as an array with query/res structure if it isn't already
    const formattedReview = Array.isArray(review) ? review : [{
      query: "Tell us your experience",
      res: review
    }];
    
    // Analyze the review using AI
    const { score, mood } = await analyzeReview(
      sentimentPrompt,
      formattedReview[0].res
    );

    if (typeof score !== 'number' || !mood) {
      throw new Error(`Invalid AI analysis result: score=${score}, mood=${mood}`);
    }

    // Find or create customer
    let customer = await CustomerModel.get(email);
    if (!customer) {
      customer = await CustomerModel.createCustomer(email);
    }

    // Create review object with the specified date
    const newReview = {
      responses: formattedReview,
      customerId: customer._id,
      score: score,
      sentiment: mood,
      createdAt: new Date(date)  // Set the date here
    };

    // Add review to customer (this will create the review in both collections)
    const updatedCustomer = await CustomerModel.addReview(email, newReview);

    // Get the most recently added review for this customer
    const ReviewModel = mongoose.model('Review');
    const latestReview = await ReviewModel.findOne(
      { customerId: customer._id },
      {},
      { sort: { '_id': -1 } }
    );

    // Update its createdAt date
    if (latestReview) {
      await ReviewModel.findByIdAndUpdate(
        latestReview._id,
        { 
          $set: { 
            createdAt: new Date(date),
            updatedAt: new Date(date)
          } 
        },
        { timestamps: false }
      );

      // Verify the final review
      const finalReview = await ReviewModel.findById(latestReview._id);
      console.log(`Successfully processed review for ${email} with date ${finalReview.createdAt}`);
    }
    
    return { success: true, email: email };
  } catch (error) {
    console.error(`Error processing review for ${reviewData?.email || 'unknown email'}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Function to process single test case
async function testSingleReview() {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Function to generate random date in 2024
    const getRandomDate = () => {
      const start = new Date('2024-01-01');
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    const testReviews = [
      {
        email: 'test1@example.com',
        review: [{
          query: "Tell us your experience",
          res: "This is a great product! Really enjoyed using it."
        }],
        date: getRandomDate()
      },
      {
        email: 'test2@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Not satisfied with the quality. Expected better."
        }],
        date: getRandomDate()
      },
      {
        email: 'test3@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Amazing customer service and fast delivery!"
        }],
        date: getRandomDate()
      },
      {
        email: 'test4@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Product arrived damaged. Very disappointing."
        }],
        date: getRandomDate()
      },
      {
        email: 'test5@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Decent product for the price. Would recommend."
        }],
        date: getRandomDate()
      },
      {
        email: 'test6@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Perfect fit for my needs. Will buy again!"
        }],
        date: getRandomDate()
      },
      {
        email: 'test7@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Instructions were unclear. Struggled with setup."
        }],
        date: getRandomDate()
      },
      {
        email: 'test8@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Good value for money. Happy with purchase."
        }],
        date: getRandomDate()
      },
      {
        email: 'test9@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Exceeded expectations. Highly recommend!"
        }],
        date: getRandomDate()
      },
      {
        email: 'test10@example.com',
        review: [{
          query: "Tell us your experience",
          res: "Average product. Nothing special."
        }],
        date: getRandomDate()
      }
    ];

    // Sort reviews by date
    testReviews.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Starting to process 10 test reviews...');
    let successCount = 0;
    let failCount = 0;

    for (const [index, review] of testReviews.entries()) {
      const result = await processReview(review);
      
      if (result.success) {
        successCount++;
        const customer = await CustomerModel.get(review.email);
        const lastReview = customer.reviews[customer.reviews.length - 1];
        console.log(`Test ${index + 1} successful:`, {
          email: review.email,
          date: review.date,
          score: lastReview.score,
          sentiment: lastReview.sentiment
        });
      } else {
        failCount++;
        console.log(`Test ${index + 1} failed:`, result.error);
      }
    }

    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: 10`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${(successCount / 10 * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Function to process all reviews from CSV
async function processAllReviews() {
  let connection;
  try {
    connection = await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('Connected to MongoDB');

    const reviews = [];
    
    if (!fs.existsSync('data/generated_reviews.csv')) {
      throw new Error('Reviews CSV file not found');
    }
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('data/generated_reviews.csv')
        .pipe(csv())
        .on('data', (data) => reviews.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const totalReviews = reviews.length;
    console.log(`Starting to process ${totalReviews} reviews...`);
    
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    for (const [index, review] of reviews.entries()) {
      const result = await processReview(review);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Log progress every 10 reviews or on the last review
      if (index % 10 === 0 || index === totalReviews - 1) {
        const progressPercent = ((index + 1) / totalReviews * 100).toFixed(1);
        console.log(`Progress: ${index + 1}/${totalReviews} (${progressPercent}%)`);
        console.log(`Success: ${successCount} | Failed: ${failCount}`);
      }
    }

    // Final summary
    console.log('\n=== Final Summary ===');
    console.log(`Total Reviews Processed: ${totalReviews}`);
    console.log(`Successfully Saved: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((successCount / totalReviews) * 100).toFixed(1)}%`);
    
    if (failCount > 0) {
      console.log('\nFailed Reviews:');
      const failedReviews = results
        .filter(r => !r.success)
        .map(r => `${r.email}: ${r.error}`)
        .join('\n');
      console.log(failedReviews);
    }

  } catch (error) {
    console.error('Fatal error during review processing:', error.message);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

async function testWeeklyReviews() {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Function to generate random date within last 7 days
    const getRandomWeekDate = () => {
      const end = new Date();
      const start = new Date(end - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Using the same review templates from utils/generateData.js
    const reviewTemplates = [
      {
        query: "Tell us your experience",
        res: "Excellent service, very satisfied with my purchase!"
      },
      {
        query: "Tell us your experience",
        res: "Product quality could be better, but decent overall."
      },
      {
        query: "Tell us your experience",
        res: "Fast shipping and great customer support."
      },
      {
        query: "Tell us your experience",
        res: "Not what I expected, quite disappointed."
      },
      {
        query: "Tell us your experience",
        res: "Amazing product, will definitely buy again!"
      }
    ];

    // Generate 20 reviews (about 3 per day)
    const weeklyReviews = Array.from({ length: 20 }, (_, i) => ({
      email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
      review: [reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]],
      date: getRandomWeekDate()
    }));

    // Sort reviews by date
    weeklyReviews.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Starting to process weekly test reviews...');
    let successCount = 0;
    let failCount = 0;

    for (const [index, review] of weeklyReviews.entries()) {
      const result = await processReview(review);
      
      if (result.success) {
        successCount++;
        const customer = await CustomerModel.get(review.email);
        const lastReview = customer.reviews[customer.reviews.length - 1];
        console.log(`Review ${index + 1} successful:`, {
          email: review.email,
          date: review.date,
          score: lastReview.score,
          sentiment: lastReview.sentiment
        });
      } else {
        failCount++;
        console.log(`Review ${index + 1} failed:`, result.error);
      }

      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n=== Weekly Data Summary ===');
    console.log(`Total Reviews: 20`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${(successCount / 20 * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}


async function testLastWeekReviews() {
    try {
      await mongoose.connect(CONFIG.MONGODB_URI);
      console.log('Connected to MongoDB');
  
      // Function to generate random date from week before last week
      const getRandomWeekDate = () => {
        const end = new Date(new Date() - 7 * 24 * 60 * 60 * 1000); // Last week
        const start = new Date(end - 7 * 24 * 60 * 60 * 1000); // Week before last week
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().slice(0, 19).replace('T', ' ');
      };
  
      // Using the same review templates from utils/generateData.js
      const reviewTemplates = [
        {
          query: "Tell us your experience",
          res: "Excellent service, very satisfied with my purchase!"
        },
        {
          query: "Tell us your experience",
          res: "Product quality could be better, but decent overall."
        },
        {
          query: "Tell us your experience",
          res: "Fast shipping and great customer support."
        },
        {
          query: "Tell us your experience",
          res: "Not what I expected, quite disappointed."
        },
        {
          query: "Tell us your experience",
          res: "Amazing product, will definitely buy again!"
        }
      ];
  
      // Generate 20 reviews (about 3 per day)
      const weeklyReviews = Array.from({ length: 20 }, (_, i) => ({
        email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
        review: [reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]],
        date: getRandomWeekDate()
      }));
  
      // Sort reviews by date
      weeklyReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      console.log('Starting to process weekly test reviews...');
      let successCount = 0;
      let failCount = 0;
  
      for (const [index, review] of weeklyReviews.entries()) {
        const result = await processReview(review);
        
        if (result.success) {
          successCount++;
          const customer = await CustomerModel.get(review.email);
          const lastReview = customer.reviews[customer.reviews.length - 1];
          console.log(`Review ${index + 1} successful:`, {
            email: review.email,
            date: review.date,
            score: lastReview.score,
            sentiment: lastReview.sentiment
          });
        } else {
          failCount++;
          console.log(`Review ${index + 1} failed:`, result.error);
        }
  
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      console.log('\n=== Weekly Data Summary ===');
      console.log(`Total Reviews: 20`);
      console.log(`Successful: ${successCount}`);
      console.log(`Failed: ${failCount}`);
      console.log(`Success Rate: ${(successCount / 20 * 100).toFixed(1)}%`);
  
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }

// Update the module exports
module.exports = {
  testSingleReview,
  processAllReviews,
  testWeeklyReviews
};

// Update the main execution block
if (require.main === module) {
  testLastWeekReviews()
    .then(() => {
      console.log('Weekly test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Weekly test failed:', error);
      process.exit(1);
    });
} 