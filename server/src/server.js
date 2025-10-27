import dotenv from "dotenv";
// import connectDB from "./db/db.js";
import cors from "cors";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(` Server is running on PORT: ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`Mongo DB Connection Failed`, err);
//   });

const PORT = process.env.PORT || 5010;

// Simulated AI responses for business analytics
const aiResponses = {
  analytics: [
    "Based on Q3 data, I'm seeing a 15% increase in user engagement with our mobile platform. The peak usage occurs between 7-9 PM daily.",
    "Sales analysis shows a 23% growth in the European market, particularly in Germany and France. This correlates with our recent marketing campaign.",
    "Customer retention rates have improved by 8% following the implementation of the premium loyalty program. The ROI looks promising at 145%.",
  ],
  insights: [
    "The data suggests users who engage with our tutorial content are 3x more likely to convert to paid plans within 30 days.",
    "There's a strong correlation between social media mentions and a 12% boost in website traffic. Instagram drives the highest quality leads.",
    "Our analysis indicates that customers using feature X have a 45% lower churn rate compared to those who don't.",
  ],
  reports: [
    "I can generate a comprehensive Q3 performance report showing revenue growth, user acquisition costs, and customer satisfaction metrics.",
    "The financial dashboard indicates a healthy 18% profit margin with operational costs decreasing by 7% quarter-over-quarter.",
    "Would you like me to prepare a competitor analysis report focusing on market share and feature comparisons?",
  ],
  general: [
    "I can help you analyze business metrics, generate reports, and provide data-driven insights. What specific area would you like to explore?",
    "Based on available data, I notice several optimization opportunities in your customer journey. Would you like me to elaborate?",
    "I'm ready to assist with data analysis, trend identification, and strategic recommendations for your business.",
  ],
};

// Helper function to generate AI-like response
function generateAIResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("analytics") ||
    lowerMessage.includes("data") ||
    lowerMessage.includes("metric")
  ) {
    return aiResponses.analytics[
      Math.floor(Math.random() * aiResponses.analytics.length)
    ];
  } else if (
    lowerMessage.includes("insight") ||
    lowerMessage.includes("trend") ||
    lowerMessage.includes("pattern")
  ) {
    return aiResponses.insights[
      Math.floor(Math.random() * aiResponses.insights.length)
    ];
  } else if (
    lowerMessage.includes("report") ||
    lowerMessage.includes("dashboard") ||
    lowerMessage.includes("summary")
  ) {
    return aiResponses.reports[
      Math.floor(Math.random() * aiResponses.reports.length)
    ];
  } else if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    return "Hello! I'm your Enterprise AI Analyst. I can help you with business analytics, data insights, and performance reports. What would you like to know?";
  } else {
    return aiResponses.general[
      Math.floor(Math.random() * aiResponses.general.length)
    ];
  }
}

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Enhanced chat endpoint
app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Simulate AI processing delay
  const processingTime = Math.random() * 800 + 400;

  setTimeout(() => {
    const reply = generateAIResponse(message);

    res.json({
      reply: reply,
      timestamp: new Date().toISOString(),
      messageId: Date.now(),
      type: "analysis_response",
    });
  }, processingTime);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Enterprise AI Analyst Backend",
    uptime: process.uptime(),
  });
});

// Analytics overview endpoint
app.get("/api/analytics/overview", (req, res) => {
  res.json({
    totalUsers: 12543,
    activeUsers: 8432,
    growthRate: 15.7,
    revenue: 284500,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
});
