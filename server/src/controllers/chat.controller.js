// ============================================================
// Import Required Modules and Utilities
// ============================================================

// AiResponse: a Mongoose model that defines the structure of chat responses
// stored in MongoDB (message from user and AI-generated reply).
import { AiResponse } from "../models/aiResponse.model.js";

// generateAIResponse: a function that simulates or generates an AI-based reply
// based on the user's input message.
import { aiResponses } from "../Messages/generateAIResponse.js";

// ApiError: a custom error handling class that helps create structured error messages
// with HTTP status codes and clear messages.
import { ApiError } from "../utils/ApiError.js";

// asyncHandler: a helper function that wraps async functions in Express.
// It automatically passes errors to the global error handler without manual try/catch.
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ============================================================
// Controller: chatWithAI
// ============================================================
// This function handles chat requests between the user and the AI system.
// The flow:
// 1. Receive the user's message from the frontend.
// 2. Validate that a message exists.
// 3. Simulate AI response generation delay (for realism).
// 4. Generate a reply using the generateAIResponse() function.
// 5. Save both message and reply in MongoDB.
// 6. Return a structured response to the frontend.
// ============================================================

const chatWithAI = asyncHandler(async (req, res) => {
  // ------------------------------------------------------------
  // Step 1: Extract message from the request body
  // ------------------------------------------------------------
  // The frontend sends a JSON object, e.g. { "message": "Hello AI" }
  const { message } = req.body;

  // ------------------------------------------------------------
  // Step 2: Validate that the message is provided
  // ------------------------------------------------------------
  // If the message is missing or empty, throw a 400 Bad Request error.
  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  // ------------------------------------------------------------
  // Step 3: Simulate AI processing time
  // ------------------------------------------------------------
  // Generate a random delay (between 400ms and 1200ms) to mimic the time
  // an AI model would take to generate a thoughtful response.
  const processingTime = Math.random() * 800 + 400;

  // Await a promise that resolves after the simulated delay.
  // This prevents blocking and allows other requests to be processed concurrently.
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  // ------------------------------------------------------------
  // Step 4: Generate AI response
  // ------------------------------------------------------------
  // The generateAIResponse() function contains the logic for how the AI
  // forms its reply based on the input message.
  // It can be simple (rule-based) or complex (LLM-powered).
  const reply = await aiResponses(message);

  // ------------------------------------------------------------
  // Step 5: Save chat data to MongoDB
  // ------------------------------------------------------------
  // Store both the user message and the AI's reply for record-keeping or analytics.
  await AiResponse.create({ message, reply });

  // ------------------------------------------------------------
  // Step 6: Send structured response back to the frontend
  // ------------------------------------------------------------
  // We return an object that includes:
  // - The AI reply text
  // - A timestamp (to track when the response was created)
  // - A unique messageId (for tracking)
  // - A type identifier ("analysis_response") to categorize responses.
  return res
    .status(200)
    .json(new ApiResponse(200, { reply }, "AI response generated successful"));
});

// ============================================================
// Export Controller
// ============================================================
// This allows the controller to be imported and used inside
// your route files (for example, chat.route.js).
export { chatWithAI };

// import { generateAIResponse } from "../Messages/generateAIResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { AiResponse } from "../models/aiResponse.model.js";

// export const chatWithAI = asyncHandler(async (req, res) => {
//   const { message } = req.body;

//   if (!message) throw new ApiError(400, "Message is required");

//   const reply = (await generateAIResponse(message)) || "No AI reply generated.";

//   await AiResponse.create({ message, reply });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { reply }, "AI response generated"));
// });
