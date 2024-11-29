const axios = require("axios");

// Helper function to generate a random email address
function generateRandomEmail() {
  const domains = ["example.com", "test.com", "email.com", "domain.com"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomString = Math.random().toString(36).substring(7);
  return `${randomString}@${randomDomain}`;
}

// Helper function to generate random score
function generateRandomScore() {
  return Math.floor(Math.random() * 5) + 1; // Returns a score between 1 and 5
}

// Helper function to generate random sentiment
function generateRandomSentiment() {
  const sentiments = ["positive", "neutral", "negative"];
  return sentiments[Math.floor(Math.random() * sentiments.length)];
}

// Helper function to generate random responses to "Tell us your experience"
function generateRandomExperienceResponse() {
  const responses = [
    "NO IMPROVEMENTS",
    "GREAT SERVICE",
    "COULD BE BETTER",
    "NOT SATISFIED",
    "EXCELLENT SUPPORT",
    "WILL RECOMMEND",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to generate a random date as a timestamp within the current year (Jan - Dec)
function generateRandomDateThisYear() {
  const year = new Date().getFullYear();
  const month = Math.floor(Math.random() * 12); // Random month between 0 and 11
  const day = Math.floor(Math.random() * 28) + 1; // Random day between 1 and 28 to avoid invalid dates

  return new Date(year, month, day).getTime(); // Return timestamp in milliseconds
}

// Helper function to generate random data for the request
function generateRandomData() {
  return {
    responses: [
      {
        query: "Tell us your experience",
        res: generateRandomExperienceResponse(),
      },
      {
        query: "Please give us a star rating",
        res: generateRandomScore().toString(),
      },
    ],
    score: generateRandomScore(),
    sentiment: generateRandomSentiment(),
  };
}

// Function to send a POST request
async function sendPostRequest(email) {
  const url = `https://easy-next-piglet.ngrok-free.app/api/review/${email}`;
  const data = generateRandomData();

  try {
    const response = await axios.post(url, data);
    console.log(`Request to ${url} succeeded with status: ${response.status}`);
  } catch (error) {
    console.error(`Request to ${url} failed:`, error.message);
  }
}

// Main function to send 100 random POST requests
async function sendMultipleRequests() {
  for (let i = 0; i < 10; i++) {
    const randomEmail = generateRandomEmail();
    await sendPostRequest(randomEmail);
  }
}

sendMultipleRequests();
