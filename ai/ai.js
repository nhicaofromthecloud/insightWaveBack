const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from config file
dotenv.config({ path: "../config.env" });

// Load prompt data from files

// Function to interact with OpenAI's Chat API using GPT-4-turbo
async function completePrompt(prompt) {
  return await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that analyzes customer reviews and provides a summary in JSON format.",
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

// Function that expects a prompt template and a review
async function analyzeReview(promptTemplate, review) {
  // Replace the placeholder in the prompt template with the actual review
  const promptWithReview = promptTemplate.replace("${review}", review);

  // Call the completePrompt function and handle the response
  const result = await completePrompt(promptWithReview);

  // Extract the final answer using a refined regex
  const finalAnswerMatch = result.choices[0].message.content.match(
    /Final Answer:\s*\{(.+?)\}/,
  );

  if (finalAnswerMatch) {
    const finalAnswerString = `{${finalAnswerMatch[1].trim()}}`;

    // Parse the string as JSON
    const finalAnswer = JSON.parse(finalAnswerString);

    // Return the final answer object
    return finalAnswer;
  } else {
    console.log("Final Answer not found in the text.");
    return null;
  }
}

module.exports = { analyzeReview };
