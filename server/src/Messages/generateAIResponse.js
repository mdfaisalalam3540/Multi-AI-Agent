import { openai } from "../utils/openaiClient.js";

export const aiResponses = async (message) => {
  if (!message || message.trim() === "") return "Please provide a message.";

  try {
    // ✅ Correct new SDK syntax — no “.chat.completions”
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_completion_tokens: 300, // updated name
    });

    const aiReply = completion?.choices?.[0]?.message?.content?.trim();

    // ✅ Fallback safety
    if (!aiReply) return "⚠️ No AI reply generated. Please try again.";

    return aiReply;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "⚠️ AI service error, please try again later.";
  }
};

// // static response
// const aiResponses = {
//   analytics: [
//     "Based on Q3 data, I'm seeing a 15% increase in user engagement with our mobile platform. The peak usage occurs between 7-9 PM daily.",
//     "Sales analysis shows a 23% growth in the European market, particularly in Germany and France. This correlates with our recent marketing campaign.",
//     "Customer retention rates have improved by 8% following the implementation of the premium loyalty program. The ROI looks promising at 145%.",
//   ],
//   insights: [
//     "The data suggests users who engage with our tutorial content are 3x more likely to convert to paid plans within 30 days.",
//     "There's a strong correlation between social media mentions and a 12% boost in website traffic. Instagram drives the highest quality leads.",
//     "Our analysis indicates that customers using feature X have a 45% lower churn rate compared to those who don't.",
//   ],
//   reports: [
//     "I can generate a comprehensive Q3 performance report showing revenue growth, user acquisition costs, and customer satisfaction metrics.",
//     "The financial dashboard indicates a healthy 18% profit margin with operational costs decreasing by 7% quarter-over-quarter.",
//     "Would you like me to prepare a competitor analysis report focusing on market share and feature comparisons?",
//   ],
//   general: [
//     "I can help you analyze business metrics, generate reports, and provide data-driven insights. What specific area would you like to explore?",
//     "Based on available data, I notice several optimization opportunities in your customer journey. Would you like me to elaborate?",
//     "I'm ready to assist with data analysis, trend identification, and strategic recommendations for your business.",
//   ],
// };

// export function generateAIResponse(message) {
//   const lowerMessage = message.toLowerCase();

//   if (
//     lowerMessage.includes("analytics") ||
//     lowerMessage.includes("data") ||
//     lowerMessage.includes("metric")
//   ) {
//     return aiResponses.analytics[
//       Math.floor(Math.random() * aiResponses.analytics.length)
//     ];
//   } else if (
//     lowerMessage.includes("insight") ||
//     lowerMessage.includes("trend") ||
//     lowerMessage.includes("pattern")
//   ) {
//     return aiResponses.insights[
//       Math.floor(Math.random() * aiResponses.insights.length)
//     ];
//   } else if (
//     lowerMessage.includes("report") ||
//     lowerMessage.includes("dashboard") ||
//     lowerMessage.includes("summary")
//   ) {
//     return aiResponses.reports[
//       Math.floor(Math.random() * aiResponses.reports.length)
//     ];
//   } else if (
//     lowerMessage.includes("hello") ||
//     lowerMessage.includes("hi") ||
//     lowerMessage.includes("hey")
//   ) {
//     return "Hello! I'm your Enterprise AI Analyst. I can help you with business analytics, data insights, and performance reports. What would you like to know?";
//   } else {
//     return aiResponses.general[
//       Math.floor(Math.random() * aiResponses.general.length)
//     ];
//   }
// }
