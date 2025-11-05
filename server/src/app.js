import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Fix CORS configuration
app.use(
  cors({
    origin: [
      process.env.CORS || "http://localhost:5173",
      process.env.CORS1 || "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import Route
import chatRoutes from "./routes/chat.route.js";
// Mount routes under /api/v1
app.use("/api", chatRoutes);

// // Import User route
import { router } from "./routes/user.route.js";
// route declaration
app.use("/api/v1/users", router);

// Health Check (keep centralized)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Enterprise AI Analyst Backend",
    uptime: process.uptime(),
  });
});

// Test Route (kept for convenience)
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Very Important: after all routes
app.use(errorHandler);

export { app };
