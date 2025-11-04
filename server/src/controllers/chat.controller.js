import { AiResponse } from "../models/aiResponse.model.js";
import { generateAIResponse } from "../Messages/generateAIResponse.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  const processingTime = Math.random() * 800 + 400;

  // Await a small delay to simulate AI processing (safe inside async handler)
  await new Promise((resolve) => setTimeout(resolve, processingTime));
  const reply = generateAIResponse(message);

  // Save to DB
  await AiResponse.create({ message, reply });

  return res.status(200).json({
    reply,
    timestamp: new Date().toISOString(),
    messageId: Date.now(),
    type: "analysis_response",
  });
});

export { chatWithAI };
